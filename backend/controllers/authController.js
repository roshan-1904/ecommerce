import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Address from '../models/Address.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, mobile, password, location, companyName } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      location,
      companyName
    });

    if (user) {
      // Record login history
      user.lastLogin = new Date();
      user.loginHistory.push({
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      await user.save();

      const token = generateToken(res, user._id, user.role);

      res.status(201).json({
        success: true,
        token,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          profileImage: user.profileImage,
          bio: user.bio,
          location: user.location,
          companyName: user.companyName,
          addresses: user.addresses
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Record login history
    user.lastLogin = new Date();
    user.loginHistory.push({
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await user.save();

    const token = generateToken(res, user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find admin in Admin collection
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken(res, admin._id, admin.role);

    res.status(200).json({
      success: true,
      token,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    let user;
    if (req.userType === 'admin') {
      user = await Admin.findById(req.user._id);
    } else {
      user = await User.findById(req.user._id).populate('addresses');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot update details through user endpoint' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fields to update
    const { name, email, mobile, bio } = req.body;

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (bio !== undefined) user.bio = bio;

    if (email && email !== user.email) {
      // Check if email already taken
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
      }
      user.email = email;
    }

    // Process profile image upload if exists
    if (req.file) {
      user.profileImage = `/uploads/profile-images/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    let user;
    if (req.userType === 'admin') {
      user = await Admin.findById(req.user._id).select('+password');
    } else {
      user = await User.findById(req.user._id).select('+password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a user address
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot manage addresses' });
    }

    const { title, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    // Create address
    const address = await Address.create({
      user: req.user._id,
      title,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false
    });

    // If address is default, reset all other addresses default flag
    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user._id, _id: { $ne: address._id } },
        { $set: { isDefault: false } }
      );
    }

    // Add to user model references
    await User.findByIdAndUpdate(req.user._id, {
      $push: { addresses: address._id }
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user addresses
// @route   GET /api/auth/addresses
// @access  Private
export const getAddresses = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins do not have addresses' });
    }

    const addresses = await Address.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user address
// @route   PUT /api/auth/addresses/:id
// @access  Private
export const updateAddress = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot update addresses' });
    }

    let address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
    }

    const { title, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    if (title) address.title = title;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    // If default, reset others
    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user._id, _id: { $ne: address._id } },
        { $set: { isDefault: false } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
export const deleteAddress = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot delete addresses' });
    }

    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
    }

    await Address.findByIdAndDelete(req.params.id);

    // Remove from User list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
