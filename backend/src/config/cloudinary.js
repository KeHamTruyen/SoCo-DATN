import cloudinaryLib from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const cloudinary = cloudinaryLib.v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-commerce/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
  },
});

// Create storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-commerce/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' }
    ],
  },
});

// Create storage for posts
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-commerce/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4'],
    resource_type: 'auto', // Supports both images and videos
    transformation: [
      { width: 1080, height: 1080, crop: 'limit' },
      { quality: 'auto' }
    ],
  },
});

// Create storage for message attachments
const messageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-commerce/messages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'pdf', 'doc', 'docx', 'txt'],
    resource_type: 'auto',
    transformation: [
      { width: 1280, height: 1280, crop: 'limit' },
      { quality: 'auto' }
    ],
  },
});

const sellerVerificationStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-commerce/seller-verifications',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    resource_type: 'auto'
  }
});

// Multer upload middleware
const uploadProduct = multer({ 
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

const uploadPost = multer({ 
  storage: postStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadMessage = multer({
  storage: messageStorage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

const uploadSellerVerification = multer({
  storage: sellerVerificationStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadBufferToCloudinary = (buffer, options = {}) => new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(result);
  });

  uploadStream.end(buffer);
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;

  const marker = '/upload/';
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const rawPath = url.slice(markerIndex + marker.length).split('?')[0];
  const pathWithoutVersion = rawPath.replace(/^v\d+\//, '');
  const extIndex = pathWithoutVersion.lastIndexOf('.');

  if (extIndex === -1) {
    return pathWithoutVersion;
  }

  return pathWithoutVersion.slice(0, extIndex);
};

export {
  cloudinary,
  uploadProduct,
  uploadAvatar,
  uploadPost,
  uploadMessage,
  uploadSellerVerification,
  uploadBufferToCloudinary,
  deleteImage,
  getPublicIdFromUrl,
};
