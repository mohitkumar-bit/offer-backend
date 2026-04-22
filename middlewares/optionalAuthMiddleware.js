const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");

const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return next();
        }

        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id).select("-password");

        if (user) {
            req.user = user;
        }
        next();
    } catch (error) {
        // If token is invalid, we don't block, we just don't attach the user
        // This is useful for routes that are public but can be personalized
        console.error("Optional Auth Middleware (Invalid Token):", error.message);
        next();
    }
};

module.exports = optionalAuthMiddleware;
