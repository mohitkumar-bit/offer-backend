const mongoose = require("mongoose");

const bannerImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: true });

const homeBannerSchema = new mongoose.Schema({
    tag: {
        type: String,
        default: "HOT DEALS",
    },
    title: {
        type: String,
        default: "Mega Deals",
    },
    subtitle: {
        type: String,
        default: "Up to 50% OFF this week",
    },
    discount: {
        type: String,
        default: "50",
    },
    discountLabel: {
        type: String,
        default: "OFF",
    },
    linkCategory: {
        type: String,
        default: "Fashion",
    },
    activeImageUrl: {
        type: String,
        default: null,
    },
    activeImageUrls: {
        type: [String],
        default: [],
    },
    bannerEnabled: {
        type: Boolean,
        default: true,
    },
    imageOnly: {
        type: Boolean,
        default: false,
    },
    imageLibrary: [bannerImageSchema],
}, { timestamps: true });

module.exports = mongoose.model("HomeBanner", homeBannerSchema);
