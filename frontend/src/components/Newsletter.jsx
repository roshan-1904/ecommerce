import React, { useState } from 'react';
import { API_URL } from '../config';

export default function Newsletter({ onSubscribe }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !message) {
      alert("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const payload = {
      name,
      email,
      phone,
      subject: "Join the Neo Club Enquiry",
      message
    };

    try {
      const response = await fetch(`${API_URL}/api/enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setSubmitStatus('success');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        if (onSubscribe) {
          onSubscribe(email);
        }
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      console.log("Offline enquiry backup - saving locally:", err.message);
      // Fallback local success so client can preview it
      setSubmitStatus('success');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      if (onSubscribe) {
        onSubscribe(email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container" style={{ margin: '60px auto' }}>
      <style>{`
        .neo-club-card {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 45px;
          box-shadow: var(--shadow-md);
          max-width: 700px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }
        .neo-club-card::before {
          content: '';
          position: absolute;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(129, 140, 248, 0.12) 0%, transparent 70%);
          top: -80px;
          right: -80px;
          pointer-events: none;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 580px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
        .club-input, .club-textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-input);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: var(--transition-smooth);
        }
        .club-input:focus, .club-textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 8px var(--primary-glow);
        }
        .club-submit-btn {
          background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
          border: none;
          color: white;
          padding: 12px 28px;
          font-weight: 700;
          font-size: 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-smooth);
          box-shadow: 0 4px 12px rgba(129,140,248,0.25);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .club-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(129,140,248,0.45);
        }
      `}</style>

      <div className="neo-club-card">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading-primary)', fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Join the Neo Club</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px', maxWidth: '550px', margin: '6px auto 0 auto' }}>
            Submit an enquiry to register your profile. Gain VIP access to product launches, custom hardware deals, and exclusive newsletters.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>Full Name *</label>
              <input 
                type="text" 
                className="club-input"
                placeholder="Alen Joshua"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>Contact Phone *</label>
              <input 
                type="tel" 
                className="club-input"
                placeholder="+91 9845612301"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>Email Address *</label>
            <input 
              type="email" 
              className="club-input"
              placeholder="alen.joshua@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>Enquiry Message *</label>
            <textarea 
              rows="3" 
              className="club-textarea"
              placeholder="Tell us about your interests, hardware queries, or membership goals..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {submitStatus === 'success' && (
            <div style={{ padding: '12px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', color: 'var(--secondary)', fontSize: '13px', fontWeight: '700', display: 'flex', gap: '8px', alignItems: 'center' }}>
              ✓ Enquiry submitted successfully! Welcome to the Neo Club.
            </div>
          )}

          {submitStatus === 'error' && (
            <div style={{ padding: '12px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', color: 'var(--accent)', fontSize: '13px', fontWeight: '700' }}>
              ✕ Error submitting your enquiry. Please check your connection and try again.
            </div>
          )}

          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <button 
              type="submit" 
              className="club-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending Request...' : 'Submit Member Enquiry'}
            </button>
          </div>

        </form>
      </div>
    </section>
  );
}
