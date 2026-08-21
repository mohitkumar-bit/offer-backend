const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
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
router.put("/coupons/:id/verify", adminController.verifyCoupon);
router.put("/coupons/:id/feature", adminController.toggleCouponFeature);
router.delete("/coupons/:id", adminController.deleteCoupon);

// Categories
router.get("/categories", categoryController.getAllCategoriesAdmin);
router.post("/categories", categoryController.createCategory);
router.put("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

// Home banner
const bannerController = require("../controllers/bannerController");
const { bannerUpload } = require("../utils/cloudinary");
router.get("/banner", bannerController.getAdminBanner);
router.put("/banner", bannerController.updateBanner);
router.post("/banner/images", bannerUpload.array("images", 20), bannerController.uploadBannerImages);
router.delete("/banner/images/:imageId", bannerController.deleteBannerImage);
router.put("/banner/deactivate", bannerController.deactivateBannerImages);

// Notifications
const notificationController = require("../controllers/notificationController");
router.post("/notifications", notificationController.createNotification);
router.get("/notifications", notificationController.getAllNotificationsAdmin);
router.delete("/notifications/:id", notificationController.deleteNotificationAdmin);

module.exports = router;
