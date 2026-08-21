const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middlewares/authMiddleware");
const { couponUpload } = require("../utils/cloudinary");

const handleCouponImageUpload = (req, res, next) => {
    return couponUpload.single("image")(req, res, (err) => {
        if (err) {
            console.error("Coupon image multer error:", err);
            return res.status(400).json({ message: err.message || "Image upload failed" });
        }
        next();
    });
};

// Public routes
router.get("/featured", couponController.getFeaturedCoupons);
router.get("/", couponController.getAllCoupons);

// Protected routes (Vendor only)
router.post("/upload-image", authMiddleware, handleCouponImageUpload, couponController.uploadCouponImage);
router.post("/", authMiddleware, couponController.createCoupon);
router.get("/business", authMiddleware, couponController.getBusinessCoupons);
router.patch("/:id", authMiddleware, couponController.updateCoupon);
router.delete("/:id", authMiddleware, couponController.deleteCoupon);

module.exports = router;
