const HomeBanner = require("../models/HomeBanner");

const DEFAULT_BANNER = {
    tag: "HOT DEALS",
    title: "Mega Deals",
    subtitle: "Up to 50% OFF this week",
    discount: "50",
    discountLabel: "OFF",
    linkCategory: "Fashion",
    activeImageUrl: null,
    activeImageUrls: [],
    bannerEnabled: true,
    imageOnly: false,
    imageLibrary: [],
};

const normalizeBanner = (banner) => {
    if ((!banner.activeImageUrls || banner.activeImageUrls.length === 0) && banner.activeImageUrl) {
        banner.activeImageUrls = [banner.activeImageUrl];
    }

    banner.activeImageUrls = (banner.activeImageUrls || []).filter((url) =>
        banner.imageLibrary.some((img) => img.url === url)
    );

    if (banner.activeImageUrls.length > 0) {
        banner.activeImageUrl = banner.activeImageUrls[0];
    } else {
        banner.activeImageUrl = null;
    }

    return banner;
};

const getOrCreateBanner = async () => {
    let banner = await HomeBanner.findOne();
    if (!banner) {
        banner = await HomeBanner.create(DEFAULT_BANNER);
    }

    normalizeBanner(banner);
    return banner;
};

const toPublicBanner = (banner) => ({
    tag: banner.tag,
    title: banner.title,
    subtitle: banner.subtitle,
    discount: banner.discount,
    discountLabel: banner.discountLabel,
    linkCategory: banner.linkCategory,
    activeImageUrl: banner.activeImageUrl,
    activeImageUrls: banner.bannerEnabled ? banner.activeImageUrls || [] : [],
    bannerEnabled: banner.bannerEnabled,
    imageOnly: banner.imageOnly,
});

exports.getPublicBanner = async (req, res) => {
    try {
        const banner = await getOrCreateBanner();
        res.json(toPublicBanner(banner));
    } catch (error) {
        res.status(500).json({ message: "Error fetching banner", error: error.message });
    }
};

exports.getAdminBanner = async (req, res) => {
    try {
        const banner = await getOrCreateBanner();
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: "Error fetching banner", error: error.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const banner = await getOrCreateBanner();
        const {
            tag,
            title,
            subtitle,
            discount,
            discountLabel,
            linkCategory,
            activeImageUrl,
            activeImageUrls,
            bannerEnabled,
            imageOnly,
        } = req.body;

        if (tag !== undefined) banner.tag = tag;
        if (title !== undefined) banner.title = title;
        if (subtitle !== undefined) banner.subtitle = subtitle;
        if (discount !== undefined) banner.discount = discount;
        if (discountLabel !== undefined) banner.discountLabel = discountLabel;
        if (linkCategory !== undefined) banner.linkCategory = linkCategory;
        if (bannerEnabled !== undefined) banner.bannerEnabled = Boolean(bannerEnabled);
        if (imageOnly !== undefined) banner.imageOnly = Boolean(imageOnly);

        if (activeImageUrls !== undefined) {
            if (!Array.isArray(activeImageUrls)) {
                return res.status(400).json({ message: "activeImageUrls must be an array" });
            }

            const invalid = activeImageUrls.filter(
                (url) => !banner.imageLibrary.some((img) => img.url === url)
            );
            if (invalid.length > 0) {
                return res.status(400).json({ message: "One or more selected images are not in the library" });
            }

            banner.activeImageUrls = activeImageUrls;
        } else if (activeImageUrl !== undefined) {
            if (activeImageUrl && !banner.imageLibrary.some((img) => img.url === activeImageUrl)) {
                return res.status(400).json({ message: "Selected image is not in the library" });
            }
            banner.activeImageUrls = activeImageUrl ? [activeImageUrl] : [];
        }

        normalizeBanner(banner);
        await banner.save();
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: "Error updating banner", error: error.message });
    }
};

exports.uploadBannerImages = async (req, res) => {
    try {
        const banner = await getOrCreateBanner();
        const files = req.files || [];
        const addToSlider = req.body.addToSlider !== "false";

        if (files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }

        const newImages = files.map((file) => ({
            url: file.path,
            uploadedAt: new Date(),
        }));

        banner.imageLibrary = [...newImages, ...banner.imageLibrary];

        if (addToSlider) {
            const newUrls = newImages.map((img) => img.url);
            banner.activeImageUrls = [...newUrls, ...(banner.activeImageUrls || [])];
            banner.bannerEnabled = true;
        }

        normalizeBanner(banner);
        await banner.save();
        res.status(201).json(banner);
    } catch (error) {
        res.status(500).json({ message: "Error uploading banner images", error: error.message });
    }
};

exports.deleteBannerImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const banner = await getOrCreateBanner();
        const image = banner.imageLibrary.id(imageId);

        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        banner.activeImageUrls = (banner.activeImageUrls || []).filter((url) => url !== image.url);
        banner.imageLibrary.pull({ _id: imageId });

        normalizeBanner(banner);
        await banner.save();
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: "Error deleting banner image", error: error.message });
    }
};

exports.deactivateBannerImages = async (req, res) => {
    try {
        const banner = await getOrCreateBanner();
        banner.activeImageUrls = [];
        banner.bannerEnabled = false;
        normalizeBanner(banner);
        await banner.save();
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: "Error deactivating banner images", error: error.message });
    }
};
