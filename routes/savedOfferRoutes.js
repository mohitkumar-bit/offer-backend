const express = require("express");
const router = express.Router();
const savedOfferController = require("../controllers/savedOfferController");
const protect = require("../middlewares/authMiddleware");

router.post("/toggle", protect, savedOfferController.toggleSave);
router.get("/my-saves", protect, savedOfferController.getMySavedOffers);

module.exports = router;
