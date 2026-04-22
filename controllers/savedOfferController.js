const SavedOffer = require("../models/SavedOffer");

exports.toggleSave = async (req, res) => {
    try {
        const { offerId } = req.body;
        if (!offerId) return res.status(400).json({ message: "offerId is required" });

        const userId = req.user._id;

        // Check if already saved
        const existingSave = await SavedOffer.findOne({ userId, offerId });

        if (existingSave) {
            // If saved, remove it (unsave)
            await SavedOffer.findByIdAndDelete(existingSave._id);
            return res.json({ message: "Offer unsaved", isSaved: false });
        } else {
            // If not saved, add it
            await SavedOffer.create({ userId, offerId });
            return res.status(201).json({ message: "Offer saved", isSaved: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMySavedOffers = async (req, res) => {
    try {
        const userId = req.user._id;
        // Populate the offer details, and within that populate the business details if needed
        const savedOffers = await SavedOffer.find({ userId })
            .populate({
                path: 'offerId',
                populate: {
                    path: 'businessId',
                    select: 'shopName thumbnail'
                }
            });

        // Map to return just the coupon array, keeping frontend compatibility
        const coupons = savedOffers.map(save => save.offerId).filter(Boolean); // Filter out any nulls if an offer was deleted
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
