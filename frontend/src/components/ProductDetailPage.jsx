import React, { useEffect } from 'react';
import ProductCard from './ProductCard';

export default function ProductDetailPage({
  product,
  products,
  onAddToCart,
  onAddToWishlist,
  wishlist,
  onQuickView,
  onProductClick,
  onBackToShop
}) {
  // Scroll to top when active product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  if (!product) return null;

  const { id, name, price, originalPrice, discountPercentage, image, brand, rating, ratingCount, stock, description, category } = product;

  // Filter products in the same category, excluding the current one
  const relatedProducts = products.filter(
    (p) => p.category === category && p.id !== id
  );

  return (
    <div className="container product-detail-container" style={{ minHeight: '80vh', paddingTop: '20px' }}>
      {/* Back button */}
      <button onClick={onBackToShop} className="btn-back-shop" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Shop
      </button>

      {/* Main product display split */}
      <div className="product-detail-grid">
        {/* Left: Product Image */}
        <div className="product-detail-media">
          <div className="detail-img-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <img src={image} alt={name} style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />
          </div>
        </div>

        {/* Right: Specifications & CTAs */}
        <div className="product-detail-info" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>
              {brand} &bull; {category}
            </span>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px', color: 'var(--text-primary)', lineHeight: '1.2' }}>
              {name}
            </h1>
          </div>

          {/* Rating */}
          <div className="rating-row" style={{ marginTop: '4px' }}>
            <div className="stars-list" style={{ gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i < Math.floor(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              ))}
            </div>
            <span className="rating-val" style={{ fontSize: '15px' }}>{rating}</span>
            <span className="rating-count" style={{ fontSize: '15px' }}>({ratingCount} global ratings)</span>
          </div>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '8px 0' }}>
            <span className="price-current" style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>
              ${price.toFixed(2)}
            </span>
            {originalPrice && (
              <>
                <span className="price-original" style={{ fontSize: '22px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="price-discount" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)' }}>
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            {description}
          </p>

          {/* Availability details */}
          <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 0', margin: '8px 0' }}>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Availability</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: stock > 10 ? 'var(--secondary)' : 'var(--accent)' }}>
                {stock > 0 ? `${stock} Items in Stock` : 'Out of Stock'}
              </span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Shipping</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Free standard delivery</span>
            </div>
          </div>

          {/* Add to Cart Control */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <button 
              className="btn-checkout" 
              onClick={() => onAddToCart(product)}
              style={{ flexGrow: 1 }}
              disabled={stock === 0}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Shopping Cart
            </button>

            <button 
              className="wishlist-float-btn" 
              onClick={() => onAddToWishlist(product)}
              style={{ position: 'relative', border: '1px solid var(--border)', background: 'var(--bg-input)', width: '48px', height: '48px', borderRadius: '8px', color: wishlist.some(i => i.id === id) ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist.some(i => i.id === id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Related Products Section */}
      <section className="trending-section" style={{ marginTop: '80px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <div className="section-header">
          <h2 className="section-title">Related Products</h2>
        </div>
        
        {relatedProducts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No related products found in this category.</p>
        ) : (
          <div className="trending-slider">
            {relatedProducts.map(p => (
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
