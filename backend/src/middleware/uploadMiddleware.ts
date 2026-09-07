import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

export const isCloudinaryReady = (): boolean => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export const configureCloudinary = () => {
  if (isCloudinaryReady()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
      api_key: process.env.CLOUDINARY_API_KEY?.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    });
  }
};

configureCloudinary();

export const uploadToCloudinary = (fileBuffer: Buffer, folder = 'wayamba_products'): Promise<string> => {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed'));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};


const isVercel = process.env.VERCEL === '1';

// Ensure upload directory exists if filesystem is writable
const uploadDir = path.join(__dirname, '../../public/uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch {
  // Read-only filesystem in serverless environments
}

// Use memory storage so router has access to file.buffer for Cloudinary, local disk fallback, or data URL fallback
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = /\.(jpeg|jpg|png|webp|gif|svg|avif|jfif|bmp|ico)$/i;
  const isImageMime = file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream');
  const hasImageExt = allowedExtensions.test(file.originalname);

  if (isImageMime || hasImageExt) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, WEBP, GIF, SVG, AVIF, BMP)'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit per file
  fileFilter,
});

export { cloudinary };


