import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { categories } from '../data/categories';
import CustomDropdown from './CustomDropdown';

const BRANDS = ["AuraSound", "NovaTech", "Quantum", "UrbanOutfitters", "ExecutiveStyle", "Elysian", "Vortex", "Apex", "GlowNatural", "ErgoDesign", "Craftsman", "BrewMaster", "KyotoHarvesters", "FitFlow", "STEMLabs"];

export default function CatalogPage({
  products,
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  maxPrice,
  onPriceChange,
  minRating,
  onRatingChange,
  sortBy,
  onSortChange,
  onResetFilters,
  onAddToCart,
  onAddToWishlist,
  wishlist,
  onQuickView,
  onProductClick
}) {
  const [isLoading, setIsLoading] = useState(false);

  const brandOptions = [
    { value: "", label: "All Brands" },
    ...BRANDS.map(b => ({ value: b, label: b }))
  ];

  const ratingOptions = [
    { value: 0, label: "All Ratings" },
    { value: 4.5, label: "4.5★ & Above" },
    { value: 4.0, label: "4.0★ & Above" },
    { value: 3.5, label: "3.5★ & Above" }
  ];

  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating", label: "Average Rating" }
  ];

  // Trigger brief skeleton loading effect when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 45000); // Wait, 45 seconds? No, 450ms is standard!
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedBrand, maxPrice, minRating, sortBy]);

  // Adjust timing to 450ms
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedBrand, maxPrice, minRating, sortBy]);

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesBrand = !selectedBrand || p.brand === selectedBrand;
    const matchesPrice = p.price <= maxPrice;
    const matchesRating = p.rating >= minRating;

    return matchesCategory && matchesBrand && matchesPrice && matchesRating;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.popularity - a.popularity;
  });

  return (
    <div className="container catalog-container" style={{ minHeight: '80vh' }}>
      {/* Sidebar Filters */}
      <aside className="filter-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Filters</h3>
          {(selectedCategory || selectedBrand || maxPrice !== 1500 || minRating > 0) && (
            <button 
              onClick={onResetFilters} 
              style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: '700' }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Categories Checkbox/Radio List */}
        <div className="filter-group">
          <h4 className="filter-group-title">Category</h4>
          <div className="filter-checkbox-list">
            <label className="filter-checkbox-item">
              <input 
                type="radio" 
                name="category" 
                checked={selectedCategory === ""} 
                onChange={() => onSelectCategory("")}
              />
              <span>All Categories</span>
            </label>
            {categories.map((c) => (
              <label className="filter-checkbox-item" key={c.id}>
                <input 
                  type="radio" 
                  name="category" 
                  checked={selectedCategory === c.id} 
                  onChange={() => onSelectCategory(c.id)}
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brands Dropdown */}
        <div className="filter-group">
          <h4 className="filter-group-title">Brand</h4>
          <CustomDropdown
            options={brandOptions}
            value={selectedBrand}
            onChange={onSelectBrand}
            placeholder="All Brands"
          />
        </div>

        {/* Price Filter Slider */}
        <div className="filter-group">
          <h4 className="filter-group-title">Max Price</h4>
          <div className="filter-price-slider">
            <input 
              type="range" 
              min="20" 
              max="1500" 
              value={maxPrice} 
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="price-slider-input"
            />
            <div className="price-range-labels">
              <span>$20</span>
              <span style={{ fontWeight: '800', color: 'var(--primary)' }}>${maxPrice}</span>
              <span>$1500</span>
            </div>
          </div>
        </div>

        {/* Min Rating Filter */}
        <div className="filter-group">
          <h4 className="filter-group-title">Minimum Rating</h4>
          <CustomDropdown
            options={ratingOptions}
            value={minRating}
            onChange={onRatingChange}
            placeholder="All Ratings"
          />
        </div>
      </aside>

      {/* Main Catalog view */}
      <section className="catalog-content">
        <div className="catalog-results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            {sortedProducts.length} Items Found
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Sort By:</span>
            <CustomDropdown
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              placeholder="Popularity"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="catalog-grid">
            {[...Array(6)].map((_, i) => (
              <div className="skeleton-card" key={i}>
                <div className="skeleton skeleton-image"></div>
                <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '16px' }}>No Products Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Try adjusting your sidebar filters or navbar searches.
            </p>
            <button 
              className="slide-cta" 
              style={{ margin: '16px auto 0', padding: '10px 20px', fontSize: '13px' }}
              onClick={onResetFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {sortedProducts.map(p => (
              <div key={p.id} onClick={() => onProductClick(p)} style={{ cursor: 'pointer' }}>
                <ProductCard 
                  product={p}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  isWishlisted={wishlist.some(item => item.id === p.id)}
                  onQuickView={onQuickView}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
