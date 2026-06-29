import Product from '../models/Product.js';

// @desc    Get all products with filtering, search, sorting and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      featured,
      trending,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // 1. Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Category filter
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // 3. Brand filter
    if (brand) {
      query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    // 4. Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 5. Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // 6. Featured or Trending flags
    if (featured === 'true') {
      query.featured = true;
    }
    if (trending === 'true') {
      query.trending = true;
    }

    // Sort mapping
    let sortBy = { popularity: -1 }; // default sort
    if (sort) {
      if (sort === 'price-asc') sortBy = { price: 1 };
      else if (sort === 'price-desc') sortBy = { price: -1 };
      else if (sort === 'rating') sortBy = { rating: -1 };
      else if (sort === 'newest') sortBy = { createdAt: -1 };
    }

    // Pagination setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    // Execute query
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skipNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Increment popularity when viewed
    product.popularity += 1;
    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique brands
// @route   GET /api/products/brands
// @access  Public
export const getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand');
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      price,
      originalPrice,
      badge,
      stock,
      isNewProduct,
      featured,
      trending
    } = req.body;

    // Grab file paths if uploaded
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/product-images/${file.filename}`);
    }

    const calculatedDiscount = originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    const product = await Product.create({
      name,
      description,
      brand,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountPercentage: calculatedDiscount,
      images,
      badge,
      stock: Number(stock || 0),
      isNewProduct: isNewProduct === 'true' || isNewProduct === true,
      featured: featured === 'true' || featured === true,
      trending: trending === 'true' || trending === true
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = req.body;

    // Convert types and store in model
    if (updates.name) product.name = updates.name;
    if (updates.description) product.description = updates.description;
    if (updates.brand) product.brand = updates.brand;
    if (updates.category) product.category = updates.category;
    if (updates.price) product.price = Number(updates.price);
    if (updates.originalPrice) product.originalPrice = Number(updates.originalPrice);
    if (updates.badge !== undefined) product.badge = updates.badge;
    if (updates.stock !== undefined) product.stock = Number(updates.stock);
    if (updates.isNewProduct !== undefined) {
      product.isNewProduct = updates.isNewProduct === 'true' || updates.isNewProduct === true;
    }
    if (updates.featured !== undefined) {
      product.featured = updates.featured === 'true' || updates.featured === true;
    }
    if (updates.trending !== undefined) {
      product.trending = updates.trending === 'true' || updates.trending === true;
    }

    // Recalculate discount percentage if price/originalPrice updated
    if (updates.price || updates.originalPrice) {
      const priceVal = product.price;
      const originalPriceVal = product.originalPrice;
      if (originalPriceVal && originalPriceVal > priceVal) {
        product.discountPercentage = Math.round(((originalPriceVal - priceVal) / originalPriceVal) * 100);
      } else {
        product.discountPercentage = 0;
      }
    }

    // Append new uploaded images if exists
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/product-images/${file.filename}`);
      product.images = [...product.images, ...newImages];
    }

    // Allow deleting specific images if passed in req.body
    if (updates.deleteImages) {
      const imagesToDelete = Array.isArray(updates.deleteImages)
        ? updates.deleteImages
        : [updates.deleteImages];
      product.images = product.images.filter(img => !imagesToDelete.includes(img));
    }

    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
