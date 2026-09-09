const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

router.get("/states", locationController.getPublicStates);
router.get("/cities", locationController.getPublicCities);

module.exports = router;
