const User = require("../models/User");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt");

exports.register = async (req, res) => {
    console.log("regg....");

    try {
        const { name, email, phone, password } = req.body;

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ message: "Phone number already registered" });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password
        });

        if (user) {
            const accessToken = generateAccessToken({ id: user._id });
            const refreshToken = generateRefreshToken({ id: user._id });

            user.refreshToken = refreshToken;
            await user.save();

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: accessToken,
                refreshToken: refreshToken,
            });
        }
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};

exports.login = async (req, res) => {
    console.log("log...");

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "No account found with this email" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const accessToken = generateAccessToken({ id: user._id });
        const refreshToken = generateRefreshToken({ id: user._id });

        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            token: accessToken,
            refreshToken: refreshToken,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: "Refresh token is required" });

        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({ id: user._id });

        // Industry standard: rotate refresh token
        const newRefreshToken = generateRefreshToken({ id: user._id });
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        res.status(401).json({ message: error.message || "Invalid refresh token" });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    console.log("update profile...");

    try {
        const { name, phone } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (req.file) {
            user.avatar = req.file.path; // Cloudinary URL
        }

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server error during profile update" });
    }
};
