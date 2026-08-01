const Business = require("../models/Business");
const User = require("../models/User");

exports.registerBusiness = async (req, res) => {
    try {
        const { shopName, ownerName, phone, location, businessType, email } = req.body;
        const thumbnail = req.file ? req.file.path : undefined;

        const business = await Business.create({
            ownerId: req.user._id,
            shopName,
            ownerName,
            phone,
            location,
            businessType,
            email,
            thumbnail,
            status: "Pending",
            promoCode: "PROMO-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        });

        res.status(201).json(business);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find({ ownerId: req.user._id });
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (req.file) {
            updateData.thumbnail = req.file.path;
        }

        const business = await Business.findOneAndUpdate(
            { _id: id, ownerId: req.user._id },
            updateData,
            { new: true }
        );
        if (business) {
            res.json(business);
        } else {
            res.status(404).json({ message: "Business not found or unauthorized" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find({ status: "Approved" });
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
