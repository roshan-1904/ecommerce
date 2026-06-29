import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { uploadProduct } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Admin-only management routes
router.post('/', protect, authorize('admin'), uploadProduct.single('image'), createCategory);
router.put('/:id', protect, authorize('admin'), uploadProduct.single('image'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
