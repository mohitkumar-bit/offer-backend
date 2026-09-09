require("dotenv").config();
const mongoose = require("mongoose");
const State = require("../models/State");
const City = require("../models/City");

const indiaStates = require("./data/india-states.json");
const indiaCities = require("./data/india-cities.json");

const BATCH_SIZE = 500;

async function seedLocations() {
    if (!process.env.URL_DB) {
        console.error("URL_DB is not set in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.URL_DB);

    const shouldReset = process.argv.includes("--fresh");
    if (shouldReset) {
        const cityCount = await City.countDocuments();
        const stateCount = await State.countDocuments();
        await City.deleteMany({});
        await State.deleteMany({});
        console.log(`Cleared ${stateCount} states and ${cityCount} cities.\n`);
    }

    console.log(`Seeding ${indiaStates.length} Indian states...`);

    const stateIdByCode = new Map();
    let statesCreated = 0;
    let statesUpdated = 0;

    for (const state of indiaStates) {
        const existing = await State.findOne({
            $or: [{ code: state.code }, { name: state.name }],
        });

        if (existing) {
            existing.name = state.name;
            existing.code = state.code;
            existing.isActive = true;
            await existing.save();
            stateIdByCode.set(state.code, existing._id);
            statesUpdated++;
        } else {
            const created = await State.create({
                name: state.name,
                code: state.code,
                isActive: true,
            });
            stateIdByCode.set(state.code, created._id);
            statesCreated++;
        }
    }

    console.log(`States ready: ${statesCreated} created, ${statesUpdated} updated.`);

    console.log(`Seeding ${indiaCities.length} Indian cities...`);

    let citiesCreated = 0;
    let citiesSkipped = 0;
    const cityOps = [];

    for (const city of indiaCities) {
        const stateId = stateIdByCode.get(city.stateCode);
        if (!stateId) {
            citiesSkipped++;
            continue;
        }

        cityOps.push({
            updateOne: {
                filter: { stateId, name: city.name },
                update: {
                    $setOnInsert: {
                        stateId,
                        name: city.name,
                        isActive: true,
                    },
                },
                upsert: true,
            },
        });
    }

    for (let i = 0; i < cityOps.length; i += BATCH_SIZE) {
        const batch = cityOps.slice(i, i + BATCH_SIZE);
        const result = await City.bulkWrite(batch, { ordered: false });
        citiesCreated += result.upsertedCount || 0;
    }

    const totalStates = await State.countDocuments();
    const totalCities = await City.countDocuments();

    console.log(`Cities ready: ${citiesCreated} created, ${citiesSkipped} skipped (no state match).`);
    console.log(`\nDone. Database now has ${totalStates} states and ${totalCities} cities.`);

    await mongoose.disconnect();
}

seedLocations().catch(async (err) => {
    console.error("Failed to seed locations:", err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
