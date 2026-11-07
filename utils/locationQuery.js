const Business = require("../models/Business");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeState = (state) => state?.trim().toUpperCase() || "";

const buildBusinessLocationQuery = (state, city) => {
    const query = { status: "Approved" };

    if (state?.trim()) {
        query.state = normalizeState(state);
    }

    if (city?.trim()) {
        query.city = { $regex: new RegExp(`^${escapeRegex(city.trim())}$`, "i") };
    }

    return query;
};

exports.getApprovedBusinessIdsForLocation = async (state, city) => {
    if (!state?.trim()) {
        return Business.find({ status: "Approved" }).distinct("_id");
    }

    return Business.find(buildBusinessLocationQuery(state, city)).distinct("_id");
};

exports.buildBusinessLocationQuery = buildBusinessLocationQuery;
