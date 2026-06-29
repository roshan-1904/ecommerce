import React from 'react';

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  isWishlisted, 
  onQuickView,
  onCardClick
}) {
  const { id, name, price, originalPrice, discountPercentage, image, backImage, brand, badge, rating, ratingCount, category } = product;

  const isOutfitCard = category === 'men' || category === 'women';

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Max rotation 12 degrees for realistic tilt
    const rx = -(y / (box.height / 2)) * 12;
    const ry = (x / (box.width / 2)) * 12;
    
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
    
    const px = ((e.clientX - box.left) / box.width) * 100;
    const py = ((e.clientY - box.top) / box.height) * 100;
    card.style.setProperty('--mx', `${px}%`);
    card.style.setProperty('--my', `${py}%`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
  };

  if (isOutfitCard) {
    return (
      <div 
        className="product-card outfit-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onCardClick}
        style={{ cursor: 'pointer' }}
      >
        {/* Floating Wishlist Button */}
        <button 
          className={`wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onAddToWishlist(product); }}
          aria-label="Add to Wishlist"
          style={{ borderColor: 'rgba(0,0,0,0.1)', background: 'rgba(237, 228, 221, 0.7)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {/* Product Image Container with sliding wipe reveal */}
        <div className="outfit-img-container">
          {badge && <span className="product-tag" style={{ background: '#ff0001', boxShadow: 'none' }}>{badge}</span>}
          <img src={image} alt={name} className="outfit-img-front" loading="lazy" />
          {backImage && <img src={backImage} alt={`${name} Back View`} className="outfit-img-back" />}
          <div className="card-overlay-actions">
            <button 
              className="quickview-btn" 
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              style={{ background: '#000000', borderColor: '#000000', borderRadius: '50px' }}
            >
              Quick View
            </button>
          </div>
        </div>

        {/* Product Details (Neue Haas Grotesk style) */}
        <div className="product-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }} title={name}>
              {name}
            </h3>
            <span style={{ fontSize: '15px', fontWeight: '700', whiteSpace: 'nowrap' }}>
              ${price.toFixed(2)}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', textTransform: 'uppercase', color: '#5a5a5a', fontWeight: '700', letterSpacing: '1px' }}>
              <div className="outfit-badge-dot"></div>
              <span>{category === 'men' ? "Men's Apparel" : "Women's Apparel"}</span>
            </div>
            {originalPrice && (
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#ff0001' }}>
                {discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Add to Cart CTA (Jet Black Pill) */}
          <button 
            className="btn-card-add" 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            style={{ 
              background: '#000000', 
              color: '#ede4dd', 
              borderColor: '#000000', 
              borderRadius: '50px',
              fontWeight: '700',
              marginTop: '6px'
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

  // Default grid item representation for other categories (electronics, watches, etc.)
  return (
    <div 
      className="product-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Product Tag/Badge */}
      {badge && <span className="product-tag">{badge}</span>}

      {/* Floating Wishlist Button */}
      <button 
        className={`wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onAddToWishlist(product); }}
        aria-label="Add to Wishlist"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      {/* Product Image Container with Hover Quick View Action */}
      <div className="product-image-container">
        <img src={image} alt={name} className="product-image" loading="lazy" />
        <div className="card-overlay-actions">
          <button className="quickview-btn" onClick={(e) => { e.stopPropagation(); onQuickView(product); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            </svg>
            Quick View
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="product-info">
        <span className="product-brand">{brand}</span>
        <h3 className="product-title" title={name}>{name}</h3>
        
        {/* Rating Row */}
        <div className="rating-row">
          <div className="stars-list">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <span className="rating-val">{rating}</span>
          <span className="rating-count">({ratingCount})</span>
        </div>

        {/* Price Row */}
        <div className="price-row">
          <span className="price-current">${price.toFixed(2)}</span>
          {originalPrice && (
            <>
              <span className="price-original">${originalPrice.toFixed(2)}</span>
              <span className="price-discount">{discountPercentage}% OFF</span>
            </>
          )}
        </div>

        {/* Add to Cart CTA */}
        <button className="btn-card-add" onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

