const Notification = require("../models/Notification");

const fs = require("fs");
const path = require("path");

const logToFile = (msg) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(path.join(__dirname, "../notification_debug.log"), `[${timestamp}] ${msg}\n`);
};

exports.createNotification = async (req, res) => {
    try {
        const { title, message, type, targetUser } = req.body;
        logToFile(`Creating notification: ${title} (${type})`);

        const notification = await Notification.create({
            title,
            message,
            type: type || "global",
            targetUser: type === "private" ? targetUser : null,
        });

        logToFile(`Notification created successfully: ${notification._id}`);
        res.status(201).json(notification);
    } catch (error) {
        logToFile(`Error creating notification: ${error.message}`);
        res.status(500).json({ message: "Error creating notification", error: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user?._id;
        logToFile(`Fetching notifications for user: ${userId || 'Guest'}`);

        // If user is logged in, show global + private. If guest, show only global.
        const query = userId
            ? { $or: [{ type: "global" }, { targetUser: userId }] }
            : { type: "global" };

        const notifications = await Notification.find(query).sort({ createdAt: -1 });

        logToFile(`Found ${notifications.length} notifications`);
        res.status(200).json(notifications);
    } catch (error) {
        logToFile(`Error fetching notifications: ${error.message}`);
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error updating notification", error: error.message });
    }
};

// Admin only: Get all notifications
exports.getAllNotificationsAdmin = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
};

// Admin only: Delete notification
exports.deleteNotificationAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting notification", error: error.message });
    }
};
