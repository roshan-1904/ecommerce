import React, { useState, useEffect } from 'react';
import headphonesImg from '../assets/hero_headphones_3d.png';
import phoneImg from '../assets/hero_phone_3d.png';
import keyboardImg from '../assets/hero_keyboard_3d.png';
import techPatternBg from '../assets/tech_pattern_bg.png';

const SLIDES = [
  {
    id: 1,
    promo: "Summer Tech Blowout",
    title: "Unleash Next-Gen Sound Experience",
    desc: "Get up to 20% off on all active noise-cancelling headphones and audiophile gear. Limited period launch offer.",
    image: headphonesImg,
    cta: "Shop Audio Deals"
  },
  {
    id: 2,
    promo: "New Arrivals Showcase",
    title: "Flagship Mobile Engineering",
    desc: "Discover the futuristic Nova X series with crystal clear AMOLED displays, 108MP cameras, and lightning fast 120W charging.",
    image: phoneImg,
    cta: "Explore Mobiles"
  },
  {
    id: 3,
    promo: "Workspace Upgrade",
    title: "Redefine Your Creative Workflow",
    desc: "Meticulously built laptops, hot-swappable mechanical keyboards, and ergonomic setups designed to keep productivity high.",
    image: keyboardImg,
    cta: "Browse Gear"
  }
];

export default function HeroSlider({ onShopClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e) => {
    const el = e.currentTarget;
    const box = el.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const rx = -(y / (box.height / 2)) * 20; // Max 20 deg tilt
    const ry = (x / (box.width / 2)) * 20;
    el.style.setProperty('--hrx', `${rx}deg`);
    el.style.setProperty('--hry', `${ry}deg`);
    
    // Gloss light effect coordinates
    const px = ((e.clientX - box.left) / box.width) * 100;
    const py = ((e.clientY - box.top) / box.height) * 100;
    el.style.setProperty('--hmx', `${px}%`);
    el.style.setProperty('--hmy', `${py}%`);
  };

  const handleMouseLeave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty('--hrx', '0deg');
    el.style.setProperty('--hry', '0deg');
    el.style.setProperty('--hmx', '50%');
    el.style.setProperty('--hmy', '50%');
  };

  return (
    <div className="hero-slider">
      {SLIDES.map((slide, idx) => {
        const isActive = idx === currentSlide;
        return (
          <div 
            key={slide.id} 
            className={`slide ${isActive ? 'active' : ''}`}
          >
            <div className="slide-content-split">
              {/* Left text column */}
              <div className="slide-text-side">
                {/* Ambient Blurred Backdrop Glow */}
                <div 
                  className="slide-text-glow-backdrop" 
                  style={{ backgroundImage: `url(${slide.image})` }} 
                />
                {/* Tech Pattern Overlay */}
                <div 
                  className="slide-text-pattern-overlay" 
                  style={{ backgroundImage: `url(${techPatternBg})` }} 
                />

                <span className="slide-promo">{slide.promo}</span>
                <h2 className="slide-title">{slide.title}</h2>
                <p className="slide-desc">{slide.desc}</p>
                <button className="slide-cta" onClick={onShopClick}>
                  {slide.cta}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

              {/* Right product 3D card column */}
              <div className="slide-image-side">
                <div 
                  className="hero-3d-card-wrapper"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="hero-3d-image"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="slider-dots">
        {SLIDES.map((_, idx) => (
          <button 
            key={idx}
            className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
