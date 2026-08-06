import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { QRCodeCanvas } from 'qrcode.react';
import Navbar from '../components/Navbar';

const COLORS = ['#ffc107', '#ff9800', '#ff5722', '#4caf50', '#2196f3'];

const statusColor = {
  pending: '#ffc107',
  preparing: '#2196f3',
  ready: '#9c27b0',
  delivered: '#4caf50',
  Pending: '#ffc107',
  Preparing: '#2196f3',
  Ready: '#9c27b0',
  Delivered: '#4caf50',
};

const statusSteps = ['pending', 'preparing', 'ready', 'delivered'];

const StatCard = ({ title, value, sub, icon, color }) => (
  <div className="glass-card h-100" style={{ borderRadius: '14px' }}>
    <div className="card-body p-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <p className="text-secondary small mb-1">{title}</p>
          <h3 className="fw-bold mb-0" style={{ color }}>{value}</h3>
        </div>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
      </div>
      <p className="text-secondary small mb-0">{sub}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [waiters, setWaiters] = useState([]);
  
  // Profile State
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '', address: '', contact_number: '', description: '', opening_hours: '', logo: ''
  });
  
  // Orders State
  const [allOrders, setAllOrders] = useState([]);
  const [orderFilterTab, setOrderFilterTab] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '', category: '', price: '', description: '', image_url: '', is_available: true
  });
  
  const [showWaiterForm, setShowWaiterForm] = useState(false);
  const [waiterForm, setWaiterForm] = useState({ name: '' });

  const restaurantId = localStorage.getItem("selectedRestaurantId") || localStorage.getItem("adminRestaurantId");

  const getIdToUse = () => {
    // 1. First priority: The restaurant linked directly to the logged-in admin user's account
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed && parsed.restaurant_id) {
          return parsed.restaurant_id;
        }
      } catch (e) {}
    }
    // 2. Fallbacks
    return localStorage.getItem("adminRestaurantId") || localStorage.getItem("selectedRestaurantId");
  };

  const loadData = () => {
    const idToUse = getIdToUse();
    if (idToUse) {
      fetch(`http://127.0.0.1:5000/api/restaurants/${idToUse}`)
        .then(res => res.json())
        .then(data => {
            setProfile(data);
            setProfileForm({
                name: data.name || '',
                address: data.address || '',
                contact_number: data.contact_number || '',
                description: data.description || '',
                opening_hours: data.opening_hours || '',
                logo: data.logo || ''
            });
        })
        .catch(err => console.log(err));

      fetch(`http://127.0.0.1:5000/api/restaurants/admin-stats/${idToUse}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.log(err));
        
      fetch(`http://127.0.0.1:5000/api/restaurants/admin-menu/${idToUse}`)
        .then(res => res.json())
        .then(data => setMenuItems(data))
        .catch(err => console.log(err));
        
      fetch(`http://127.0.0.1:5000/api/restaurants/admin-waiters/${idToUse}`)
        .then(res => res.json())
        .then(data => setWaiters(data))
        .catch(err => console.log(err));
        
      fetch(`http://127.0.0.1:5000/api/restaurants/orders/${idToUse}`)
        .then(res => res.json())
        .then(data => setAllOrders(data))
        .catch(err => console.log(err));
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  // PROFILE LOGIC
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const idToUse = getIdToUse();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/restaurants/admin-profile/${idToUse}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileForm)
      });
      if(res.ok) {
        alert("Profile updated successfully!");
        loadData();
      } else alert("Failed to update profile");
    } catch(err) { console.log(err); }
  };

  // MENU LOGIC
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const idToUse = getIdToUse();
    if (!menuForm.name || !menuForm.price) return alert("Name and Price are required.");
    
    const url = editingItem 
      ? `http://127.0.0.1:5000/api/restaurants/admin-menu/${editingItem.id}`
      : `http://127.0.0.1:5000/api/restaurants/admin-menu/${idToUse}`;
    const method = editingItem ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(menuForm)
      });
      if(res.ok) {
        setShowMenuForm(false);
        setEditingItem(null);
        setMenuForm({ name: '', category: '', price: '', description: '', image_url: '', is_available: true });
        loadData();
      } else alert("Failed to save menu item");
    } catch(err) { console.log(err); }
  };

  const handleDeleteMenu = async (id) => {
    if(!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/restaurants/admin-menu/${id}`, { method: 'DELETE' });
      if(res.ok) loadData();
    } catch(err) { console.log(err); }
  };
  
  const toggleAvailability = async (id, currentVal) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/restaurants/admin-menu/${id}`, { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_available: !currentVal })
      });
      if(res.ok) loadData();
    } catch(err) { console.log(err); }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name, category: item.category || '', price: item.price, description: item.description || '', image_url: item.image_url || '', is_available: item.is_available
    });
    setShowMenuForm(true);
  };
  
  const openAdd = () => {
    setEditingItem(null);
    setMenuForm({ name: '', category: '', price: '', description: '', image_url: '', is_available: true });
    setShowMenuForm(true);
  };
  
  // WAITER LOGIC
  const handleWaiterSubmit = async (e) => {
    e.preventDefault();
    const idToUse = getIdToUse();
    if (!waiterForm.name) return alert("Name is required.");
    
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/restaurants/admin-waiters/${idToUse}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(waiterForm)
      });
      if(res.ok) {
        setShowWaiterForm(false);
        setWaiterForm({ name: '' });
        loadData();
      } else alert("Failed to add waiter");
    } catch(err) { console.log(err); }
  };

  const toggleWaiterStatus = async (id, currentVal) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/restaurants/admin-waiters/${id}`, { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !currentVal })
      });
      if(res.ok) loadData();
    } catch(err) { console.log(err); }
  };
  
  const regenerateWaiterCode = async (id) => {
    if(!window.confirm("Generate a new login code for this waiter? The old code will instantly stop working.")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/restaurants/admin-waiters/${id}`, { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ regenerate_code: true })
      });
      if(res.ok) loadData();
    } catch(err) { console.log(err); }
  };
  
  const handleDeleteWaiter = async (id) => {
    if(!window.confirm("Are you sure you want to completely remove this waiter?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/restaurants/admin-waiters/${id}`, { method: 'DELETE' });
      if(res.ok) loadData();
    } catch(err) { console.log(err); }
  };

  // ORDER LOGIC
  const getNextStatus = (current) => {
    const idx = statusSteps.indexOf(current.toLowerCase());
    return idx < statusSteps.length - 1 ? statusSteps[idx + 1] : null;
  };
  
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/restaurants/order/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      loadData();
    } catch (err) { console.log(err); }
  };

  const searchedOrders = allOrders.filter(o => 
    o.order_id.toString().includes(orderSearch) || 
    (o.table_number && o.table_number.toString().includes(orderSearch))
  );

  const filteredOrders = orderFilterTab === 'All'
    ? searchedOrders
    : searchedOrders.filter(o => o.status.toLowerCase() === orderFilterTab.toLowerCase());

  return (
    <div className="page-body min-vh-100 pb-5">
      <Navbar />

      <div className="container-fluid px-4 py-4">
        {/* Page Header */}
        <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-3 mb-1">
              <h2 className="top-bar-title fw-bold mb-0">Admin Dashboard</h2>
              {profile?.name && (
                <span className="badge bg-warning text-dark fs-6 px-3 py-2" style={{ borderRadius: '10px' }}>
                  <i className="bi bi-shop me-1"></i> {profile.name}
                </span>
              )}
            </div>
            <p className="text-secondary small mb-0">
              Manage analytics, menu, staff, and orders for {profile?.name ? <strong>{profile.name}</strong> : 'your restaurant'}
            </p>
          </div>
          {profile && profile.logo && (
             <img src={profile.logo} alt="Restaurant Logo" style={{ height: '50px', borderRadius: '8px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
          )}
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {[
            { id: 'dashboard', label: 'Analytics' },
            { id: 'menu', label: 'Menu Management' },
            { id: 'waiters', label: 'Staff Management' },
            { id: 'orders', label: 'Orders' },
            { id: 'profile', label: 'Restaurant Profile' },
          ].map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "btn-primary-custom" : "btn-outline-custom"}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && profile && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="glass-card" style={{ borderRadius: '14px' }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Edit Restaurant Profile</h5>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="text-secondary small">Restaurant Name</label>
                        <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} required />
                      </div>
                      <div className="col-md-6">
                        <label className="text-secondary small">Contact Number</label>
                        <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={profileForm.contact_number} onChange={e => setProfileForm({...profileForm, contact_number: e.target.value})} />
                      </div>
                      <div className="col-12">
                        <label className="text-secondary small">Address</label>
                        <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-secondary small">Opening Hours</label>
                        <input type="text" className="form-control" placeholder="e.g. 10:00 AM - 11:00 PM" style={{ borderRadius: '10px' }} value={profileForm.opening_hours} onChange={e => setProfileForm({...profileForm, opening_hours: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-secondary small">Logo URL</label>
                        <input type="text" className="form-control" placeholder="https://..." style={{ borderRadius: '10px' }} value={profileForm.logo} onChange={e => setProfileForm({...profileForm, logo: e.target.value})} />
                      </div>
                      <div className="col-12">
                        <label className="text-secondary small">Description</label>
                        <textarea className="form-control" rows="3" style={{ borderRadius: '10px' }} value={profileForm.description} onChange={e => setProfileForm({...profileForm, description: e.target.value})}></textarea>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end mt-4">
                      <button type="submit" className="btn btn-warning fw-bold px-4" style={{ borderRadius: '10px' }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>

              {/* ── QR CODE CARD ── */}
              {profile.qr_code_token ? (
                <div className="glass-card mt-4" style={{ borderRadius: '14px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                      <div>
                        <h5 className="fw-bold mb-1">📲 Restaurant QR Code</h5>
                        <p className="text-secondary small mb-0">Customers scan this QR to instantly open your menu. One QR per restaurant — no table-level codes needed.</p>
                      </div>
                    </div>

                    {/* QR Image */}
                    <div className="d-flex flex-column align-items-center py-4">
                      <div
                        id="restaurant-qr-canvas-wrapper"
                        style={{
                          background: '#fff',
                          padding: '20px',
                          borderRadius: '16px',
                          display: 'inline-block',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
                        }}
                      >
                        <QRCodeCanvas
                          id="restaurant-qr-canvas"
                          value={profile.qr_code_token}
                          size={220}
                          bgColor="#ffffff"
                          fgColor="#111111"
                          level="H"
                          includeMargin={false}
                        />
                        <p className="text-center mt-2 mb-0 fw-bold" style={{ color: '#111', fontSize: '0.8rem', letterSpacing: 1 }}>
                          {profile.name}
                        </p>
                      </div>

                      {/* Token display */}
                      <div className="mt-3 px-3 py-2 rounded" style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)' }}>
                        <span className="text-secondary small me-2">Token:</span>
                        <code className="text-warning" style={{ fontSize: '0.85rem', letterSpacing: 1 }}>{profile.qr_code_token}</code>
                      </div>

                      {/* Buttons */}
                      <div className="d-flex gap-3 mt-4 flex-wrap justify-content-center">
                        <button
                          className="btn btn-warning fw-bold px-4"
                          style={{ borderRadius: '10px' }}
                          onClick={() => {
                            const canvas = document.getElementById('restaurant-qr-canvas');
                            if (!canvas) return;
                            const url = canvas.toDataURL('image/png');
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${profile.name.replace(/\s+/g, '_')}_QR.png`;
                            link.click();
                          }}
                        >
                          ⬇️ Download QR Code
                        </button>
                        <button
                          className="btn btn-outline-warning fw-bold px-4"
                          style={{ borderRadius: '10px' }}
                          onClick={() => {
                            const canvas = document.getElementById('restaurant-qr-canvas');
                            if (!canvas) return;
                            const dataUrl = canvas.toDataURL('image/png');
                            const printWindow = window.open('', '_blank', 'width=400,height=500');
                            printWindow.document.write(`
                              <html><head><title>QR Code - ${profile.name}</title>
                              <style>
                                body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #fff; }
                                img { width: 260px; height: 260px; }
                                h2 { margin-top: 16px; font-size: 1.2rem; color: #111; }
                                p { color: #555; font-size: 0.8rem; margin-top: 4px; }
                              </style></head>
                              <body>
                                <img src="${dataUrl}" />
                                <h2>${profile.name}</h2>
                                <p>Scan to view our menu</p>
                              </body></html>
                            `);
                            printWindow.document.close();
                            printWindow.focus();
                            setTimeout(() => printWindow.print(), 500);
                          }}
                        >
                          🖨️ Print QR Code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card mt-4 p-4 text-center text-secondary" style={{ borderRadius: '14px' }}>
                  <p className="mb-0">Loading QR code...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3"><StatCard title="Today's Revenue" value={`₹${stats.todays_revenue}`} sub="Total revenue today" icon={<i className="bi bi-wallet2" style={{color: '#ffc107'}}></i>} color="#ffc107" /></div>
              <div className="col-6 col-lg-3"><StatCard title="Weekly Revenue" value={`₹${stats.weekly_revenue}`} sub="This week" icon={<i className="bi bi-calendar-range" style={{color: '#4caf50'}}></i>} color="#4caf50" /></div>
              <div className="col-6 col-lg-3"><StatCard title="Monthly Revenue" value={`₹${stats.monthly_revenue}`} sub="This month" icon={<i className="bi bi-calendar-check" style={{color: '#2196f3'}}></i>} color="#2196f3" /></div>
              <div className="col-6 col-lg-3"><StatCard title="Total Orders" value={stats.total_orders} sub="All time orders" icon={<i className="bi bi-bag-check" style={{color: '#ff9800'}}></i>} color="#ff9800" /></div>
              <div className="col-6 col-lg-3"><StatCard title="Peak Ordering Time" value={stats.peak_time} sub="Most active hour" icon={<i className="bi bi-clock" style={{color: '#e91e63'}}></i>} color="#e91e63" /></div>
              <div className="col-6 col-lg-3"><StatCard title="Avg Order Value" value={`₹${stats.average_order_value}`} sub="Across all orders" icon={<i className="bi bi-graph-up-arrow" style={{color: '#9c27b0'}}></i>} color="#9c27b0" /></div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <div className="glass-card h-100 p-4" style={{ borderRadius: '14px' }}>
                  <h6 className="fw-bold mb-4">Category-wise Sales</h6>
                  {stats.category_sales && stats.category_sales.length > 0 ? (
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.category_sales} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {stats.category_sales.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-secondary py-5">No sales data available.</div>
                  )}
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="glass-card h-100 p-4" style={{ borderRadius: '14px' }}>
                  <h6 className="fw-bold mb-4">Top Selling Items</h6>
                  {stats.top_items && stats.top_items.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead>
                          <tr>
                            <th className="text-secondary fw-normal small border-bottom">Item Name</th>
                            <th className="text-secondary fw-normal small border-bottom text-end">Quantity Sold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.top_items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="fw-bold">{item.name}</td>
                              <td className="text-end text-warning fw-bold">{item.sold}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-secondary py-5">No items sold yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ borderRadius: '14px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-4">Recent Orders (At a glance)</h6>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th className="text-secondary fw-normal small border-bottom">Order ID</th>
                        <th className="text-secondary fw-normal small border-bottom">Table</th>
                        <th className="text-secondary fw-normal small border-bottom">Total</th>
                        <th className="text-secondary fw-normal small border-bottom">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_orders.map(order => (
                        <tr key={order.id}>
                          <td className="fw-bold">{order.id}</td>
                          <td className="text-secondary">Table {order.table}</td>
                          <td className="fw-bold">₹{order.total}</td>
                          <td>
                            <span className="badge" style={{ background: `${statusColor[order.status.toLowerCase()] || '#555'}33`, color: statusColor[order.status.toLowerCase()] || '#ccc' }}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {stats.recent_orders.length === 0 && (
                        <tr><td colSpan="4" className="text-center py-4 text-secondary">No recent orders found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* ── MENU TAB ── */}
        {activeTab === 'menu' && (
          <div>
            {showMenuForm && (
              <div className="glass-card mb-4" style={{ borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-4">{editingItem ? '✏️ Edit Menu Item' : '➕ Add Menu Item'}</h6>
                  <form onSubmit={handleMenuSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="text-secondary small">Name</label>
                        <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} required />
                      </div>
                      <div className="col-md-6">
                        <label className="text-secondary small">Category</label>
                        <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-secondary small">Price (₹)</label>
                        <input type="number" className="form-control" style={{ borderRadius: '10px' }} value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} required />
                      </div>
                      <div className="col-md-6">
                        <label className="text-secondary small">Image URL</label>
                        <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={menuForm.image_url} onChange={e => setMenuForm({...menuForm, image_url: e.target.value})} placeholder="https://images.unsplash.com/..." />
                        <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                          💡 <strong>Tip:</strong> Direct image links ending in <code>.jpg</code>, <code>.png</code>, or Unsplash/Imgur links work best. Google Search page URLs (e.g. <code>google.com/imgres?...</code>) will not render.
                        </small>
                      </div>
                      <div className="col-12">
                        <label className="text-secondary small">Description</label>
                        <textarea className="form-control" style={{ borderRadius: '10px' }} rows="2" value={menuForm.description} onChange={e => setMenuForm({...menuForm, description: e.target.value})}></textarea>
                      </div>
                      <div className="col-12">
                        <div className="form-check form-switch mt-2">
                          <input className="form-check-input" type="checkbox" id="availabilitySwitch" checked={menuForm.is_available} onChange={e => setMenuForm({...menuForm, is_available: e.target.checked})} />
                          <label className="form-check-label text-secondary small" htmlFor="availabilitySwitch">Available to Order</label>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-warning fw-bold" style={{ borderRadius: '10px' }}>{editingItem ? 'Save Changes' : 'Add Item'}</button>
                      <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '10px' }} onClick={() => setShowMenuForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {!showMenuForm && (
              <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-warning fw-bold" style={{ borderRadius: '10px' }} onClick={openAdd}>➕ Add New Item</button>
              </div>
            )}

            <div className="glass-card" style={{ borderRadius: '14px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-4">Current Menu</h6>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th className="text-secondary fw-normal small border-bottom">Image</th>
                        <th className="text-secondary fw-normal small border-bottom">Item Name</th>
                        <th className="text-secondary fw-normal small border-bottom">Category</th>
                        <th className="text-secondary fw-normal small border-bottom">Price</th>
                        <th className="text-secondary fw-normal small border-bottom">Status</th>
                        <th className="text-secondary fw-normal small border-bottom text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map(item => (
                        <tr key={item.id}>
                          <td>
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.name} 
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=100&h=100&fit=crop';
                                }}
                              />
                            ) : (
                              <div style={{ width: '40px', height: '40px', background: '#333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍽</div>
                            )}
                          </td>
                          <td className="fw-bold">
                            {item.name}
                            <div className="text-secondary small" style={{ fontSize: '0.75rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.description}
                            </div>
                          </td>
                          <td className="text-secondary">{item.category}</td>
                          <td className="fw-bold text-warning">₹{item.price}</td>
                          <td>
                            <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                              <input className="form-check-input ms-0 me-2" type="checkbox" checked={item.is_available} onChange={() => toggleAvailability(item.id, item.is_available)} />
                              <span className={`small ${item.is_available ? 'text-success' : 'text-danger'}`}>{item.is_available ? 'Available' : 'Unavailable'}</span>
                            </div>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-info me-2" onClick={() => openEdit(item)}>✏️ Edit</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMenu(item.id)}>🗑 Delete</button>
                          </td>
                        </tr>
                      ))}
                      {menuItems.length === 0 && (
                        <tr><td colSpan="6" className="text-center py-5 text-secondary">No menu items found. Click "Add New Item" to start.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* ── WAITERS TAB ── */}
        {activeTab === 'waiters' && (
          <div>
            {showWaiterForm && (
              <div className="glass-card mb-4" style={{ borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-4">➕ Add New Waiter</h6>
                  <form onSubmit={handleWaiterSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="text-secondary small">Waiter Name</label>
                        <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={waiterForm.name} onChange={e => setWaiterForm({...waiterForm, name: e.target.value})} required />
                        <div className="text-secondary small mt-1">A secure 6-character login code will be automatically generated.</div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-warning fw-bold" style={{ borderRadius: '10px' }}>Register Waiter</button>
                      <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '10px' }} onClick={() => setShowWaiterForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {!showWaiterForm && (
              <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-warning fw-bold" style={{ borderRadius: '10px' }} onClick={() => setShowWaiterForm(true)}>➕ Add Waiter</button>
              </div>
            )}

            <div className="glass-card" style={{ borderRadius: '14px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-4">Staff Members</h6>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th className="text-secondary fw-normal small border-bottom">Name</th>
                        <th className="text-secondary fw-normal small border-bottom">Login Code</th>
                        <th className="text-secondary fw-normal small border-bottom">Status</th>
                        <th className="text-secondary fw-normal small border-bottom text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waiters.map(waiter => (
                        <tr key={waiter.id}>
                          <td className="fw-bold">👨‍🍳 {waiter.name}</td>
                          <td><code className="bg-dark px-2 py-1 rounded text-warning" style={{ fontSize: '0.9rem' }}>{waiter.waiter_code}</code></td>
                          <td>
                            <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                              <input className="form-check-input ms-0 me-2" type="checkbox" checked={waiter.is_active} onChange={() => toggleWaiterStatus(waiter.id, waiter.is_active)} />
                              <span className={`small ${waiter.is_active ? 'text-success' : 'text-danger'}`}>{waiter.is_active ? 'Active' : 'Disabled'}</span>
                            </div>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-info me-2" onClick={() => regenerateWaiterCode(waiter.id)}>🔄 Regenerate Code</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteWaiter(waiter.id)}>🗑 Delete</button>
                          </td>
                        </tr>
                      ))}
                      {waiters.length === 0 && (
                        <tr><td colSpan="4" className="text-center py-5 text-secondary">No waiters found. Click "Add Waiter" to register your staff.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              {/* Order Status Filters */}
              <div className="d-flex gap-2 flex-wrap">
                {['All', ...statusSteps].map(tab => (
                  <button
                    key={tab}
                    className={orderFilterTab === tab ? "btn-primary-custom" : "btn-outline-custom"}
                    onClick={() => setOrderFilterTab(tab)}
                    style={{ borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.9rem', border: orderFilterTab !== tab ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className="badge-pill gold ms-2" style={{ fontSize: '0.7rem' }}>
                      {tab === 'All' ? searchedOrders.length : searchedOrders.filter(o => o.status.toLowerCase() === tab.toLowerCase()).length}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Search Bar */}
              <div style={{ maxWidth: '300px', flexGrow: 1 }}>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="🔍 Search by Order ID or Table..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{ borderRadius: '20px' }}
                />
              </div>
            </div>
            
            {/* Orders Grid */}
            <div className="row g-3">
              {filteredOrders.map(order => (
                <div className="col-md-6 col-lg-4" key={order.order_id}>
                  <div className="glass-card h-100 p-4" style={{ borderRadius: '14px' }}>
                    {/* Order Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-0">Order #{order.order_id}</h6>
                        <small className="text-secondary">
                          Table {order.table_number} · {order.created_at} · {order.order_type || "Dine In"}
                        </small>
                      </div>
                      <span
                        className="badge-pill"
                        style={{
                          background: `${statusColor[order.status.toLowerCase()]}22`,
                          color: statusColor[order.status.toLowerCase()],
                          border: `1px solid ${statusColor[order.status.toLowerCase()]}55`
                        }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="mb-3">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="d-flex justify-content-between py-1"
                          style={{ fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <span>{item.name} × {item.quantity}</span>
                          <span className="text-secondary">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="d-flex justify-content-between fw-bold mb-3">
                      <span className="text-secondary">Total</span>
                      <span className="text-warning">₹{order.total_amount}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      {getNextStatus(order.status) && (
                        <button
                          className="btn btn-sm w-100 fw-bold"
                          style={{ 
                            background: 'var(--primary-color)', color: '#000', borderRadius: '8px'
                          }}
                          onClick={() => updateOrderStatus(order.order_id, getNextStatus(order.status))}
                        >
                          Mark {getNextStatus(order.status)}
                        </button>
                      )}
                      {order.status.toLowerCase() === 'delivered' && (
                        <button
                          className="btn btn-sm w-100 fw-bold"
                          style={{ color: '#4caf50', border: '1px solid rgba(76,175,80,0.4)', borderRadius: '8px', background: 'transparent' }}
                          disabled
                        >
                          ✓ Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="glass-card text-center py-5 mt-3" style={{ borderRadius: '14px' }}>
                <h5 className="text-secondary">No orders found matching your criteria.</h5>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;