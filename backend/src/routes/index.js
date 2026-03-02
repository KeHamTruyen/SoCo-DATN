import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import uploadRoutes from './upload.routes.js';
import postRoutes from './post.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import userRoutes from './user.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';
import aiRoutes from './ai.routes.js';
import scheduledPostRoutes from './scheduledPost.routes.js';

const router = express.Router();

// Existing routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/posts', postRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

// New infrastructure routes
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/scheduled-posts', scheduledPostRoutes);

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Social Commerce API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      cart: '/api/cart',
      posts: '/api/posts',
      notifications: '/api/notifications',
      admin: '/api/admin',
      ai: '/api/ai',
      scheduledPosts: '/api/scheduled-posts',
    }
  });
});

export default router;
