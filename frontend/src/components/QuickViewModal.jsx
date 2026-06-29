import React from 'react';

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart }) {
  if (!isOpen || !product) return null;
  
  const { name, price, originalPrice, discountPercentage, image, brand, rating, ratingCount, stock, description, category } = product;

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="quickview-inner">
          {/* Media Section */}
          <div className="quickview-media">
            <img src={image} alt={name} className="quickview-img" />
          </div>

          {/* Details Section */}
          <div className="quickview-details">
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>
                {brand} &bull; {category}
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                {name}
              </h2>
            </div>

            {/* Rating */}
            <div className="rating-row" style={{ marginTop: '4px' }}>
              <div className="stars-list">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.floor(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
              </div>
              <span className="rating-val" style={{ fontSize: '14px' }}>{rating}</span>
              <span className="rating-count" style={{ fontSize: '14px' }}>({ratingCount} global ratings)</span>
            </div>

            {/* Pricing */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '8px 0' }}>
              <span className="price-current" style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                ${price.toFixed(2)}
              </span>
              {originalPrice && (
                <>
                  <span className="price-original" style={{ fontSize: '18px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ${originalPrice.toFixed(2)}
                  </span>
                  <span className="price-discount" style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)' }}>
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {description}
            </p>

            {/* Meta status details */}
            <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 0', margin: '8px 0' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Availability</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: stock > 10 ? 'var(--secondary)' : 'var(--accent)' }}>
                  {stock > 0 ? `${stock} Items in Stock` : 'Out of Stock'}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Shipping</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Free Delivery</span>
              </div>
            </div>

            {/* Add to Cart Control */}
            <button 
              className="btn-checkout" 
              onClick={() => { onAddToCart(product); onClose(); }}
              style={{ marginTop: '12px' }}
              disabled={stock === 0}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Shopping Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
