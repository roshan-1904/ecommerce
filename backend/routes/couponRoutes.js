import express from 'express';
import {
  createCoupon,
  getCoupons,
  validateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// Private route for any authorized logged in user
router.post('/validate', protect, validateCoupon);

// Admin-only management routes
router.use(protect, authorize('admin'));

router.route('/')
  .get(getCoupons)
  .post(createCoupon);

router.route('/:id')
  .delete(deleteCoupon);

export default router;
