import express from 'express';
import {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  replyToEnquiry,
  deleteEnquiry
} from '../controllers/enquiryController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// Public route to submit enquiries
router.post('/', createEnquiry);

// Admin-only routes
router.use(protect, authorize('admin'));

router.route('/')
  .get(getEnquiries);

router.route('/:id')
  .get(getEnquiryById)
  .delete(deleteEnquiry);

router.put('/:id/reply', replyToEnquiry);

export default router;
