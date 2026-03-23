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

// Shop branding (seller storefront — stored on User.avatarUrl / User.coverImage)
const shopLogoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-commerce/shop-logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 512, height: 512, crop: 'fill', gravity: 'center' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  },
});

const shopCoverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-commerce/shop-covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1600, height: 500, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  },
});

// Seller KYC — ID / passport scans (SellerVerification.id_card_*_url)
const sellerIdDocStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-commerce/seller-id-docs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    access_mode: 'authenticated',
    transformation: [
      { width: 2000, height: 2000, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
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

const uploadShopLogo = multer({
  storage: shopLogoStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
});

const uploadShopCover = multer({
  storage: shopCoverStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadSellerIdDoc = multer({
  storage: sellerIdDocStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/** KYC ID scans use `type: 'authenticated'` — destroy must match. */
const deleteAuthenticatedImage = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      type: 'authenticated',
    });
    return result;
  } catch (error) {
    console.error('Error deleting authenticated image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const pathname = new URL(url).pathname;
    const marker = '/upload/';
    const idx = pathname.indexOf(marker);
    if (idx === -1) return null;
    const afterUpload = pathname.slice(idx + marker.length).split('/').filter(Boolean);
    const kept = [];
    for (const seg of afterUpload) {
      if (/^v\d+$/.test(seg)) continue;
      if (seg.includes(',')) continue;
      kept.push(seg);
    }
    if (!kept.length) return null;
    const last = kept[kept.length - 1].replace(/\.[^/.]+$/, '');
    kept[kept.length - 1] = last;
    return kept.join('/') || null;
  } catch {
    return null;
  }
};

/**
 * Upload seller registration images from memory (used only after payload validation).
 * Rolls back already-uploaded assets if a later upload fails.
 * @param {{ shopLogo?: { buffer: Buffer; mimetype?: string }; shopCover?: { buffer: Buffer; mimetype?: string }; idFront: { buffer: Buffer; mimetype?: string }; idBack: { buffer: Buffer; mimetype?: string } }} files
 * @returns {Promise<{ shopLogo?: { url: string; publicId: string }; shopCover?: { url: string; publicId: string }; idFront: { url: string; publicId: string }; idBack: { url: string; publicId: string } }>}
 */
async function uploadSellerRegistrationBuffers(files) {
  const uploadedRollbacks = [];

  const rollback = async () => {
    for (const { publicId, authenticated } of uploadedRollbacks) {
      try {
        if (authenticated) {
          await deleteAuthenticatedImage(publicId);
        } else {
          await deleteImage(publicId);
        }
      } catch {
        /* best-effort */
      }
    }
  };

  const uploadOne = async (multerFile, uploadOptions) => {
    if (!multerFile?.buffer?.length) {
      throw Object.assign(new Error('Invalid image file'), { statusCode: 400 });
    }
    const mime = multerFile.mimetype || 'image/jpeg';
    const dataUri = `data:${mime};base64,${multerFile.buffer.toString('base64')}`;
    const res = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'image',
      ...uploadOptions,
    });
    uploadedRollbacks.push({
      publicId: res.public_id,
      authenticated: uploadOptions.type === 'authenticated',
    });
    return { url: res.secure_url, publicId: res.public_id };
  };

  try {
    const out = {};
    if (files.shopLogo) {
      out.shopLogo = await uploadOne(files.shopLogo, {
        folder: 'social-commerce/shop-logos',
        transformation: [
          { width: 512, height: 512, crop: 'fill', gravity: 'center' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });
    }
    if (files.shopCover) {
      out.shopCover = await uploadOne(files.shopCover, {
        folder: 'social-commerce/shop-covers',
        transformation: [
          { width: 1600, height: 500, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });
    }
    out.idFront = await uploadOne(files.idFront, {
      folder: 'social-commerce/seller-id-docs',
      type: 'authenticated',
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
    out.idBack = await uploadOne(files.idBack, {
      folder: 'social-commerce/seller-id-docs',
      type: 'authenticated',
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
    return out;
  } catch (e) {
    await rollback();
    throw e;
  }
}

function collectRegistrationPublicIds(assets) {
  return [assets.shopLogo, assets.shopCover, assets.idFront, assets.idBack]
    .filter(Boolean)
    .map((a) => a.publicId);
}

/** Signed delivery URL for authenticated-type ID images (short TTL). */
function signedAuthenticatedImageUrl(publicId, ttlSec = 3600) {
  if (!publicId) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSec;
  return cloudinary.url(publicId, {
    resource_type: 'image',
    type: 'authenticated',
    sign_url: true,
    secure: true,
    expires_at: expiresAt,
  });
}

export {
  cloudinary,
  uploadProduct,
  uploadAvatar,
  uploadPost,
  uploadShopLogo,
  uploadShopCover,
  uploadSellerIdDoc,
  deleteImage,
  deleteAuthenticatedImage,
  getPublicIdFromUrl,
  uploadSellerRegistrationBuffers,
  collectRegistrationPublicIds,
  signedAuthenticatedImageUrl,
};
