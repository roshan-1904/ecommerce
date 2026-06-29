import express from 'express';
import {
  getProductReviews,
  createReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { uploadReview } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Private routes
router.post('/', protect, uploadReview.array('images', 3), createReview);
router.delete('/:id', protect, deleteReview);

export default router;
