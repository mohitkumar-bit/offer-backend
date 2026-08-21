const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const { avatarUpload } = require("../utils/cloudinary");

const handleAvatarUpload = (req, res, next) => {
    avatarUpload.single("avatar")(req, res, (err) => {
        if (err) {
            console.error("Avatar upload multer error:", err);
            return res.status(400).json({ message: err.message || "Image upload failed" });
        }
        next();
    });
};

const withOptionalAvatarUpload = (req, res, next) => {
    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("multipart/form-data")) {
        return avatarUpload.single("avatar")(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message || "Image upload failed" });
            }
            next();
        });
    }

    next();
};

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", authMiddleware, authController.getMe);
router.post("/avatar", authMiddleware, handleAvatarUpload, authController.uploadAvatar);
router.patch("/update", authMiddleware, withOptionalAvatarUpload, authController.updateProfile);
router.patch("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
