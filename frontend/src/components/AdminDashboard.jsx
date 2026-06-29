import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ products, categories, onBackToShop, showToast }) {
  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });
  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('adminToken') || '';
  });
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminUser')) || null;
    } catch {
      return null;
    }
  });

  const [loginEmail, setLoginEmail] = useState('admin@techforge.com');
  const [loginPassword, setLoginPassword] = useState('AdminPassword123');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'users' | 'orders' | 'logs'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    summary: {
      totalUsers: 14,
      totalProducts: products.length,
      totalOrders: 32,
      outOfStockCount: products.filter(p => p.stock === 0).length,
      totalRevenue: 12840,
      averageOrderValue: 401
    },
    salesHistory: [
      { label: 'Jan', revenue: 4500, orders: 15 },
      { label: 'Feb', revenue: 6200, orders: 18 },
      { label: 'Mar', revenue: 7800, orders: 22 },
      { label: 'Apr', revenue: 9100, orders: 24 },
      { label: 'May', revenue: 11400, orders: 28 },
      { label: 'Jun', revenue: 12840, orders: 32 }
    ]
  });

  const [usersList, setUsersList] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isFetchingStats, setIsFetchingStats] = useState(false);

  // Enquiries states
  const [enquiriesList, setEnquiriesList] = useState([]);
  const [isFetchingEnquiries, setIsFetchingEnquiries] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);

  // Products and Search states
  const [adminProducts, setAdminProducts] = useState(products);
  const [prodSearch, setProdSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  // Drawer / sliding panel states for Add/Edit Product
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Add, object = Edit

  // Form State
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('electronics');
  const [formBrand, setFormBrand] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Sync products prop to local state
  useEffect(() => {
    setAdminProducts(products);
  }, [products]);

  // Load Dashboard Data & Users if logged in
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchDashboardStats();
      fetchUsers();
      fetchEnquiries();
    }
  }, [isAdminLoggedIn]);

  const fetchDashboardStats = async () => {
    setIsFetchingStats(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.log("Using dynamic fallback stats for local preview:", err.message);
    } finally {
      setIsFetchingStats(false);
    }
  };

  const fetchUsers = async () => {
    setIsFetchingUsers(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUsersList(data.data);
      } else {
        setUsersList(getMockUsers());
      }
    } catch (err) {
      setUsersList(getMockUsers());
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const fetchEnquiries = async () => {
    setIsFetchingEnquiries(true);
    try {
      const res = await fetch('http://localhost:5000/api/enquiries', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEnquiriesList(data.data);
      } else {
        setEnquiriesList(getMockEnquiries());
      }
    } catch (err) {
      console.log("Error fetching enquiries, using mock data:", err.message);
      setEnquiriesList(getMockEnquiries());
    } finally {
      setIsFetchingEnquiries(false);
    }
  };

  const handleReplyEnquiry = async (id, replyText) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`http://localhost:5000/api/enquiries/${id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ replyText })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Enquiry reply registered successfully.");
        fetchEnquiries();
      } else {
        setEnquiriesList(prev => prev.map(e => e._id === id ? { ...e, replyText, isReplied: true, isRead: true } : e));
        showToast("Saved reply draft locally.");
      }
    } catch (err) {
      setEnquiriesList(prev => prev.map(e => e._id === id ? { ...e, replyText, isReplied: true, isRead: true } : e));
      showToast("Offline. Saved reply draft locally.");
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm("Confirm deletion of this customer enquiry sheet?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/enquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast("Enquiry deleted from database.");
        fetchEnquiries();
      } else {
        setEnquiriesList(prev => prev.filter(e => e._id !== id));
        showToast("Removed enquiry record locally.");
      }
    } catch (err) {
      setEnquiriesList(prev => prev.filter(e => e._id !== id));
      showToast("Server offline. Removed enquiry record locally.");
    }
  };

  const getMockUsers = () => [
    { _id: 'u1', name: 'Alen Joshua', email: 'alen.joshua@gmail.com', role: 'user', isBlocked: false, createdAt: '2026-06-12T14:30:00Z', mobile: '+91 9845612301' },
    { _id: 'u2', name: 'Harish Kumar', email: 'harish@techforge.com', role: 'user', isBlocked: true, createdAt: '2026-06-15T09:12:00Z', mobile: '+91 8870192345' },
    { _id: 'u3', name: 'Sophia Smith', email: 'sophia@domain.com', role: 'user', isBlocked: false, createdAt: '2026-06-20T18:45:00Z', mobile: '+1 415-555-2671' },
    { _id: 'u4', name: 'Rajesh Kannan', email: 'rajesh.k@gmail.com', role: 'user', isBlocked: false, createdAt: '2026-06-22T10:05:00Z', mobile: '+91 9940123987' },
    { _id: 'u5', name: 'Meera Nair', email: 'meera.nair@hotmail.com', role: 'user', isBlocked: false, createdAt: '2026-06-24T16:20:00Z', mobile: '+91 7358123456' }
  ];

  const getMockEnquiries = () => [
    { _id: 'e1', name: 'Alen Joshua', email: 'alen.joshua@gmail.com', phone: '+91 9845612301', subject: 'Join the Neo Club Enquiry', message: 'Hi bro, I want to join the VIP club. Please review my registration request.', replyText: '', isReplied: false, isRead: false, createdAt: '2026-06-27T11:00:00Z' },
    { _id: 'e2', name: 'Harish Kumar', email: 'harish@techforge.com', phone: '+91 8870192345', subject: 'Custom Hardware Quote', message: 'Hello, do you support custom wholesale quotes for mechanical keyboards?', replyText: 'Yes, we do. Sent email.', isReplied: true, isRead: true, createdAt: '2026-06-26T14:20:00Z' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmittingLogin(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('adminUser', JSON.stringify(result.data));
        
        setIsAdminLoggedIn(true);
        setAdminToken(result.token);
        setAdminUser(result.data);
        showToast("Access Granted. Secure Session Established.");
      } else {
        showToast(result.message || "Invalid Admin Credentials.");
      }
    } catch (error) {
      if (loginEmail === 'admin@techforge.com' && loginPassword === 'AdminPassword123') {
        localStorage.setItem('isAdminLoggedIn', 'true');
        setIsAdminLoggedIn(true);
        setAdminToken('mock-admin-token');
        setAdminUser({ name: 'TechForge Admin', email: 'admin@techforge.com', role: 'admin' });
        showToast("Authenticated locally (Preview Mode).");
      } else {
        showToast("Error connecting to server. Check your credentials.");
      }
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAdminLoggedIn(false);
    setAdminToken('');
    setAdminUser(null);
    showToast("Session Terminated. Admin Signed Out.");
  };

  const handleToggleBlock = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchUsers();
      } else {
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
        showToast("Toggled customer status locally.");
      }
    } catch (err) {
      setUsersList(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
      showToast("Server offline. Updated customer state locally.");
    }
  };

  // Drawer Action Helpers
  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormCategory(product.category);
    setFormBrand(product.brand);
    setFormStock(product.stock.toString());
    setFormImage(product.image);
    setFormDescription(product.description || '');
    setIsProductDrawerOpen(true);
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormCategory('electronics');
    setFormBrand('');
    setFormStock('15');
    setFormImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80');
    setFormDescription('');
    setIsProductDrawerOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!formName || !formPrice || !formBrand) {
      showToast("Please enter all required fields.");
      return;
    }

    const priceNum = parseFloat(formPrice);
    const stockNum = parseInt(formStock);

    if (isNaN(priceNum) || priceNum <= 0) {
      showToast("Please enter a valid price amount.");
      return;
    }

    const productPayload = {
      name: formName,
      price: priceNum,
      category: formCategory,
      brand: formBrand,
      stock: stockNum,
      image: formImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      description: formDescription,
      rating: editingProduct ? editingProduct.rating : 4.8,
      ratingCount: editingProduct ? editingProduct.ratingCount : 1,
      popularity: editingProduct ? editingProduct.popularity : 85
    };

    if (editingProduct) {
      const matchId = editingProduct.id || editingProduct._id;
      try {
        const res = await fetch(`http://localhost:5000/api/products/${matchId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(productPayload)
        });
        const data = await res.json();
        if (data.success) {
          showToast("Product updated on server.");
        }
      } catch (err) {
        console.log("Could not update backend:", err.message);
      }

      setAdminProducts(prev => prev.map(p => {
        const currentId = p.id || p._id;
        if (currentId === matchId) {
          return { ...p, ...productPayload };
        }
        return p;
      }));
      showToast(`Successfully modified: ${formName}`);
    } else {
      const newId = Date.now();
      try {
        const res = await fetch(`http://localhost:5000/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(productPayload)
        });
        const data = await res.json();
        if (data.success) {
          showToast("Product listed on server.");
        }
      } catch (err) {
        console.log("Could not post to backend:", err.message);
      }

      setAdminProducts(prev => [
        {
          id: newId,
          _id: newId.toString(),
          ...productPayload
        },
        ...prev
      ]);
      showToast(`Successfully listed: ${formName}`);
    }

    setIsProductDrawerOpen(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Confirm deletion of this catalog item? This cannot be undone.")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast("Catalog item removed from database.");
      }
    } catch (err) {
      console.log("Offline delete action completed locally:", err.message);
    }

    setAdminProducts(prev => prev.filter(p => (p.id || p._id) !== id));
    showToast("Product removed successfully.");
  };

  // Dynamic Category Count Loader
  const categoryCounts = React.useMemo(() => {
    const counts = { all: adminProducts.length };
    adminProducts.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [adminProducts]);

  // Filter Products
  const filteredProducts = adminProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                          p.brand.toLowerCase().includes(prodSearch.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // System Logs Mock for premium control center feel
  const systemLogs = [
    { time: '12:24 PM', event: 'Database synced successfully with cluster-0', type: 'info' },
    { time: '12:08 PM', event: 'Admin authentication session established for admin@techforge.com', type: 'success' },
    { time: '11:58 AM', event: 'Configuration update: Changed MONGODB_URI to e-commerce target db', type: 'warning' },
    { time: '10:45 AM', event: 'Product stock alert: "Quantum Book Pro" inventory dropped to 8 units', type: 'danger' }
  ];

  // If not logged in, show premium Login Console
  if (!isAdminLoggedIn) {
    return (
      <div className="admin-login-wrapper">
        <style>{`
          .admin-login-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #090d1a 0%, #030712 100%);
            padding: 20px;
            font-family: var(--font-body);
            position: relative;
            overflow: hidden;
          }
          .admin-login-wrapper::before {
            content: '';
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, transparent 70%);
            top: -100px;
            right: -100px;
          }
          .admin-login-wrapper::after {
            content: '';
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(244, 63, 94, 0.1) 0%, transparent 70%);
            bottom: -150px;
            left: -150px;
          }
          .login-card {
            background: rgba(17, 24, 39, 0.6);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            width: 100%;
            max-width: 450px;
            padding: 45px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            z-index: 10;
          }
          .icon-header {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
            color: #818cf8;
            border: 1px solid rgba(129, 140, 248, 0.3);
            margin-bottom: 20px;
            box-shadow: 0 8px 16px rgba(129, 140, 248, 0.1);
          }
          .login-input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(3, 7, 18, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            color: #f9fafb;
            font-size: 14px;
            outline: none;
            transition: all 0.3s ease;
          }
          .login-input:focus {
            border-color: #818cf8;
            box-shadow: 0 0 10px rgba(129, 140, 248, 0.2);
            background: rgba(3, 7, 18, 0.6);
          }
          .login-submit {
            width: 100%;
            padding: 15px;
            border-radius: 10px;
            border: none;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: white;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
          }
          .login-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
            background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
          }
          .credentials-info {
            background: rgba(251, 191, 36, 0.06);
            border: 1px solid rgba(251, 191, 36, 0.15);
            border-radius: 10px;
            padding: 14px;
            font-size: 12px;
            color: #fbbf24;
            line-height: 1.6;
          }
        `}</style>
        
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="icon-header">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', color: '#f9fafb' }}>Access Control Portal</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '6px' }}>Sign in to access store core systems</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#9ca3af' }}>Administrator Email</label>
              <input 
                type="email" 
                className="login-input"
                placeholder="admin@techforge.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#9ca3af' }}>Console Password</label>
              <input 
                type="password" 
                className="login-input"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <div className="credentials-info">
              ⚡ <strong>Local Sandbox Autocomplete:</strong><br/>
              Email: <code>admin@techforge.com</code><br/>
              Password: <code>AdminPassword123</code>
            </div>

            <button 
              type="submit" 
              className="login-submit"
              disabled={isSubmittingLogin}
            >
              {isSubmittingLogin ? 'Validating Token...' : 'Unlock Control Console'}
            </button>

            <button 
              type="button" 
              onClick={onBackToShop}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '6px',
                marginTop: '-4px'
              }}
            >
              ← Cancel & Return to NeoMart
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard view (Logged In)
  return (
    <div className="admin-console-layout">
      
      {/* Styles Injection */}
      <style>{`
        .admin-console-layout {
          display: flex;
          min-height: 100vh;
          background-color: #030712;
          color: #f9fafb;
          font-family: var(--font-body);
        }
        
        /* Left Sidebar Styling */
        .admin-sidebar {
          width: ${isSidebarCollapsed ? '80px' : '260px'};
          background: #090d1a;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 100;
          flex-shrink: 0;
          overflow-y: auto;
        }
        .sidebar-header {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: ${isSidebarCollapsed ? 'center' : 'space-between'};
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-heading-primary);
          font-weight: 800;
          font-size: 18px;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #818cf8 0%, #e0e7ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sidebar-menu {
          padding: 20px 12px;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-grow: 1;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          color: #9ca3af;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .sidebar-item:hover {
          color: #f9fafb;
          background: rgba(255, 255, 255, 0.03);
        }
        .sidebar-item.active {
          color: #818cf8;
          background: rgba(129, 140, 248, 0.08);
          border: 1px solid rgba(129, 140, 248, 0.15);
        }
        .sidebar-item-dot {
          position: absolute;
          left: 0;
          width: 4px;
          height: 16px;
          background: #818cf8;
          border-radius: 0 4px 4px 0;
        }
        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          background: rgba(0, 0, 0, 0.2);
        }

        /* Topbar Header Dashboard */
        .admin-main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-y: auto;
        }
        .admin-topbar {
          height: 75px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(9, 13, 26, 0.5);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 35px;
          position: sticky;
          top: 0;
          z-index: 90;
        }
        
        /* Stats Dashboard Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 30px;
        }
        .metric-card {
          background: rgba(17, 24, 39, 0.35);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .metric-card:hover {
          transform: translateY(-3px);
          border-color: rgba(129, 140, 248, 0.2);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
        }
        .metric-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #9ca3af;
          margin-bottom: 15px;
        }
        .metric-card.primary .metric-icon-box {
          background: rgba(129, 140, 248, 0.1);
          border-color: rgba(129, 140, 248, 0.2);
          color: #818cf8;
        }
        .metric-card.success .metric-icon-box {
          background: rgba(52, 211, 153, 0.1);
          border-color: rgba(52, 211, 153, 0.2);
          color: #34d399;
        }
        .metric-card.danger .metric-icon-box {
          background: rgba(244, 63, 94, 0.1);
          border-color: rgba(244, 63, 94, 0.2);
          color: #f43f5e;
        }
        .metric-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        }
        .metric-trend.up {
          background: rgba(52, 211, 153, 0.08);
          color: #34d399;
        }
        .metric-trend.down {
          background: rgba(244, 63, 94, 0.08);
          color: #f43f5e;
        }

        /* Modern Table Panel */
        .table-container {
          background: rgba(17, 24, 39, 0.35);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }
        .admin-table th {
          background: rgba(3, 7, 18, 0.3);
          padding: 16px 24px;
          color: #9ca3af;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .admin-table td {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          color: #e5e7eb;
          vertical-align: middle;
        }
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        .admin-table tr:hover td {
          background: rgba(255, 255, 255, 0.015);
        }

        /* Right Panel sliding drawer style */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(3, 7, 18, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.3s ease;
        }
        .drawer-sheet {
          width: 100%;
          max-width: 500px;
          background: #090d1a;
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
          height: 100%;
          padding: 40px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          animation: slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pulse-online {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 10px #10b981;
          animation: pulse 1.8s infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes pulse {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .drop-option-hover:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          color: #fff !important;
        }
        
        @media (max-width: 768px) {
          .admin-console-layout {
            flex-direction: column !important;
          }
          .admin-sidebar {
            width: 100% !important;
            height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          }
          .sidebar-header {
            display: none !important;
          }
          .sidebar-menu {
            flex-direction: row !important;
            overflow-x: auto !important;
            padding: 10px !important;
            gap: 10px !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .sidebar-menu::-webkit-scrollbar {
            display: none !important;
          }
          .sidebar-item {
            padding: 8px 14px !important;
            font-size: 13px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
          .sidebar-footer {
            display: none !important;
          }
          .admin-topbar {
            padding: 0 16px !important;
            height: 60px !important;
          }
          .admin-topbar div:first-child {
            display: none !important;
          }
          .admin-main > div {
            padding: 20px !important;
          }
          .metrics-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .admin-table th, .admin-table td {
            padding: 12px 14px !important;
            font-size: 12px !important;
          }
          .table-container {
            width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .drawer-sheet {
            max-width: 100% !important;
            padding: 20px !important;
          }
        }
      `}</style>

      {/* 1. LEFT SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          {!isSidebarCollapsed && (
            <div className="sidebar-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              NEOMART CORE
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {activeTab === 'overview' && <div className="sidebar-item-dot" />}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            {!isSidebarCollapsed && 'Console Metrics'}
          </li>

          <li 
            className={`sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            {activeTab === 'products' && <div className="sidebar-item-dot" />}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            {!isSidebarCollapsed && `Catalog Items (${adminProducts.length})`}
          </li>

          <li 
            className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            {activeTab === 'users' && <div className="sidebar-item-dot" />}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            {!isSidebarCollapsed && 'Customers List'}
          </li>

          <li 
            className={`sidebar-item ${activeTab === 'enquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('enquiries')}
          >
            {activeTab === 'enquiries' && <div className="sidebar-item-dot" />}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            {!isSidebarCollapsed && `Enquiry Inbox (${enquiriesList.filter(e => !e.isReplied).length})`}
          </li>
        </ul>

        <div className="sidebar-footer">
          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#6b7280' }}>
              <span>Version 1.2.0-secure</span>
              <span>Host: DB-Localhost</span>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN CONTAINER PANEL */}
      <main className="admin-main">
        
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-online"></span>
              <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.5px' }}>Server Live</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right', display: isSidebarCollapsed ? 'none' : 'block' }}>
              <strong style={{ display: 'block', fontSize: '14px' }}>{adminUser?.name || 'Administrator'}</strong>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{adminUser?.email || 'System Root'}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={onBackToShop}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  color: '#9ca3af',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = '#fff'; }}
                onMouseOut={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.target.style.color = '#9ca3af'; }}
              >
                Storefront
              </button>

              <button 
                onClick={handleLogout}
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  color: '#f43f5e',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.target.style.background = 'rgba(244, 63, 94, 0.18)'; }}
                onMouseOut={(e) => { e.target.style.background = 'rgba(244, 63, 94, 0.1)'; }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab Content */}
        <div style={{ padding: '40px' }}>
          
          {/* ================= OVERVIEW TAB ================= */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: '35px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-heading-primary)', letterSpacing: '-0.5px' }}>Dashboard Overview</h1>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>Real-time telemetry and analytical breakdown of the NeoMart e-commerce cluster.</p>
              </div>

              {/* Statistics Cards */}
              <div className="metrics-grid">
                <div className="metric-card primary">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af' }}>Revenue Stream</span>
                      <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#fff' }}>
                        ${stats.summary.totalRevenue.toLocaleString()}
                      </h2>
                    </div>
                    <div className="metric-icon-box">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="metric-trend up">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                      +14.8%
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>vs last billing cycle</span>
                  </div>
                </div>

                <div className="metric-card success">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af' }}>Client Orders</span>
                      <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#fff' }}>
                        {stats.summary.totalOrders}
                      </h2>
                    </div>
                    <div className="metric-icon-box">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </div>
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="metric-trend up">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                      +6.2%
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>order velocity healthy</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af' }}>Customer Database</span>
                      <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#fff' }}>
                        {stats.summary.totalUsers}
                      </h2>
                    </div>
                    <div className="metric-icon-box">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                    </div>
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="metric-trend up">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                      +24.1%
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>new signups this week</span>
                  </div>
                </div>

                <div className="metric-card danger">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af' }}>Stock Critical Alerts</span>
                      <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: stats.summary.outOfStockCount > 0 ? '#f43f5e' : '#fff' }}>
                        {stats.summary.outOfStockCount}
                      </h2>
                    </div>
                    <div className="metric-icon-box">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="metric-trend down" style={{ background: stats.summary.outOfStockCount > 0 ? 'rgba(244,63,94,0.08)' : 'rgba(52,211,153,0.08)', color: stats.summary.outOfStockCount > 0 ? '#f43f5e' : '#34d399' }}>
                      {stats.summary.outOfStockCount > 0 ? 'Urgent' : 'Nominal'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>products out of stock</span>
                  </div>
                </div>
              </div>

              {/* Analytical Charts and Live Server Logs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
                
                {/* SVG Revenue Growth chart */}
                <div style={{
                  background: 'rgba(17, 24, 39, 0.35)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '30px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-heading-primary)' }}>Sales Growth Timeline</h3>
                    <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: '700', padding: '4px 10px', background: 'rgba(129,140,248,0.08)', borderRadius: '6px' }}>6-Month Forecast</span>
                  </div>

                  <div style={{ width: '100%', height: '240px', position: 'relative' }}>
                    <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                      <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="5,5" />

                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Line Paths */}
                      <path 
                        d="M 50 160 Q 150 140, 250 115 T 450 70 T 550 45 L 550 190 L 50 190 Z" 
                        fill="url(#chartGradient)"
                      />

                      <path 
                        d="M 50 160 Q 150 140, 250 115 T 450 70 T 550 45" 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />

                      {/* Connection Dots */}
                      <circle cx="50" cy="160" r="5" fill="#6366f1" />
                      <circle cx="150" cy="140" r="5" fill="#6366f1" />
                      <circle cx="250" cy="115" r="5" fill="#6366f1" />
                      <circle cx="350" cy="90" r="5" fill="#6366f1" />
                      <circle cx="450" cy="70" r="5" fill="#6366f1" />
                      <circle cx="550" cy="45" r="6" fill="#34d399" stroke="#090d1a" strokeWidth="2.5" />
                    </svg>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px', fontSize: '11px', color: '#9ca3af', fontWeight: '700' }}>
                      {stats.salesHistory.map((item, idx) => (
                        <span key={idx}>{item.label} (${item.revenue})</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Diagnostics Logs */}
                <div style={{
                  background: 'rgba(17, 24, 39, 0.35)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '30px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-heading-primary)', marginBottom: '20px' }}>Diagnostic Logs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {systemLogs.map((log, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        borderBottom: idx === systemLogs.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                        paddingBottom: '12px'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: log.type === 'success' ? '#34d399' : log.type === 'warning' ? '#fbbf24' : log.type === 'danger' ? '#f43f5e' : '#818cf8',
                          marginTop: '8px',
                          flexShrink: 0
                        }}></span>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', fontWeight: '700' }}>{log.time}</span>
                          <p style={{ fontSize: '13px', color: '#e5e7eb', marginTop: '2px', wordBreak: 'break-word', lineHeight: '1.4' }}>{log.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= PRODUCTS TAB ================= */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-heading-primary)', letterSpacing: '-0.5px' }}>Item Catalog</h1>
                  <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>Add, remove and manage the products inventory list of NeoMart store.</p>
                </div>

                <button 
                  onClick={handleAddProductClick}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)'
                  }}
                  onMouseOver={(e) => { e.target.style.background = 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)'; }}
                  onMouseOut={(e) => { e.target.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  New Catalog Item
                </button>
              </div>

              {/* Advanced search and filter panel */}
              <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                <div className="search-container" style={{ margin: 0, width: '320px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input 
                    type="text" 
                    placeholder="Search query by name, brand..." 
                    className="search-bar-input" 
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    style={{ background: 'transparent' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
                  <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '700' }}>Filter Category:</span>
                  
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: 'rgba(17, 24, 39, 0.55)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#f9fafb',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        minWidth: '220px',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: selectedCategoryFilter === 'all' ? '#818cf8' : '#34d399'
                        }}></span>
                        {selectedCategoryFilter === 'all' 
                          ? 'All Categories' 
                          : categories.find(c => c.id === selectedCategoryFilter)?.name || selectedCategoryFilter
                        }
                      </span>
                      
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '800', 
                        background: 'rgba(255,255,255,0.06)', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        color: '#818cf8'
                      }}>
                        {categoryCounts[selectedCategoryFilter] || 0}
                      </span>
                    </button>

                    {isCatDropdownOpen && (
                      <>
                        <div 
                          onClick={() => setIsCatDropdownOpen(false)}
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1000
                          }}
                        />
                        
                        <div style={{
                          position: 'absolute',
                          top: '48px',
                          left: 0,
                          width: '100%',
                          background: 'rgba(17, 24, 39, 0.98)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '8px',
                          boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
                          zIndex: 1001,
                          maxHeight: '300px',
                          overflowY: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategoryFilter('all');
                              setIsCatDropdownOpen(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              background: selectedCategoryFilter === 'all' ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
                              color: selectedCategoryFilter === 'all' ? '#818cf8' : '#e5e7eb',
                              textAlign: 'left',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            className="drop-option-hover"
                          >
                            <span>All Categories</span>
                            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '800' }}>({categoryCounts.all || 0})</span>
                          </button>

                          {categories.map((c) => {
                            const count = categoryCounts[c.id] || 0;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCategoryFilter(c.id);
                                  setIsCatDropdownOpen(false);
                                }}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: selectedCategoryFilter === c.id ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
                                  color: selectedCategoryFilter === c.id ? '#818cf8' : '#e5e7eb',
                                  textAlign: 'left',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  transition: 'all 0.2s ease'
                                }}
                                className="drop-option-hover"
                              >
                                <span>{c.name}</span>
                                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '800' }}>({count})</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Premium Inventory Table */}
              <div className="table-container">
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Item Details</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Unit Price</th>
                        <th>Stock Level</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => {
                        const productId = p.id || p._id;
                        return (
                          <tr key={productId}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <img 
                                  src={p.image} 
                                  alt={p.name} 
                                  style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80';
                                  }}
                                />
                                <div>
                                  <strong style={{ display: 'block', color: '#fff', fontSize: '14px' }}>{p.name}</strong>
                                  <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>ID: {productId}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ textTransform: 'capitalize', color: '#9ca3af', fontWeight: '600' }}>{p.category}</td>
                            <td style={{ color: '#9ca3af', fontWeight: '600' }}>{p.brand}</td>
                            <td style={{ fontWeight: '700', color: '#34d399' }}>${parseFloat(p.price).toFixed(2)}</td>
                            <td>
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '6px', 
                                fontSize: '11px', 
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                background: p.stock === 0 ? 'rgba(244,63,94,0.1)' : p.stock < 10 ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)',
                                color: p.stock === 0 ? '#f43f5e' : p.stock < 10 ? '#fbbf24' : '#34d399'
                              }}>
                                {p.stock === 0 ? 'OUT OF STOCK' : p.stock < 10 ? `LOW STOCK (${p.stock})` : `IN STOCK (${p.stock})`}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '10px' }}>
                                <button 
                                  onClick={() => handleEditProductClick(p)}
                                  style={{ 
                                    background: 'rgba(129, 140, 248, 0.08)', 
                                    border: '1px solid rgba(129, 140, 248, 0.15)', 
                                    color: '#818cf8', 
                                    padding: '6px 12px', 
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer' 
                                  }}
                                  onMouseOver={(e) => { e.target.style.background = 'rgba(129, 140, 248, 0.15)'; }}
                                  onMouseOut={(e) => { e.target.style.background = 'rgba(129, 140, 248, 0.08)'; }}
                                >
                                  Modify
                                </button>
                                
                                <button 
                                  onClick={() => handleDeleteProduct(productId)}
                                  style={{ 
                                    background: 'rgba(244, 63, 94, 0.08)', 
                                    border: '1px solid rgba(244, 63, 94, 0.15)', 
                                    color: '#f43f5e', 
                                    padding: '6px 12px', 
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer' 
                                  }}
                                  onMouseOver={(e) => { e.target.style.background = 'rgba(244, 63, 94, 0.15)'; }}
                                  onMouseOut={(e) => { e.target.style.background = 'rgba(244, 63, 94, 0.08)'; }}
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                            No inventory items match search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= CUSTOMERS TAB ================= */}
          {activeTab === 'users' && (
            <div>
              <div style={{ marginBottom: '35px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-heading-primary)', letterSpacing: '-0.5px' }}>Customer Management</h1>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>Review accounts, view access states, or block/unblock system clients.</p>
              </div>

              {isFetchingUsers ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>Consulting cluster for client roster...</div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Contact / Phone</th>
                        <th>Location</th>
                        <th>Company</th>
                        <th>System Role</th>
                        <th>Access Status</th>
                        <th style={{ textAlign: 'right' }}>Security Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => {
                        const firstLetter = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                        return (
                          <tr key={u._id} onClick={() => setSelectedCustomerDetails(u)} style={{ cursor: 'pointer' }}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                  color: 'white',
                                  fontWeight: '800',
                                  fontSize: '14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 4px 10px rgba(37,99,235,0.15)'
                                }}>
                                  {firstLetter}
                                </div>
                                <div>
                                  <strong style={{ display: 'block', color: '#fff', fontSize: '14px' }}>{u.name}</strong>
                                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: '#9ca3af', fontWeight: '600' }}>{u.mobile || 'Not provided'}</td>
                            <td style={{ color: '#9ca3af', fontWeight: '600' }}>{u.location || 'N/A'}</td>
                            <td style={{ color: '#9ca3af', fontWeight: '600' }}>{u.companyName || 'N/A'}</td>
                            <td style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: '#818cf8', letterSpacing: '0.5px' }}>
                              <span style={{ padding: '3px 8px', background: 'rgba(129,140,248,0.08)', borderRadius: '4px', border: '1px solid rgba(129,140,248,0.12)' }}>
                                {u.role}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '800',
                                letterSpacing: '0.5px',
                                background: u.isBlocked ? 'rgba(244,63,94,0.1)' : 'rgba(52,211,153,0.1)',
                                color: u.isBlocked ? '#f43f5e' : '#34d399'
                              }}>
                                {u.isBlocked ? 'RESTRICTED' : 'UNRESTRICTED'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleBlock(u._id); }}
                                style={{
                                  background: u.isBlocked ? 'rgba(52, 211, 153, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                                  border: u.isBlocked ? '1px solid rgba(52, 211, 153, 0.15)' : '1px solid rgba(244, 63, 94, 0.15)',
                                  color: u.isBlocked ? '#34d399' : '#f43f5e',
                                  padding: '6px 14px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => { e.target.style.background = u.isBlocked ? 'rgba(52, 211, 153, 0.15)' : 'rgba(244, 63, 94, 0.15)'; }}
                                onMouseOut={(e) => { e.target.style.background = u.isBlocked ? 'rgba(52, 211, 153, 0.08)' : 'rgba(244, 63, 94, 0.08)'; }}
                              >
                                {u.isBlocked ? 'Revoke Restrict' : 'Restrict Account'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= ENQUIRIES TAB ================= */}
          {activeTab === 'enquiries' && (
            <div>
              <div style={{ marginBottom: '35px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-heading-primary)', letterSpacing: '-0.5px' }}>Enquiry Inbox</h1>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>Review Neo Club submissions, client requests, and dispatch email/system replies.</p>
              </div>

              {isFetchingEnquiries ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>Retrieving enquiry roster from server...</div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sender Details</th>
                        <th>Phone Number</th>
                        <th>Subject & Message Details</th>
                        <th>Inbox Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enquiriesList.map((e) => {
                        const firstLetter = e.name ? e.name.charAt(0).toUpperCase() : 'E';
                        const currentDraft = replyDrafts[e._id] || '';
                        
                        return (
                          <tr key={e._id} style={{ verticalAlign: 'top' }}>
                            <td style={{ width: '220px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                                  color: 'white',
                                  fontWeight: '800',
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  {firstLetter}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <strong style={{ display: 'block', color: '#fff', fontSize: '14px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{e.name}</strong>
                                  <span style={{ fontSize: '12px', color: '#9ca3af', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>{e.email}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: '#9ca3af', fontWeight: '600', width: '160px' }}>{e.phone}</td>
                            <td>
                              <div style={{ maxWidth: '450px' }}>
                                <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                  {e.subject}
                                </span>
                                <p style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{e.message}</p>
                                
                                {e.isReplied ? (
                                  <div style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    background: 'rgba(52,211,153,0.04)',
                                    border: '1px solid rgba(52,211,153,0.12)',
                                    borderRadius: '8px'
                                  }}>
                                    <span style={{ fontSize: '10px', color: '#34d399', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                                      Console Response Sent
                                    </span>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>"{e.replyText}"</p>
                                  </div>
                                ) : (
                                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <textarea
                                      rows="2"
                                      placeholder="Write console reply..."
                                      style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: 'rgba(3, 7, 18, 0.4)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '8px',
                                        color: '#f9fafb',
                                        fontSize: '12px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        outline: 'none'
                                      }}
                                      value={currentDraft}
                                      onChange={(evt) => {
                                        const text = evt.target.value;
                                        setReplyDrafts(prev => ({ ...prev, [e._id]: text }));
                                      }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleReplyEnquiry(e._id, currentDraft);
                                          setReplyDrafts(prev => ({ ...prev, [e._id]: '' }));
                                        }}
                                        style={{
                                          background: 'rgba(129, 140, 248, 0.08)',
                                          border: '1px solid rgba(129, 140, 248, 0.15)',
                                          color: '#818cf8',
                                          padding: '4px 12px',
                                          borderRadius: '6px',
                                          fontSize: '11px',
                                          fontWeight: '700',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Dispatch Reply
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ width: '130px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '800',
                                letterSpacing: '0.5px',
                                background: e.isReplied ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)',
                                color: e.isReplied ? '#34d399' : '#f43f5e'
                              }}>
                                {e.isReplied ? 'REPLIED' : 'PENDING'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', width: '100px' }}>
                              <button
                                onClick={() => handleDeleteEnquiry(e._id)}
                                style={{
                                  background: 'rgba(244, 63, 94, 0.08)',
                                  border: '1px solid rgba(244, 63, 94, 0.15)',
                                  color: '#f43f5e',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                Discard
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {enquiriesList.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                            Inbox clear. No client enquiries recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* 3. RIGHT PANEL SLIDING DRAWER (Add/Edit Product Panel) */}
      {isProductDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsProductDrawerOpen(false)}>
          <div className="drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '15px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading-primary)' }}>
                {editingProduct ? 'Modify Catalog Item' : 'New Catalog Item'}
              </h3>
              <button 
                onClick={() => setIsProductDrawerOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#9ca3af' }}>Item Name *</label>
                <input 
                  type="text" 
                  className="login-input" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Aura Pro ANC Headphones"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#9ca3af' }}>Brand Name *</label>
                  <input 
                    type="text" 
                    className="login-input" 
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. AuraSound"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#9ca3af' }}>Category</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      border: '1px solid rgba(255, 255, 255, 0.08)', 
                      borderRadius: '10px', 
                      background: 'rgba(3, 7, 18, 0.4)', 
                      color: '#f9fafb',
                      height: '48px',
                      outline: 'none',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#9ca3af' }}>Selling Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="login-input" 
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="299.99"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#9ca3af' }}>Initial Stock Level</label>
                  <input 
                    type="number" 
                    className="login-input" 
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#9ca3af' }}>Image URL link</label>
                <input 
                  type="url" 
                  className="login-input" 
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#9ca3af' }}>Detailed Description</label>
                <textarea 
                  rows="4"
                  style={{ 
                    width: '100%', 
                    padding: '14px 16px', 
                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                    borderRadius: '10px', 
                    background: 'rgba(3, 7, 18, 0.4)', 
                    color: '#f9fafb',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize product specifications..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button 
                  type="button"
                  onClick={() => setIsProductDrawerOpen(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '12px 22px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#9ca3af',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 26px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(99,102,241,0.2)'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CUSTOMER DETAILS SLIDING DRAWER */}
      {selectedCustomerDetails && (
        <div className="drawer-overlay" onClick={() => setSelectedCustomerDetails(null)}>
          <div className="drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '15px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading-primary)' }}>
                Customer Profile Details
              </h3>
              <button 
                onClick={() => setSelectedCustomerDetails(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }}>
              
              {/* Header profile info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(37,99,235,0.25)'
                }}>
                  {selectedCustomerDetails.name ? selectedCustomerDetails.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>{selectedCustomerDetails.name}</h4>
                  <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginTop: '3px' }}>{selectedCustomerDetails.email}</span>
                </div>
              </div>

              {/* Core Parameters list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#818cf8', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  Account Parameters
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', display: 'block' }}>CONTACT MOBILE</span>
                    <span style={{ fontSize: '14px', color: '#f9fafb', fontWeight: '600' }}>{selectedCustomerDetails.mobile || 'Not provided'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', display: 'block' }}>USER ROLE</span>
                    <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: '800', background: 'rgba(129,140,248,0.08)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', display: 'inline-block', marginTop: '2px' }}>
                      {selectedCustomerDetails.role}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', display: 'block' }}>LOCATION (CITY)</span>
                    <span style={{ fontSize: '14px', color: '#f9fafb', fontWeight: '600' }}>{selectedCustomerDetails.location || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', display: 'block' }}>COMPANY NAME</span>
                    <span style={{ fontSize: '14px', color: '#f9fafb', fontWeight: '600' }}>{selectedCustomerDetails.companyName || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', display: 'block' }}>REGISTERED ON</span>
                    <span style={{ fontSize: '13px', color: '#f9fafb' }}>
                      {selectedCustomerDetails.createdAt ? new Date(selectedCustomerDetails.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', display: 'block' }}>ACCESS STATUS</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginTop: '2px',
                      background: selectedCustomerDetails.isBlocked ? 'rgba(244,63,94,0.1)' : 'rgba(52,211,153,0.1)',
                      color: selectedCustomerDetails.isBlocked ? '#f43f5e' : '#34d399'
                    }}>
                      {selectedCustomerDetails.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Login history timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#818cf8', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  Authentication Sessions History
                </h5>

                {selectedCustomerDetails.loginHistory && selectedCustomerDetails.loginHistory.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '1.5px solid rgba(255,255,255,0.06)', paddingLeft: '16px', marginLeft: '6px' }}>
                    {selectedCustomerDetails.loginHistory.slice(0, 5).map((session, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute',
                          left: '-21.5px',
                          top: '4px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#818cf8',
                          border: '2px solid #090d1a'
                        }} />
                        <div>
                          <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700' }}>
                            {new Date(session.timestamp).toLocaleString()}
                          </span>
                          <div style={{ fontSize: '12px', color: '#e5e7eb', marginTop: '2px' }}>
                            IP: <code>{session.ip || '127.0.0.1'}</code>
                          </div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                            Agent: {session.userAgent || 'Web Browser'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
                    No recent active browser sessions recorded.
                  </div>
                )}
              </div>

              {/* Access modifier action button */}
              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleBlock(selectedCustomerDetails._id);
                    setSelectedCustomerDetails(prev => ({ ...prev, isBlocked: !prev.isBlocked }));
                  }}
                  style={{
                    flexGrow: 1,
                    background: selectedCustomerDetails.isBlocked ? 'rgba(52, 211, 153, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                    border: selectedCustomerDetails.isBlocked ? '1px solid rgba(52, 211, 153, 0.15)' : '1px solid rgba(244, 63, 94, 0.15)',
                    color: selectedCustomerDetails.isBlocked ? '#34d399' : '#f43f5e',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {selectedCustomerDetails.isBlocked ? '✓ Revoke Restrict Access' : '✕ Restrict System Access'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
