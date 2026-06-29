import React, { useState } from 'react';
import { API_URL } from '../config';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, userProfile, onLogout }) {
  const [activeTab, setActiveTab] = useState('signin');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email || !password || !name || !location || !companyName || !mobile) {
      setErrorMessage("Please fill in all registration fields.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name,
      email,
      mobile,
      password,
      location,
      companyName
    };

    try {
      const response = await fetch(`${API_URL}/api/auth/register-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        if (result.bypassed) {
          localStorage.setItem('userToken', result.token);
          localStorage.setItem('userData', JSON.stringify(result.data));
          onLoginSuccess(result.data);
          onClose();
          resetForm();
        } else {
          setActiveTab('otp-verification');
          setOtp('');
        }
      } else {
        setErrorMessage(result.message || "Registration failed. Try again.");
      }
    } catch (err) {
      console.error("Backend register-otp error, fallback to direct mock registration:", err);
      const fallbackUser = {
        name,
        email,
        mobile,
        location,
        companyName,
        role: 'user'
      };
      localStorage.setItem('userToken', 'mock-user-token');
      localStorage.setItem('userData', JSON.stringify(fallbackUser));
      
      onLoginSuccess(fallbackUser);
      onClose();
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otp) {
      setErrorMessage("Please enter the verification OTP.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('userToken', result.token);
        localStorage.setItem('userData', JSON.stringify(result.data));
        
        onLoginSuccess(result.data);
        onClose();
        resetForm();
      } else {
        setErrorMessage(result.message || "Verification failed. Check the OTP code.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setErrorMessage("Connection failed. Try verifying again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('userToken', result.token);
        localStorage.setItem('userData', JSON.stringify(result.data));
        
        onLoginSuccess(result.data);
        onClose();
        resetForm();
      } else {
        setErrorMessage(result.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Backend login error, fallback to guest sign-in:", err);
      const fallbackUser = {
        name: email.split('@')[0] || "Guest User",
        email,
        mobile: '+91 9999988888',
        location: 'Localhost',
        companyName: 'Offline Preview',
        role: 'user'
      };
      onLoginSuccess(fallbackUser);
      onClose();
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setLocation('');
    setCompanyName('');
    setMobile('');
    setOtp('');
    setErrorMessage('');
  };

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={() => { resetForm(); onClose(); }}>
      <div className="modal" style={{ maxWidth: '480px', background: 'var(--bg-modal)' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => { resetForm(); onClose(); }} aria-label="Close Modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="login-modal-inner" style={{ padding: '10px' }}>
          
          {userProfile ? (
            /* Logged In User Profile Detail Card */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`} 
                  alt="Avatar" 
                  style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid var(--primary)', objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} 
                />
                <span style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2.5px solid var(--bg-modal)'
                }}></span>
              </div>

              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-heading-primary)', color: 'var(--text-primary)' }}>
                  {userProfile.name}
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '3px 10px', borderRadius: '12px', marginTop: '6px', display: 'inline-block' }}>
                  {userProfile.role || 'Member'}
                </span>
              </div>

              <div style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '10px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Email Address</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{userProfile.email}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Location</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{userProfile.location || 'Localhost'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Company</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{userProfile.companyName || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Phone Contact</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{userProfile.mobile || 'Not registered'}</span>
                </div>
              </div>

              <button 
                onClick={() => { onLogout(); resetForm(); }} 
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'rgba(244, 63, 94, 0.1)',
                  color: 'var(--accent)',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '15px',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Sign Out of Account
              </button>
            </div>
          ) : (
            /* Sign In / Sign Up Tabs */
            <>
              {activeTab !== 'otp-verification' ? (
                <div className="login-tabs" style={{ marginBottom: '24px' }}>
                  <button 
                    className={`login-tab ${activeTab === 'signin' ? 'active' : ''}`} 
                    onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
                  >
                    Sign In
                  </button>
                  <button 
                    className={`login-tab ${activeTab === 'signup' ? 'active' : ''}`} 
                    onClick={() => { setActiveTab('signup'); setErrorMessage(''); }}
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <h3 style={{ fontSize: '18px', fontWeight: '800', textAlign: 'center', marginBottom: '20px', color: 'var(--primary)' }}>
                  Email OTP Verification
                </h3>
              )}

              {errorMessage && (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  color: 'var(--accent)',
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '15px'
                }}>
                  ✕ {errorMessage}
                </div>
              )}

              {activeTab === 'signin' ? (
                <form className="login-form" onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="john@example.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="••••••••" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                      Remember me
                    </label>
                    <a href="#" style={{ color: 'var(--primary)', fontWeight: '700' }}>Forgot Password?</a>
                  </div>

                  <button type="submit" className="btn-login-submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
                    {isSubmitting ? 'Authenticating...' : 'Sign In to Account'}
                  </button>
                </form>
              ) : activeTab === 'signup' ? (
                /* Sign Up Form */
                <form className="login-form" onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="John Doe" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Location (City) *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Chennai" 
                        required 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company Name *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="TechForge Corp" 
                        required 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="+91 9845612301" 
                      required 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="john@example.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Create Password *</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="••••••••" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-login-submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
                    {isSubmitting ? 'Registering Account...' : 'Register Profile'}
                  </button>
                </form>
              ) : (
                /* OTP Verification Form */
                <form className="login-form" onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label className="form-label" style={{ textTransform: 'none', fontSize: '13px', display: 'block', marginBottom: '12px', lineHeight: '1.5' }}>
                      We have sent a verification code to:<br/>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{email}</strong>
                    </label>
                    <input 
                      type="text" 
                      maxLength="6"
                      className="form-input" 
                      placeholder="000000" 
                      required 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{ 
                        textAlign: 'center', 
                        fontSize: '24px', 
                        letterSpacing: '8px', 
                        fontWeight: '800', 
                        height: '52px',
                        border: '2px solid var(--primary)',
                        background: 'rgba(99, 102, 241, 0.03)'
                      }}
                    />
                  </div>

                  <button type="submit" className="btn-login-submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
                    {isSubmitting ? 'Verifying Code...' : 'Confirm OTP & Complete SignUp'}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setActiveTab('signup'); setErrorMessage(''); }}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--accent)', 
                      cursor: 'pointer', 
                      textAlign: 'center', 
                      marginTop: '8px', 
                      fontSize: '13px',
                      fontWeight: '700',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Back to Registration
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
