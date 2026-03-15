import multer from 'multer';
import sharp from 'sharp';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const memoryStorage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error('Only image files are allowed (jpeg, png, webp, gif)'));
    return;
  }

  cb(null, true);
};

export const uploadProductImagesMulter = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  }
});

const optimizeImageBuffer = async (buffer) => {
  return sharp(buffer)
    .rotate()
    .resize(1600, 1600, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
};

export const optimizeAndUploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const uploaded = await Promise.all(
      req.files.map(async (file, index) => {
        const optimizedBuffer = await optimizeImageBuffer(file.buffer);
        const cloudResult = await uploadBufferToCloudinary(optimizedBuffer, {
          folder: 'social-commerce/products',
          resource_type: 'image',
          format: 'webp',
          quality: 'auto:good'
        });

        return {
          url: cloudResult.secure_url,
          publicId: cloudResult.public_id,
          width: cloudResult.width,
          height: cloudResult.height,
          bytes: cloudResult.bytes,
          format: cloudResult.format,
          altText: req.body?.altTexts?.[index] || null
        };
      })
    );

    req.processedProductImages = uploaded;
    next();
  } catch (error) {
    next(error);
  }
};
