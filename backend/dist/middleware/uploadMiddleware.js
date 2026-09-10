"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.upload = exports.uploadToCloudinary = exports.configureCloudinary = exports.isCloudinaryReady = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
dotenv_1.default.config();
const isCloudinaryReady = () => {
    return Boolean(process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET);
};
exports.isCloudinaryReady = isCloudinaryReady;
const configureCloudinary = () => {
    if ((0, exports.isCloudinaryReady)()) {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
            api_key: process.env.CLOUDINARY_API_KEY?.trim(),
            api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
        });
    }
};
exports.configureCloudinary = configureCloudinary;
(0, exports.configureCloudinary)();
const uploadToCloudinary = (fileBuffer, folder = 'wayamba_products') => {
    (0, exports.configureCloudinary)();
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: 'image',
            transformation: [
                { width: 1600, height: 1600, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
            ],
        }, (error, result) => {
            if (error || !result) {
                return reject(error || new Error('Upload to Cloudinary failed'));
            }
            resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const isVercel = process.env.VERCEL === '1';
// Ensure upload directory exists if filesystem is writable
const uploadDir = path_1.default.join(__dirname, '../../public/uploads');
try {
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
}
catch {
    // Read-only filesystem in serverless environments
}
// Use memory storage so router has access to file.buffer for Cloudinary, local disk fallback, or data URL fallback
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedExtensions = /\.(jpeg|jpg|png|webp|gif|svg|avif|jfif|bmp|ico)$/i;
    const isImageMime = file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream');
    const hasImageExt = allowedExtensions.test(file.originalname);
    if (isImageMime || hasImageExt) {
        return cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed (JPEG, PNG, WEBP, GIF, SVG, AVIF, BMP)'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit per file
    fileFilter,
});
