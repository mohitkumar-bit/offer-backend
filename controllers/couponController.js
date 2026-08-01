const Coupon = require("../models/Coupon");
const Business = require("../models/Business");

const publicCouponFilter = async (extraQuery = {}) => {
    const approvedBusinessIds = await Business.find({ status: "Approved" }).distinct("_id");

    return {
        ...extraQuery,
        isActive: true,
        $or: [
            { status: "Approved" },
            { status: { $exists: false } },
        ],
        businessId: { $in: approvedBusinessIds },
    };
};

exports.createCoupon = async (req, res) => {
    try {
        const { businessId } = req.body;
        if (!businessId) return res.status(400).json({ message: "businessId is required" });

        const business = await Business.findOne({ _id: businessId, ownerId: req.user._id });
        if (!business) {
            return res.status(403).json({ message: "Unauthorized: You do not own this business" });
        }

        if (business.status !== "Approved") {
            return res.status(403).json({
                message: "Your business must be approved by admin before you can submit offers",
            });
        }

        const coupon = await Coupon.create({
            ...req.body,
            businessId,
            location: business.location,
            status: "Pending",
            isActive: false,
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const { businessId } = req.query;
        const extraQuery = businessId ? { businessId } : {};
        const query = await publicCouponFilter(extraQuery);

        const coupons = await Coupon.find(query).populate("businessId", "shopName thumbnail status");
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFeaturedCoupons = async (req, res) => {
    try {
        const query = await publicCouponFilter({ isFeatured: true });

        const coupons = await Coupon.find(query)
            .populate("businessId", "shopName thumbnail status")
            .sort({ updatedAt: -1 });

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

        const coupons = await Coupon.find({ businessId }).sort({ createdAt: -1 });
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

        const updateData = { ...req.body };
        delete updateData.status;
        delete updateData.isActive;
        delete updateData.isFeatured;

        const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
