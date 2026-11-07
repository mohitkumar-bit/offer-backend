const Coupon = require("../models/Coupon");
const Business = require("../models/Business");
const SavedOffer = require("../models/SavedOffer");
const { resolveUploadedFileUrl, isRemoteImageUrl } = require("../utils/uploadUtils");

const { getApprovedBusinessIdsForLocation } = require("../utils/locationQuery");

const publicCouponFilter = async (extraQuery = {}, location = {}) => {
    const approvedBusinessIds = await getApprovedBusinessIdsForLocation(
        location.state,
        location.city
    );

    const now = new Date();

    return {
        ...extraQuery,
        isActive: true,
        businessId: { $in: approvedBusinessIds },
        $and: [
            {
                $or: [
                    { status: "Approved" },
                    { status: { $exists: false } },
                ],
            },
            {
                $or: [
                    { expiryDate: null },
                    { expiryDate: { $exists: false } },
                    { expiryDate: { $gte: now } },
                    { expiryDate: { $gte: now.toISOString() } },
                ],
            },
        ],
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

        const couponData = {
            ...req.body,
            businessId,
            location: business.location,
            state: business.state,
            city: business.city,
            status: "Pending",
            isActive: false,
        };

        delete couponData.image;

        const uploadedImage = resolveUploadedFileUrl(req.file);
        if (uploadedImage) {
            couponData.image = uploadedImage;
        } else if (isRemoteImageUrl(req.body.image)) {
            couponData.image = req.body.image.trim();
        }

        const coupon = await Coupon.create(couponData);

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadCouponImage = async (req, res) => {
    try {
        const imageUrl = resolveUploadedFileUrl(req.file);

        if (!imageUrl) {
            console.error("Coupon image upload: no file received", {
                contentType: req.headers["content-type"],
            });
            return res.status(400).json({ message: "No image uploaded. Please select a photo and try again." });
        }

        res.status(201).json({ imageUrl });
    } catch (error) {
        console.error("Coupon image upload error:", error);
        res.status(500).json({ message: "Error uploading offer image", error: error.message });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const { businessId, state, city } = req.query;
        const extraQuery = businessId ? { businessId } : {};
        const query = await publicCouponFilter(extraQuery, { state, city });

        const coupons = await Coupon.find(query).populate(
            "businessId",
            "shopName thumbnail status state city location"
        );
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFeaturedCoupons = async (req, res) => {
    try {
        const { state, city } = req.query;
        const query = await publicCouponFilter({ isFeatured: true }, { state, city });

        const coupons = await Coupon.find(query)
            .populate("businessId", "shopName thumbnail status state city location")
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
        delete updateData.image;

        const uploadedImage = resolveUploadedFileUrl(req.file);
        if (uploadedImage) {
            updateData.image = uploadedImage;
        } else if (isRemoteImageUrl(req.body.image)) {
            updateData.image = req.body.image.trim();
        }

        // When a vendor updates an offer, re-submit for admin approval
        updateData.status = "Pending";
        updateData.isActive = false;
        updateData.isFeatured = false;

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
        await SavedOffer.deleteMany({ offerId: req.params.id });

        res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
