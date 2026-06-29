import express from 'express';
import {
  getDashboardStats,
  getUsers,
  toggleBlockUser
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// Restrict all routes in this file to Admin users
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);

export default router;
