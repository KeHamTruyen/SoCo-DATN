import express from 'express';
import * as savedItemController from '../controllers/savedItem.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/lookup', savedItemController.lookupSavedItem);
router.get('/', savedItemController.listSavedItems);
router.post('/', savedItemController.addSavedItem);
router.delete('/:id', savedItemController.removeSavedItem);

export default router;
