# 📸 Cloudinary Setup Guide

## Bước 1: Đăng ký Cloudinary Account (FREE)

1. Truy cập: https://cloudinary.com/users/register_free
2. Điền thông tin:
   - Email
   - Password
   - Cloud name (tự động generate, có thể đổi)
3. Verify email
4. Login vào Dashboard: https://console.cloudinary.com/

## Bước 2: Lấy API Credentials

1. Vào Dashboard: https://console.cloudinary.com/
2. Copy 3 thông tin:
   - **Cloud Name**: `dxxxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz123`

## Bước 3: Setup Backend

### 3.1. Cài đặt packages

```bash
cd backend
npm install cloudinary multer multer-storage-cloudinary
```

### 3.2. Tạo file `.env` (nếu chưa có)

```bash
# backend/.env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/social_commerce"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 3.3. Tạo file config: `backend/src/config/cloudinary.js`

```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

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

module.exports = {
  cloudinary,
  uploadProduct,
  uploadAvatar,
  uploadPost,
  deleteImage,
  getPublicIdFromUrl,
};
```

### 3.4. Tạo upload routes: `backend/src/routes/upload.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadProduct, uploadAvatar, uploadPost } = require('../config/cloudinary');

/**
 * @swagger
 * /api/upload/product:
 *   post:
 *     tags: [Upload]
 *     summary: Upload product image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     publicId:
 *                       type: string
 */
router.post('/product', protect, uploadProduct.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/upload/products:
 *   post:
 *     tags: [Upload]
 *     summary: Upload multiple product images
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
router.post('/products', protect, uploadProduct.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      data: {
        images: uploadedImages,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     tags: [Upload]
 *     summary: Upload user avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.post('/avatar', protect, uploadAvatar.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/upload/post:
 *   post:
 *     tags: [Upload]
 *     summary: Upload post media (image or video)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 */
router.post('/post', protect, uploadPost.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    res.json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        resourceType: req.file.resource_type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: error.message,
    });
  }
});

module.exports = router;
```

### 3.5. Register routes trong `backend/src/routes/index.js`

```javascript
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const uploadRoutes = require('./upload.routes'); // ADD THIS

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes); // ADD THIS

module.exports = router;
```

### 3.6. Test Backend Upload

Start backend:
```bash
cd backend
npm run dev
```

Test với curl hoặc Postman:
```bash
# Upload single image
curl -X POST http://localhost:5000/api/upload/product \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

Expected response:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/social-commerce/products/abc123.jpg",
    "publicId": "social-commerce/products/abc123"
  }
}
```

## Bước 4: Setup Frontend

### 4.1. Tạo upload service: `frontend/src/services/upload.service.ts`

```typescript
import api from './api';

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
    resourceType?: string;
  };
}

interface MultiUploadResponse {
  success: boolean;
  message: string;
  data: {
    images: Array<{
      url: string;
      publicId: string;
    }>;
  };
}

class UploadService {
  /**
   * Upload single product image
   */
  async uploadProductImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/upload/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload multiple product images
   */
  async uploadProductImages(files: File[]): Promise<MultiUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await api.post<MultiUploadResponse>('/upload/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload post media (image or video)
   */
  async uploadPostMedia(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('media', file);

    const response = await api.post<UploadResponse>('/upload/post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}

export default new UploadService();
```

### 4.2. Tạo ImageUpload component: `frontend/src/components/common/ImageUpload.tsx`

```typescript
import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import uploadService from '../../services/upload.service';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  label?: string;
  maxSize?: number; // in MB
}

export function ImageUpload({ 
  onImageUploaded, 
  currentImage, 
  label = 'Upload Image',
  maxSize = 5 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    try {
      setUploading(true);
      const response = await uploadService.uploadProductImage(file);
      onImageUploaded(response.data.url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
          />
          {!uploading && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to {maxSize}MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

## Bước 5: Test Full Flow

### 5.1. Update .env backend

```bash
CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"
```

### 5.2. Restart backend

```bash
cd backend
npm run dev
```

### 5.3. Test upload qua Swagger UI

1. Open: http://localhost:5000/api-docs
2. Find "Upload" section
3. Try POST /api/upload/product
4. Authorize với JWT token
5. Upload một ảnh test
6. Check response có URL Cloudinary

### 5.4. Use ImageUpload component

Example trong AddProductPage:

```typescript
import { ImageUpload } from '../common/ImageUpload';

// In component:
<ImageUpload
  onImageUploaded={(url) => {
    setProductImages(prev => [...prev, { url, altText: '' }]);
  }}
  label="Product Images"
  maxSize={5}
/>
```

## Bước 6: Check Cloudinary Dashboard

1. Login: https://console.cloudinary.com/
2. Go to "Media Library"
3. Find folder: `social-commerce/products`
4. Xem ảnh vừa upload
5. Click vào ảnh → Copy URL → Test trong browser

## ⚠️ Important Notes

### Free Tier Limits:
- 25 GB storage
- 25 GB bandwidth/month
- 25 credits/month for transformations

### Security Best Practices:
1. **NEVER** commit `.env` file
2. Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

3. Trong production, dùng environment variables từ hosting platform

### Image Optimization:
Cloudinary tự động:
- Convert sang WebP khi browser support
- Resize theo transformation rules
- Compress với quality: auto
- Lazy loading support

## 🎯 Next Steps

1. Update AddProductPage để dùng ImageUpload component
2. Update ProfilePage để dùng avatar upload
3. Setup upload cho CreatePostModal
4. Implement delete image functionality

---

*Last updated: February 13, 2026*
