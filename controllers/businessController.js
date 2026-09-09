const Business = require("../models/Business");
const User = require("../models/User");
const Category = require("../models/Category");

const buildLocationLabel = ({ address, nearby, city, state, pincode }) => {
    let label = address?.trim() || "";
    if (nearby?.trim()) {
        label = label ? `${label}, Near ${nearby.trim()}` : `Near ${nearby.trim()}`;
    }
    if (city?.trim()) {
        label = label ? `${label}, ${city.trim()}` : city.trim();
    }
    if (state?.trim()) {
        label = label ? `${label}, ${state.trim().toUpperCase()}` : state.trim().toUpperCase();
    }
    if (pincode?.trim()) {
        label = label ? `${label} - ${pincode.trim()}` : pincode.trim();
    }
    return label;
};

exports.registerBusiness = async (req, res) => {
    try {
        const {
            shopName,
            ownerName,
            phone,
            location,
            businessType,
            email,
            state,
            city,
            address,
            pincode,
            nearby,
        } = req.body;
        const thumbnail = req.file ? req.file.path : undefined;

        if (!state?.trim()) {
            return res.status(400).json({ message: "State is required" });
        }

        if (!address?.trim()) {
            return res.status(400).json({ message: "Address is required" });
        }

        if (!pincode?.trim()) {
            return res.status(400).json({ message: "Pincode is required" });
        }

        if (!/^\d{6}$/.test(pincode.trim())) {
            return res.status(400).json({ message: "Pincode must be 6 digits" });
        }

        const normalizedState = state.trim().toUpperCase();
        const normalizedCity = city?.trim() || "";
        const normalizedAddress = address.trim();
        const normalizedPincode = pincode.trim();
        const normalizedNearby = nearby?.trim() || "";
        const locationLabel =
            location?.trim() ||
            buildLocationLabel({
                address: normalizedAddress,
                nearby: normalizedNearby,
                city: normalizedCity,
                state: normalizedState,
                pincode: normalizedPincode,
            });

        if (!businessType || !businessType.trim()) {
            return res.status(400).json({ message: "Shop category is required" });
        }

        const category = await Category.findOne({
            name: businessType.trim(),
            isActive: true,
        });

        if (!category) {
            return res.status(400).json({ message: "Invalid shop category selected" });
        }

        const business = await Business.create({
            ownerId: req.user._id,
            shopName,
            ownerName,
            phone,
            location: locationLabel,
            state: normalizedState,
            city: normalizedCity,
            address: normalizedAddress,
            pincode: normalizedPincode,
            nearby: normalizedNearby,
            businessType: businessType.trim(),
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

        if (updateData.businessType) {
            const category = await Category.findOne({
                name: updateData.businessType.trim(),
                isActive: true,
            });

            if (!category) {
                return res.status(400).json({ message: "Invalid shop category selected" });
            }

            updateData.businessType = updateData.businessType.trim();
        }

        if (req.file) {
            updateData.thumbnail = req.file.path;
        }

        if (updateData.state !== undefined) {
            updateData.state = updateData.state.trim().toUpperCase();
        }

        if (updateData.city !== undefined) {
            updateData.city = updateData.city.trim();
        }

        if (updateData.address !== undefined) {
            updateData.address = updateData.address.trim();
        }

        if (updateData.pincode !== undefined) {
            updateData.pincode = updateData.pincode.trim();
        }

        if (updateData.nearby !== undefined) {
            updateData.nearby = updateData.nearby.trim();
        }

        const shouldRebuildLocation =
            updateData.address !== undefined ||
            updateData.nearby !== undefined ||
            updateData.city !== undefined ||
            updateData.state !== undefined ||
            updateData.pincode !== undefined;

        if (shouldRebuildLocation) {
            const existing = await Business.findOne({ _id: id, ownerId: req.user._id });
            if (existing) {
                updateData.location = buildLocationLabel({
                    address: updateData.address ?? existing.address,
                    nearby: updateData.nearby ?? existing.nearby,
                    city: updateData.city ?? existing.city,
                    state: updateData.state ?? existing.state,
                    pincode: updateData.pincode ?? existing.pincode,
                });
            }
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
