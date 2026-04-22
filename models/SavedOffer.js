const mongoose = require("mongoose");

const savedOfferSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        required: true,
    },
}, { timestamps: true });

// Ensure a user can only save a specific offer once
savedOfferSchema.index({ userId: 1, offerId: 1 }, { unique: true });

module.exports = mongoose.model("SavedOffer", savedOfferSchema);
