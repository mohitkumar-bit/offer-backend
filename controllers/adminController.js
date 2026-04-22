const User = require("../models/User");
const Business = require("../models/Business");
const Coupon = require("../models/Coupon");

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBusinesses = await Business.countDocuments();
        const pendingBusinesses = await Business.countDocuments({ status: "Pending" });
        const totalCoupons = await Coupon.countDocuments();

        res.status(200).json({
            totalUsers,
            totalBusinesses,
            pendingBusinesses,
            totalCoupons,
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
        const { status } = req.query; // optional filter
        const filter = status ? { status } : {};
        const businesses = await Business.find(filter)
            .populate("ownerId", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(businesses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching businesses", error: error.message });
    }
};

exports.verifyBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting 'Approved' or 'Rejected'

        if (!status || !["Approved", "Rejected", "Pending"].includes(status)) {
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
        const coupons = await Coupon.find()
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
