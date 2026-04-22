const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// All routes here are strictly for administrators
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin Dashboard stats
router.get("/dashboard", adminController.getDashboardStats);

// Users Management
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/block", adminController.toggleUserBlock);

// Businesses & Verifications
router.get("/businesses", adminController.getAllBusinesses);
router.put("/businesses/:id/verify", adminController.verifyBusiness);

// Coupons Management
router.get("/coupons", adminController.getAllCoupons);
router.delete("/coupons/:id", adminController.deleteCoupon);

// Notifications
const notificationController = require("../controllers/notificationController");
router.post("/notifications", notificationController.createNotification);
router.get("/notifications", notificationController.getAllNotificationsAdmin);
router.delete("/notifications/:id", notificationController.deleteNotificationAdmin);

module.exports = router;
