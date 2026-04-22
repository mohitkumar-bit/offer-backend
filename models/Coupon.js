const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    discount: {
        type: String,
        required: true,
    },
    detail: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=300&auto=format&fit=crop",
    },
    expiryDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
