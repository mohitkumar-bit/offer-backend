const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    icon: {
        type: String,
        default: "category",
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
