const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
    try {
        // req.user is set by authMiddleware which runs before this
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
    } catch (error) {
        console.error("Admin Middleware Error:", error);
        res.status(500).json({ message: "Server error during authorization" });
    }
};

module.exports = adminMiddleware;
