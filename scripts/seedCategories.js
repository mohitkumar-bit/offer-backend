require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");

const DEFAULT_CATEGORIES = [
    "Fashion",
    "Electronics",
    "Grocery",
    "Restaurants",
    "Beauty",
    "Home",
    "Automotive",
    "Sports",
    "Pharmacy",
    "Books & Stationery",
    "Other",
];

async function seedCategories() {
    if (!process.env.URL_DB) {
        console.error("URL_DB is not set in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.URL_DB);

    let created = 0;
    for (const name of DEFAULT_CATEGORIES) {
        const exists = await Category.findOne({ name });
        if (!exists) {
            await Category.create({ name });
            created++;
            console.log(`  Created: ${name}`);
        }
    }

    console.log(`\nDone. ${created} new categories added.`);
    await mongoose.disconnect();
}

seedCategories().catch((err) => {
    console.error("Failed to seed categories:", err.message);
    process.exit(1);
});
