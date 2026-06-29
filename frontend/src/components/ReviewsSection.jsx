import React from 'react';

const REVIEWS = [
  {
    id: 1,
    name: "Alex Johnson",
    rating: 5,
    date: "June 12, 2026",
    avatar: "AJ",
    text: "Absolutely stunning user interface. The shipping was incredibly fast, and the packaging for the Aura Pro headphones felt so premium. Highly recommended!"
  },
  {
    id: 2,
    name: "Sarah Miller",
    rating: 5,
    date: "June 20, 2026",
    avatar: "SM",
    text: "The Kepler Mechanical Keyboard is a dream to type on. Custom tactile switches feel crisp. Ordering on Neomart was seamless. Will buy again!"
  },
  {
    id: 3,
    name: "Vikram Singh",
    rating: 4,
    date: "May 28, 2026",
    avatar: "VS",
    text: "Premium product curation. The Smartwatch has excellent battery life. Website has wonderful filter options that made finding this so easy."
  }
];

export default function ReviewsSection() {
  return (
    <section className="reviews-section container">
      <div className="section-header">
        <h2 className="section-title">What Our Customers Say</h2>
      </div>
      
      <div className="reviews-marquee-wrapper">
        <div className="reviews-marquee-content">
          {[...REVIEWS, ...REVIEWS].map((rev, idx) => (
            <div className="review-card" key={`${rev.id}-${idx}`}>
              <div className="review-author">
                <div className="review-avatar">
                  {rev.avatar}
                </div>
                <div>
                  <h4 className="review-name">{rev.name}</h4>
                  <span className="review-meta">Verified Buyer &bull; {rev.date}</span>
                </div>
              </div>

              {/* Stars */}
              <div className="stars-list" style={{ gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < rev.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
              </div>

              <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                "{rev.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
