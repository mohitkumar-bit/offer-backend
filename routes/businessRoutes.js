const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const authMiddleware = require("../middlewares/authMiddleware");
const { upload } = require("../utils/cloudinary");

router.get("/", businessController.getAllBusinesses);
router.post("/register", authMiddleware, upload.single("thumbnail"), businessController.registerBusiness);
router.get("/me", authMiddleware, businessController.getMyBusinesses);
router.patch("/:id", authMiddleware, upload.single("thumbnail"), businessController.updateBusiness);

module.exports = router;
