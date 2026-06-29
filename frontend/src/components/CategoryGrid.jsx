import React from 'react';

export default function CategoryGrid({ categories, onSelectCategory, activeCategory }) {
  return (
    <section id="categories-section" className="categories-section container">
      <div className="section-header">
        <h2 className="section-title">Shop by Category</h2>
      </div>
      
      <div className="categories-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button 
              key={category.id} 
              className={`category-card-rect ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(category.id)}
              style={{
                borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                boxShadow: isActive ? '0 4px 14px var(--primary-glow)' : 'var(--shadow-sm)',
              }}
            >
              {/* Background Image */}
              <img 
                src={category.image} 
                alt={category.name} 
                className="category-rect-img"
                loading="lazy"
              />
              
              {/* Dark Gradient Overlay */}
              <div className="category-rect-overlay"></div>
              
              {/* Category Name Label */}
              <span className="category-rect-name">{category.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
