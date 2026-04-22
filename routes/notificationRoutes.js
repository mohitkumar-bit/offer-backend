const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware");

// User routes (getting notifications)
router.get("/", optionalAuthMiddleware, notificationController.getNotifications);
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);

module.exports = router;
