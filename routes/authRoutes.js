const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const { upload } = require("../utils/cloudinary");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", authMiddleware, authController.getMe);
router.patch("/update", authMiddleware, upload.single("avatar"), authController.updateProfile);

module.exports = router;
