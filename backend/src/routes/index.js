import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import uploadRoutes from './upload.routes.js';
import postRoutes from './post.routes.js';

const router = express.Router();

// Use routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/posts', postRoutes);

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
      groups: '/api/groups',
      messages: '/api/messages',
      notifications: '/api/notifications'
    }
  });
});

export default router;
