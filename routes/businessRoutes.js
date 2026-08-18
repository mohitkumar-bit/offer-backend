const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const authMiddleware = require("../middlewares/authMiddleware");
const { upload } = require("../utils/cloudinary");

const withOptionalThumbnailUpload = (req, res, next) => {
    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("multipart/form-data")) {
        return upload.single("thumbnail")(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message || "Image upload failed" });
            }
            next();
        });
    }

    next();
};

router.get("/", businessController.getAllBusinesses);
router.post("/register", authMiddleware, withOptionalThumbnailUpload, businessController.registerBusiness);
router.get("/me", authMiddleware, businessController.getMyBusinesses);
router.patch("/:id", authMiddleware, withOptionalThumbnailUpload, businessController.updateBusiness);

module.exports = router;
