import express from 'express';
import {
  registerUser,
  loginUser,
  loginAdmin,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadProfile } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);

// Private routes
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, uploadProfile.single('profileImage'), updateUserProfile);
router.put('/password', protect, updatePassword);

// Address management
router.post('/addresses', protect, addAddress);
router.get('/addresses', protect, getAddresses);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

export default router;
