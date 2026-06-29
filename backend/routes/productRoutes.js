import express from 'express';
import {
  getProducts,
  getProductById,
  getBrands,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { uploadProduct } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/brands', getBrands);
router.get('/:id', getProductById);

// Admin-only management routes
router.post('/', protect, authorize('admin'), uploadProduct.array('images', 5), createProduct);
router.put('/:id', protect, authorize('admin'), uploadProduct.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
