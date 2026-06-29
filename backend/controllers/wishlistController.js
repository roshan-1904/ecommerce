import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins do not have wishlists' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist (Add/Remove)
// @route   POST /api/wishlist
// @access  Private
export const toggleWishlist = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins do not have wishlists' });
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Please provide productId' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);

    let message;
    if (index > -1) {
      // Remove it
      wishlist.products.splice(index, 1);
      message = 'Product removed from wishlist';
    } else {
      // Add it
      wishlist.products.push(productId);
      message = 'Product added to wishlist';
    }

    await wishlist.save();
    const updatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

    res.status(200).json({ success: true, message, data: updatedWishlist });
  } catch (error) {
    next(error);
  }
};
