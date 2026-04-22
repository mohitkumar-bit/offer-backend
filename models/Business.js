const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    shopName: {
        type: String,
        required: true,
    },
    ownerName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    promoCode: {
        type: String,
        unique: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Blocked"],
        default: "Pending",
    },
    businessType: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        default: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200&auto=format&fit=crop",
    },
}, { timestamps: true });

module.exports = mongoose.model("Business", businessSchema);
