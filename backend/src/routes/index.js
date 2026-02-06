import express from 'express';
import authRoutes from './auth.routes.js';

const router = express.Router();

// Import routes
// import userRoutes from './user.routes.js';
// import productRoutes from './product.routes.js';
// ... etc

// Use routes
router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);

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
