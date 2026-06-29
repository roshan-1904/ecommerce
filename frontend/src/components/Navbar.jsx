import React, { useState, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';

const BRANDS = ["AuraSound", "NovaTech", "Quantum", "UrbanOutfitters", "ExecutiveStyle", "Elysian", "Vortex", "Apex", "GlowNatural", "ErgoDesign", "Craftsman", "BrewMaster", "KyotoHarvesters", "FitFlow", "STEMLabs"];

export default function Navbar({ 
  searchQuery, 
  onSearchChange, 
  cartCount, 
  wishlistCount, 
  onCartOpen, 
  onWishlistOpen, 
  onLoginOpen,
  userProfile,
  theme,
  toggleTheme,
  onResetFilters,
  
  // Filtering States & Handlers
  categories,
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  maxPrice,
  onPriceChange,
  minRating,
  onRatingChange,
  sortBy,
  onSortChange
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ];

  const brandOptions = [
    { value: "", label: "All Brands" },
    ...BRANDS.map(b => ({ value: b, label: b }))
  ];

  const priceOptions = [
    { value: 1500, label: "All Prices" },
    { value: 50, label: "Under $50" },
    { value: 100, label: "Under $100" },
    { value: 250, label: "Under $250" },
    { value: 500, label: "Under $500" },
    { value: 1000, label: "Under $1000" }
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

  return (
    <header className="navbar-wrapper">
      {/* Navbar Row 1 */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-container">
          {/* Logo */}
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onResetFilters(); }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            NEOMART
          </a>

          {/* Center Search Bar */}
          <div className="search-container">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="search-bar-input" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Right Navigation */}
          <ul className="nav-links">
            <li>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onResetFilters(); }}>
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="nav-text">Home</span>
              </a>
            </li>

            <li>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onWishlistOpen(); }}>
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span className="nav-text">Wishlist</span>
                {wishlistCount > 0 && <span className="nav-link-badge">{wishlistCount}</span>}
              </a>
            </li>

            <li>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onCartOpen(); }}>
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="nav-text">Cart</span>
                {cartCount > 0 && <span className="nav-link-badge">{cartCount}</span>}
              </a>
            </li>

            <li>
              {userProfile ? (
                <a 
                  href="#" 
                  className="nav-link" 
                  onClick={(e) => { e.preventDefault(); onLoginOpen(); }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <img 
                    src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80`} 
                    alt="Profile" 
                    style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1.5px solid var(--primary)', objectFit: 'cover' }} 
                  />
                  <span className="nav-text" style={{ fontSize: '13px', fontWeight: '700' }}>{userProfile.name.split(' ')[0]}</span>
                </a>
              ) : (
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onLoginOpen(); }}>
                  <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="nav-text">Account</span>
                </a>
              )}
            </li>

            <li>
              <a 
                href="/admin" 
                className="nav-link" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  window.history.pushState(null, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                style={{ color: 'var(--primary)', fontWeight: '700' }}
              >
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span className="nav-text">Admin</span>
              </a>
            </li>

            {/* Theme Toggle */}
            <li>
              <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                {theme === 'dark' ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Navbar Row 2: Horizontal Filter Bar */}
      <div className="filter-bar">
        <div className="container filter-bar-container">
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', marginRight: '8px' }}>
            Filters:
          </span>

          {/* Category Dropdown */}
          <CustomDropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={onSelectCategory}
            placeholder="All Categories"
          />

          {/* Brand Dropdown */}
          <CustomDropdown
            options={brandOptions}
            value={selectedBrand}
            onChange={onSelectBrand}
            placeholder="All Brands"
          />

          {/* Price Range Dropdown */}
          <CustomDropdown
            options={priceOptions}
            value={maxPrice}
            onChange={onPriceChange}
            placeholder="All Prices"
          />

          {/* Minimum Rating Dropdown */}
          <CustomDropdown
            options={ratingOptions}
            value={minRating}
            onChange={onRatingChange}
            placeholder="All Ratings"
          />

          {/* Sort By Dropdown */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Sort:</span>
            <CustomDropdown
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              placeholder="Popularity"
            />
          </div>

          {/* Reset Filters button */}
          {(selectedCategory || selectedBrand || maxPrice !== 1500 || minRating > 0 || searchQuery) && (
            <button 
              onClick={onResetFilters}
              style={{
                fontSize: '12px',
                fontWeight: '800',
                color: 'var(--accent)',
                padding: '6px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(244, 63, 94, 0.05)'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
