const Coupon = require("../models/Coupon");
const Business = require("../models/Business");

exports.createCoupon = async (req, res) => {
    try {
        const { businessId } = req.body;
        if (!businessId) return res.status(400).json({ message: "businessId is required" });

        const business = await Business.findOne({ _id: businessId, ownerId: req.user._id });
        if (!business) {
            return res.status(403).json({ message: "Unauthorized: You do not own this business" });
        }

        const coupon = await Coupon.create({
            ...req.body,
            businessId,
            location: business.location,
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const { businessId } = req.query;
        const query = { isActive: true };
        if (businessId) query.businessId = businessId;

        const coupons = await Coupon.find(query).populate("businessId", "shopName thumbnail");
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBusinessCoupons = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (!businessId) return res.status(400).json({ message: "businessId is required" });

        const business = await Business.findOne({ _id: businessId, ownerId: req.user._id });
        if (!business) {
            return res.status(403).json({ message: "Unauthorized: You do not own this business" });
        }

        const coupons = await Coupon.find({ businessId });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });

        const business = await Business.findOne({ _id: coupon.businessId, ownerId: req.user._id });
        if (!business) {
            return res.status(403).json({ message: "Unauthorized: You do not own the business for this coupon" });
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCoupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });

        const business = await Business.findOne({ _id: coupon.businessId, ownerId: req.user._id });
        if (!business) {
            return res.status(403).json({ message: "Unauthorized: You do not own the business for this coupon" });
        }

        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
