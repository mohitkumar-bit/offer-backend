const State = require("../models/State");
const City = require("../models/City");

const formatCityResponse = (city) => {
    const state = city.stateId;

    return {
        _id: city._id,
        name: city.name,
        isActive: city.isActive,
        stateId: state?._id || city.stateId,
        state: state
            ? {
                _id: state._id,
                name: state.name,
                code: state.code,
                isActive: state.isActive,
            }
            : null,
        label: state ? `${city.name}, ${state.code}` : city.name,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
    };
};

exports.getPublicStates = async (req, res) => {
    try {
        const states = await State.find({ isActive: true }).sort({ name: 1 });
        res.status(200).json(states);
    } catch (error) {
        res.status(500).json({ message: "Error fetching states", error: error.message });
    }
};

exports.getPublicCities = async (req, res) => {
    try {
        const cities = await City.find({ isActive: true })
            .populate({
                path: "stateId",
                match: { isActive: true },
                select: "name code isActive",
            })
            .sort({ name: 1 });

        const activeCities = cities
            .filter((city) => city.stateId)
            .map(formatCityResponse);

        res.status(200).json(activeCities);
    } catch (error) {
        res.status(500).json({ message: "Error fetching locations", error: error.message });
    }
};

exports.getAllStatesAdmin = async (req, res) => {
    try {
        const states = await State.find().sort({ name: 1 });
        res.status(200).json(states);
    } catch (error) {
        res.status(500).json({ message: "Error fetching states", error: error.message });
    }
};

exports.createState = async (req, res) => {
    try {
        const { name, code } = req.body;

        if (!name?.trim() || !code?.trim()) {
            return res.status(400).json({ message: "State name and code are required" });
        }

        const normalizedCode = code.trim().toUpperCase();
        const existing = await State.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
                { code: normalizedCode },
            ],
        });

        if (existing) {
            return res.status(400).json({ message: "State already exists" });
        }

        const state = await State.create({
            name: name.trim(),
            code: normalizedCode,
        });

        res.status(201).json(state);
    } catch (error) {
        res.status(500).json({ message: "Error creating state", error: error.message });
    }
};

exports.updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, isActive } = req.body;

        const state = await State.findById(id);
        if (!state) {
            return res.status(404).json({ message: "State not found" });
        }

        const updateData = {};

        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) {
                return res.status(400).json({ message: "State name is required" });
            }

            const duplicate = await State.findOne({
                _id: { $ne: id },
                name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
            });

            if (duplicate) {
                return res.status(400).json({ message: "State already exists" });
            }

            updateData.name = trimmedName;
        }

        if (code !== undefined) {
            const normalizedCode = code.trim().toUpperCase();
            if (!normalizedCode) {
                return res.status(400).json({ message: "State code is required" });
            }

            const duplicate = await State.findOne({
                _id: { $ne: id },
                code: normalizedCode,
            });

            if (duplicate) {
                return res.status(400).json({ message: "State code already exists" });
            }

            updateData.code = normalizedCode;
        }

        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedState = await State.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json(updatedState);
    } catch (error) {
        res.status(500).json({ message: "Error updating state", error: error.message });
    }
};

exports.deleteState = async (req, res) => {
    try {
        const { id } = req.params;
        const cityCount = await City.countDocuments({ stateId: id });

        if (cityCount > 0) {
            return res.status(400).json({
                message: "Cannot delete state while cities are linked to it. Remove or reassign cities first.",
            });
        }

        const state = await State.findByIdAndDelete(id);
        if (!state) {
            return res.status(404).json({ message: "State not found" });
        }

        res.status(200).json({ message: "State deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting state", error: error.message });
    }
};

exports.getAllCitiesAdmin = async (req, res) => {
    try {
        const cities = await City.find()
            .populate("stateId", "name code isActive")
            .sort({ createdAt: -1 });

        res.status(200).json(cities.map(formatCityResponse));
    } catch (error) {
        res.status(500).json({ message: "Error fetching cities", error: error.message });
    }
};

exports.createCity = async (req, res) => {
    try {
        const { name, stateId } = req.body;

        if (!name?.trim() || !stateId) {
            return res.status(400).json({ message: "City name and state are required" });
        }

        const state = await State.findById(stateId);
        if (!state) {
            return res.status(400).json({ message: "Invalid state selected" });
        }

        const existing = await City.findOne({
            stateId,
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        });

        if (existing) {
            return res.status(400).json({ message: "City already exists in this state" });
        }

        const city = await City.create({
            name: name.trim(),
            stateId,
        });

        const populated = await City.findById(city._id).populate("stateId", "name code isActive");
        res.status(201).json(formatCityResponse(populated));
    } catch (error) {
        res.status(500).json({ message: "Error creating city", error: error.message });
    }
};

exports.updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, stateId, isActive } = req.body;

        const city = await City.findById(id);
        if (!city) {
            return res.status(404).json({ message: "City not found" });
        }

        const updateData = {};

        if (stateId !== undefined) {
            const state = await State.findById(stateId);
            if (!state) {
                return res.status(400).json({ message: "Invalid state selected" });
            }
            updateData.stateId = stateId;
        }

        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) {
                return res.status(400).json({ message: "City name is required" });
            }

            const duplicate = await City.findOne({
                _id: { $ne: id },
                stateId: updateData.stateId || city.stateId,
                name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
            });

            if (duplicate) {
                return res.status(400).json({ message: "City already exists in this state" });
            }

            updateData.name = trimmedName;
        }

        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedCity = await City.findByIdAndUpdate(id, updateData, { new: true }).populate(
            "stateId",
            "name code isActive"
        );

        res.status(200).json(formatCityResponse(updatedCity));
    } catch (error) {
        res.status(500).json({ message: "Error updating city", error: error.message });
    }
};

exports.deleteCity = async (req, res) => {
    try {
        const { id } = req.params;
        const city = await City.findByIdAndDelete(id);

        if (!city) {
            return res.status(404).json({ message: "City not found" });
        }

        res.status(200).json({ message: "City deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting city", error: error.message });
    }
};
