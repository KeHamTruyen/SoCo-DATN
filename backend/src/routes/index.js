import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import uploadRoutes from './upload.routes.js';
import postRoutes from './post.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import userRoutes from './user.routes.js';
import messageRoutes from './message.routes.js';
import notificationRoutes from './notification.routes.js';
import sellerRoutes from './seller.routes.js';
import reviewRoutes from './review.routes.js';
import groupRoutes from './group.routes.js';
import scheduledPostRoutes from './scheduled-post.routes.js';

const router = express.Router();

// Use routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/posts', postRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/seller', sellerRoutes);
router.use('/reviews', reviewRoutes);
router.use('/groups', groupRoutes);
router.use('/scheduled-posts', scheduledPostRoutes);

// Temporary welcome route
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
      scheduledPosts: '/api/scheduled-posts',
      groups: '/api/groups',
      messages: '/api/messages',
      notifications: '/api/notifications',
      seller: '/api/seller'
    }
  });
});

export default router;
