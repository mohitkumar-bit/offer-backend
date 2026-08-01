const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public routes
router.get("/featured", couponController.getFeaturedCoupons);
router.get("/", couponController.getAllCoupons);

// Protected routes (Vendor only)
router.post("/", authMiddleware, couponController.createCoupon);
router.get("/business", authMiddleware, couponController.getBusinessCoupons);
router.patch("/:id", authMiddleware, couponController.updateCoupon);
router.delete("/:id", authMiddleware, couponController.deleteCoupon);

module.exports = router;
