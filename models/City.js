const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

citySchema.index({ stateId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("City", citySchema);
