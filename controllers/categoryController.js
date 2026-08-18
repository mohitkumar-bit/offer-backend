const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ name: 1 })
            .select("name");

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

exports.getAllCategoriesAdmin = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const existing = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        });

        if (existing) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = await Category.create({ name: name.trim() });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: "Error creating category", error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isActive } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const updateData = {};
        const oldName = category.name;

        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) {
                return res.status(400).json({ message: "Category name is required" });
            }

            const duplicate = await Category.findOne({
                _id: { $ne: id },
                name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
            });

            if (duplicate) {
                return res.status(400).json({ message: "Category already exists" });
            }

            updateData.name = trimmedName;
        }

        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });

        if (updateData.name && updateData.name !== oldName) {
            const Business = require("../models/Business");
            await Business.updateMany({ businessType: oldName }, { businessType: updateData.name });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error: error.message });
    }
};
