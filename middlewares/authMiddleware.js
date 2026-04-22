const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log(`[Auth] Path: ${req.path}, Token: ${token ? 'Present' : 'Missing'}`);
        if (!token) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }

        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ message: error.message || "Token is not valid" });
    }
};

module.exports = authMiddleware;
