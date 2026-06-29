import React from 'react';

export default function WishlistDrawer({ isOpen, onClose, wishlistItems, onMoveToCart, onRemoveItem }) {
  return (
    <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2 className="cart-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent)'}}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Your Wishlist
          </h2>
          <button className="btn-close" onClick={onClose} aria-label="Close Wishlist">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="cart-items-container">
          {wishlistItems.length === 0 ? (
            <div className="cart-empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-muted)'}}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <p style={{ fontWeight: '600' }}>Your wishlist is empty</p>
              <button 
                onClick={onClose} 
                style={{ 
                  color: 'var(--primary)', 
                  fontWeight: '700', 
                  fontSize: '14px', 
                  borderBottom: '1.5px solid var(--primary)',
                  paddingBottom: '2px'
                }}
              >
                Explore Products
              </button>
            </div>
          ) : (
            wishlistItems.map(item => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{item.brand}</span>
                  <h4 className="cart-item-name" style={{ fontSize: '14px', fontWeight: '700' }}>{item.name}</h4>
                  <div className="cart-item-price" style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', marginTop: '2px', color: 'var(--text-primary)' }}>
                    ${item.price.toFixed(2)}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <button 
                    className="qty-btn"
                    style={{ 
                      fontFamily: 'var(--font-ui)',
                      background: 'var(--primary)', 
                      color: 'white', 
                      borderRadius: '6px', 
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={() => onMoveToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="btn-remove" 
                    onClick={() => onRemoveItem(item.id)}
                    aria-label="Remove item"
                    style={{ padding: '4px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
