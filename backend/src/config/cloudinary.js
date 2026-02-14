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
  
  // Example URL: https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg
  // Public ID: sample
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  
  // Include folder path
  const folderIndex = parts.indexOf('upload') + 1;
  if (folderIndex > 0 && folderIndex < parts.length - 1) {
    const folders = parts.slice(folderIndex + 1, parts.length - 1);
    return folders.length > 0 ? `${folders.join('/')}/${publicId}` : publicId;
  }
  
  return publicId;
};

export {
  cloudinary,
  uploadProduct,
  uploadAvatar,
  uploadPost,
  deleteImage,
  getPublicIdFromUrl,
};
