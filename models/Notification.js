const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["global", "private"],
        default: "global",
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // Null if type is global
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
