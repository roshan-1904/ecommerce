import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import CategoryGrid from './components/CategoryGrid';
import ProductCard from './components/ProductCard';
import QuickViewModal from './components/QuickViewModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import LoginModal from './components/LoginModal';
import ReviewsSection from './components/ReviewsSection';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

import { products } from './data/products';
import { categories } from './data/categories';
import CatalogPage from './components/CatalogPage';
import ProductDetailPage from './components/ProductDetailPage';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Page Routing States
  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
      return 'admin';
    }
    return 'home';
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Search & Filter States (Simplified for Navbar Dropdowns)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(1500);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');

  // Drawer / Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Cart, Wishlist, User Profiles, Toasts
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('userData');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [toasts, setToasts] = useState([]);

  // Page Loader & Canvas States
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [loaderFade, setLoaderFade] = useState(false);
  const canvasRef = React.useRef(null);

  // Flash Sale Countdown Timer (Hours, Minutes, Seconds)
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 30, seconds: 0 });

  // Page Loader trigger
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setLoaderFade(true);
      const closeTimer = setTimeout(() => {
        setIsLoadingPage(false);
      }, 600);
      return () => clearTimeout(closeTimer);
    }, 1500);
    return () => clearTimeout(fadeTimer);
  }, []);

  // Update DOM when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // URL Popstate Listener for Client Routing
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path === '/admin/') {
        setCurrentPage('admin');
      } else {
        // If navigating away from admin, restore to home/catalog
        if (currentPage === 'admin') {
          setCurrentPage('home');
        }
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [currentPage]);

  // Interactive Particle Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const count = window.innerWidth < 768 ? 40 : 80;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
      });
    }

    let mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = theme === 'dark';
      ctx.fillStyle = isDark ? 'rgba(129, 140, 248, 0.4)' : 'rgba(79, 70, 229, 0.3)';
      ctx.strokeStyle = isDark ? 'rgba(129, 140, 248, 0.04)' : 'rgba(79, 70, 229, 0.03)';

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
        if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;

        // Interaction
        if (mouse.x && mouse.y) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            p.x -= dx * 0.01;
            p.y -= dy * 0.01;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Flash Sale Timer Countdown tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);



  // Toast notifier helper
  const showToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.map(t => t.id === id ? { ...t, removing: true } : t));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3000);
  };

  // Add Item to Cart
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        showToast(`Increased quantity of ${product.name} in cart.`);
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      showToast(`Added ${product.name} to cart.`);
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Update Cart Quantity
  const handleUpdateCartQuantity = (id, quantity) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  // Remove from Cart
  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast("Item removed from cart.");
  };

  // Toggle Wishlist item
  const handleToggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed ${product.name} from wishlist.`);
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast(`Added ${product.name} to wishlist.`);
        return [...prev, product];
      }
    });
  };

  // Move from wishlist to cart
  const handleMoveToCart = (product) => {
    handleAddToCart(product);
    setWishlist((prev) => prev.filter((item) => item.id !== product.id));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMaxPrice(1500);
    setMinRating(0);
    setSortBy('popularity');
    showToast("Filters reset to default.");
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage('catalog');
  };

  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    setCurrentPage('catalog');
  };

  const handlePriceChange = (price) => {
    setMaxPrice(price);
    setCurrentPage('catalog');
  };

  const handleRatingChange = (rating) => {
    setMinRating(rating);
    setCurrentPage('catalog');
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage('catalog');
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage('catalog');
  };

  const handleGoHome = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMaxPrice(1500);
    setMinRating(0);
    setSortBy('popularity');
    setCurrentPage('home');
  };



  // Hot/Trending sections
  const trendingProducts = products.filter(p => p.badge === 'Trending' || p.rating >= 4.8);
  const flashSaleProducts = products.filter(p => p.badge === 'Sale');

  return (
    <>
      {/* Interactive Background Canvas */}
      <canvas id="bg-canvas" ref={canvasRef} />

      {/* Premium Loader Overlay */}
      {isLoadingPage && (
        <div className={`page-loader ${loaderFade ? 'fade-out' : ''}`}>
          <div className="loader-spinner-wrapper">
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-logo-glow">NEO</div>
          </div>
        </div>
      )}

      {/* Sticky Top Navbar & integrated Horizontal Filter Bar */}
      {currentPage !== 'admin' && (
        <Navbar 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
          wishlistCount={wishlist.length}
          onCartOpen={() => setIsCartOpen(true)}
          onWishlistOpen={() => setIsWishlistOpen(true)}
          onLoginOpen={() => setIsLoginOpen(true)}
          userProfile={userProfile}
          theme={theme}
          toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onResetFilters={handleGoHome}

          // Filtering State passes
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          selectedBrand={selectedBrand}
          onSelectBrand={handleSelectBrand}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          minRating={minRating}
          onRatingChange={handleRatingChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      )}

      {/* Main Home Sections */}
      <main style={{ paddingBottom: '80px' }}>
        {currentPage === 'home' && (
          <>
            {/* Banner Carousel */}
            <section className="container">
              <HeroSlider onShopClick={() => setCurrentPage('catalog')} />
            </section>

            {/* Categories Section */}
            <CategoryGrid 
              categories={categories} 
              onSelectCategory={(id) => {
                setSelectedCategory(id);
                setCurrentPage('catalog');
              }}
              activeCategory={selectedCategory} 
            />

            {/* Trending Horizontal Scrolling */}
            <section id="deals-section" className="trending-section container">
              <div className="section-header">
                <h2 className="section-title">Trending Deals</h2>
              </div>
              <div className="trending-slider">
                {trendingProducts.map(p => (
                  <ProductCard 
                    key={p.id}
                    product={p}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some(item => item.id === p.id)}
                    onQuickView={setQuickViewProduct}
                    onCardClick={() => { setSelectedProduct(p); setCurrentPage('product-detail'); }}
                  />
                ))}
              </div>
            </section>

            {/* Flash Sale Countdown Banner */}
            <section className="container">
              <div className="flash-sale-banner">
                <div className="flash-sale-info">
                  <span className="slide-promo" style={{ color: 'white' }}>Limited Offer</span>
                  <h2 className="flash-sale-title">Mega Flash Sale Live</h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
                    Up to 33% off on best selling apparel, mechanical keyboards, and daily devices. Grab them before time runs out!
                  </p>
                  <div className="countdown-timer">
                    <div className="countdown-box">
                      <span className="countdown-number">{String(countdown.hours).padStart(2, '0')}</span>
                      <span className="countdown-label">Hours</span>
                    </div>
                    <div className="countdown-box">
                      <span className="countdown-number">{String(countdown.minutes).padStart(2, '0')}</span>
                      <span className="countdown-label">Mins</span>
                    </div>
                    <div className="countdown-box">
                      <span className="countdown-number">{String(countdown.seconds).padStart(2, '0')}</span>
                      <span className="countdown-label">Secs</span>
                    </div>
                  </div>
                </div>
                
                <div className="trending-slider" style={{ maxWidth: '600px', margin: 0, padding: 0 }}>
                  {flashSaleProducts.slice(0, 2).map(p => (
                    <ProductCard 
                      key={p.id}
                      product={p}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.some(item => item.id === p.id)}
                      onQuickView={setQuickViewProduct}
                      onCardClick={() => { setSelectedProduct(p); setCurrentPage('product-detail'); }}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Customer Reviews Section */}
            <ReviewsSection />

            {/* Newsletter subscription */}
            <Newsletter onSubscribe={(email) => showToast(`Successfully subscribed ${email} to our newsletter.`)} />
          </>
        )}

        {currentPage === 'catalog' && (
          <CatalogPage
            products={products}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            maxPrice={maxPrice}
            onPriceChange={setMaxPrice}
            minRating={minRating}
            onRatingChange={setMinRating}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onResetFilters={handleResetFilters}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleToggleWishlist}
            wishlist={wishlist}
            onQuickView={setQuickViewProduct}
            onProductClick={(p) => { setSelectedProduct(p); setCurrentPage('product-detail'); }}
          />
        )}

        {currentPage === 'product-detail' && (
          <ProductDetailPage
            product={selectedProduct}
            products={products}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleToggleWishlist}
            wishlist={wishlist}
            onQuickView={setQuickViewProduct}
            onProductClick={(p) => setSelectedProduct(p)}
            onBackToShop={() => setCurrentPage('catalog')}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard 
            products={products}
            categories={categories}
            onBackToShop={() => {
              window.history.pushState(null, '', '/');
              setCurrentPage('home');
            }}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      {currentPage !== 'admin' && <Footer />}

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          showToast("Thank you for your purchase! Order checkout completed.");
          setCart([]);
          setIsCartOpen(false);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onMoveToCart={handleMoveToCart}
        onRemoveItem={(id) => {
          setWishlist((prev) => prev.filter(i => i.id !== id));
          showToast("Removed item from wishlist.");
        }}
      />

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        userProfile={userProfile}
        onLoginSuccess={(userData) => {
          setUserProfile(userData);
          showToast(`Welcome back, ${userData.name}! Logged in successfully.`);
        }}
        onLogout={() => {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userData');
          setUserProfile(null);
          showToast("Logged out successfully.");
        }}
      />

      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.removing ? 'removing' : ''}`} style={{ borderColor: 'var(--primary)' }}>
            <span className="toast-icon" style={{ color: 'var(--primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
