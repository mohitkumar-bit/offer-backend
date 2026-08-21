const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "offer-businesses",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage: storage });

const bannerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "offer-banners",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
});

const bannerUpload = multer({ storage: bannerStorage });

const couponStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "offer-coupons",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
});

const couponUpload = multer({ storage: couponStorage });

const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "offer-avatars",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
});

const avatarUpload = multer({ storage: avatarStorage });

module.exports = { cloudinary, upload, bannerUpload, couponUpload, avatarUpload };
