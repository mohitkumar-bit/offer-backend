const User = require("../models/User");
const Business = require("../models/Business");
const Coupon = require("../models/Coupon");

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBusinesses = await Business.countDocuments();
        const pendingBusinesses = await Business.countDocuments({ status: "Pending" });
        const totalCoupons = await Coupon.countDocuments();
        const pendingCoupons = await Coupon.countDocuments({ status: "Pending" });
        const approvedCoupons = await Coupon.countDocuments({
            $or: [{ status: "Approved" }, { status: { $exists: false } }],
            isActive: true,
        });
        const featuredCoupons = await Coupon.countDocuments({
            isFeatured: true,
            isActive: true,
            $or: [{ status: "Approved" }, { status: { $exists: false } }],
        });

        res.status(200).json({
            totalUsers,
            totalBusinesses,
            pendingBusinesses,
            totalCoupons,
            pendingCoupons,
            approvedCoupons,
            featuredCoupons,
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Server error fetching analytics" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

exports.getAllBusinesses = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const businesses = await Business.find(filter)
            .populate("ownerId", "name email")
            .sort({ createdAt: -1 });

        const businessIds = businesses.map((b) => b._id);
        const postCounts = await Coupon.aggregate([
            { $match: { businessId: { $in: businessIds } } },
            { $group: { _id: "$businessId", count: { $sum: 1 } } },
        ]);

        const countMap = Object.fromEntries(
            postCounts.map((item) => [item._id.toString(), item.count])
        );

        const businessesWithCounts = businesses.map((business) => ({
            ...business.toObject(),
            postCount: countMap[business._id.toString()] || 0,
        }));

        res.status(200).json(businessesWithCounts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching businesses", error: error.message });
    }
};

exports.verifyBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting 'Approved' or 'Rejected'

        if (!status || !["Approved", "Rejected", "Pending", "Blocked"].includes(status)) {
            return res.status(400).json({ message: "Invalid status provided" });
        }

        const business = await Business.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.status(200).json({ message: `Business ${status} successfully`, business });
    } catch (error) {
        res.status(500).json({ message: "Error updating business status", error: error.message });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const { status, businessId } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (businessId) filter.businessId = businessId;

        const coupons = await Coupon.find(filter)
            .populate({
                path: "businessId",
                select: "shopName ownerId",
                populate: {
                    path: "ownerId",
                    select: "name email"
                }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: "Error fetching coupons", error: error.message });
    }
};

exports.toggleUserBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user
        });
    } catch (error) {
        res.status(500).json({ message: "Error toggling user block status", error: error.message });
    }
};

exports.verifyCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !["Approved", "Rejected", "Pending"].includes(status)) {
            return res.status(400).json({ message: "Invalid status provided" });
        }

        const updateData = { status };
        if (status === "Approved") {
            updateData.isActive = true;
        } else if (status === "Rejected") {
            updateData.isActive = false;
            updateData.isFeatured = false;
        }

        const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true }).populate({
            path: "businessId",
            select: "shopName ownerId",
            populate: { path: "ownerId", select: "name email" },
        });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.status(200).json({ message: `Coupon ${status} successfully`, coupon });
    } catch (error) {
        res.status(500).json({ message: "Error updating coupon status", error: error.message });
    }
};

exports.toggleCouponFeature = async (req, res) => {
    try {
        const { id } = req.params;
        const { isFeatured } = req.body;

        if (typeof isFeatured !== "boolean") {
            return res.status(400).json({ message: "isFeatured must be a boolean" });
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        const isApproved = coupon.status === "Approved" || !coupon.status;
        if (isFeatured && (!isApproved || !coupon.isActive)) {
            return res.status(400).json({
                message: "Only approved and live offers can be featured",
            });
        }

        coupon.isFeatured = isFeatured;
        await coupon.save();

        const populated = await Coupon.findById(id).populate({
            path: "businessId",
            select: "shopName ownerId thumbnail",
            populate: { path: "ownerId", select: "name email" },
        });

        res.status(200).json({
            message: isFeatured ? "Offer featured successfully" : "Offer removed from featured",
            coupon: populated,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating featured status", error: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByIdAndDelete(id);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting coupon", error: error.message });
    }
};
