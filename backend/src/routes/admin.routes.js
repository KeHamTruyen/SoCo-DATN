import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

// UC4.1 – Account Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle-active', adminController.toggleUserActive);
router.patch('/users/:id/role', adminController.changeUserRole);

// UC4.2 – Content Management
router.get('/posts', adminController.getPosts);
router.delete('/posts/:id', adminController.deletePost);
router.get('/products', adminController.getProducts);
router.delete('/products/:id', adminController.deleteProduct);

// UC4.4 – Analytics Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/dashboard/growth', adminController.getGrowthStats);

export default router;
