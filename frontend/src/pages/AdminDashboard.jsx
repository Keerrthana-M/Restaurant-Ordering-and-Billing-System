import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Navbar from '../components/Navbar';

const salesData = [
  { day: 'Mon', revenue: 4200 },
  { day: 'Tue', revenue: 3800 },
  { day: 'Wed', revenue: 5100 },
  { day: 'Thu', revenue: 4700 },
  { day: 'Fri', revenue: 6200 },
  { day: 'Sat', revenue: 7800 },
  { day: 'Sun', revenue: 6900 },
];

const categoryData = [
  { name: 'Main Course', value: 45 },
  { name: 'Starters', value: 25 },
  { name: 'Beverages', value: 15 },
  { name: 'Desserts', value: 10 },
  { name: 'Breakfast', value: 5 },
];

const COLORS = ['#ffc107', '#ff9800', '#ff5722', '#4caf50', '#2196f3'];

const recentOrders = [
  { id: 'ORD-001', table: 3, restaurant: 'Saravana Bhavan', total: 920, status: 'Preparing' },
  { id: 'ORD-002', table: 7, restaurant: 'KFC', total: 340, status: 'Ready' },
  { id: 'ORD-003', table: 1, restaurant: 'Murugan Idli Shop', total: 180, status: 'Pending' },
  { id: 'ORD-004', table: 5, restaurant: 'Saravana Bhavan', total: 560, status: 'Delivered' },
];

const statusColor = {
  Pending: 'warning',
  Preparing: 'info',
  Ready: 'primary',
  Delivered: 'success',
};

const StatCard = ({ title, value, sub, icon, color }) => (
  <div
    className="glass-card h-100"
    style={{ borderRadius: '14px' }}
  >
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
  const [restaurants, setRestaurants] = useState([
    { id: 1, name: 'Saravana Bhavan', area: 'Adyar', cuisine: 'South Indian' },
    { id: 2, name: 'KFC', area: 'Anna Nagar', cuisine: 'Fast Food' },
    { id: 3, name: 'Murugan Idli Shop', area: 'T Nagar', cuisine: 'South Indian' },
  ]);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', area: '', cuisine: '' });

  const handleAddRestaurant = () => {
    if (!newRestaurant.name || !newRestaurant.area || !newRestaurant.cuisine) {
      alert('Please fill all fields');
      return;
    }
    setRestaurants(prev => [...prev, { id: prev.length + 1, ...newRestaurant }]);
    setNewRestaurant({ name: '', area: '', cuisine: '' });
    alert('Restaurant added successfully!');
  };

  return (
    <div className="page-body min-vh-100">

      <Navbar />

      <div className="container-fluid px-4 py-4">

        {/* Page Header */}
        <div className="mb-4">
          <h2 className="top-bar-title fw-bold mb-1">Admin Dashboard</h2>
          <p className="text-secondary small">
            Manage restaurants, menus and view analytics
          </p>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'restaurants', label: '🏪 Restaurants' },
            { id: 'orders', label: '📦 Orders' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn ${activeTab === tab.id ? 'btn-warning' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stat Cards */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3">
                <StatCard title="Today's Revenue" value="₹38,400" sub="+12% from yesterday" icon="💰" color="#ffc107" />
              </div>
              <div className="col-6 col-lg-3">
                <StatCard title="Total Orders" value="84" sub="18 active right now" icon="📦" color="#4caf50" />
              </div>
              <div className="col-6 col-lg-3">
                <StatCard title="Restaurants" value="3" sub="All active" icon="🏪" color="#2196f3" />
              </div>
              <div className="col-6 col-lg-3">
                <StatCard title="Avg Order Value" value="₹457" sub="Per order today" icon="📈" color="#ff9800" />
              </div>
            </div>

            {/* Charts */}
            <div className="row g-3 mb-4">

              {/* Bar Chart */}
              <div className="col-lg-8">
                <div
                  className="glass-card h-100"
                  style={{ borderRadius: '14px' }}
                >
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-4">
                      Weekly Revenue
                    </h6>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} />
                        <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                        <Tooltip
                          contentStyle={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', color: 'var(--text-color, #000)' }}
                          formatter={v => [`₹${v}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#ffc107" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="col-lg-4">
                <div
                  className="glass-card h-100"
                  style={{ borderRadius: '14px' }}
                >
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-4">
                      Sales by Category
                    </h6>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={40}
                        >
                          {categoryData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', color: 'var(--text-color, #000)' }}
                          formatter={v => [`${v}%`, 'Sales']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2">
                      {categoryData.map((cat, i) => (
                        <div key={cat.name} className="d-flex justify-content-between align-items-center mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i] }}></div>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>{cat.name}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: COLORS[i], fontWeight: 700 }}>{cat.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div
              className="glass-card"
              style={{ borderRadius: '14px' }}
            >
              <div className="card-body p-4">
                <h6 className="fw-bold mb-4">Recent Orders</h6>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th className="text-secondary fw-normal small border-bottom">Order ID</th>
                        <th className="text-secondary fw-normal small border-bottom">Restaurant</th>
                        <th className="text-secondary fw-normal small border-bottom">Table</th>
                        <th className="text-secondary fw-normal small border-bottom">Total</th>
                        <th className="text-secondary fw-normal small border-bottom">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id}>
                          <td className="fw-bold">{order.id}</td>
                          <td className="text-secondary">{order.restaurant}</td>
                          <td className="text-secondary">Table {order.table}</td>
                          <td className="fw-bold">₹{order.total}</td>
                          <td>
                            <span className={`badge bg-${statusColor[order.status]}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESTAURANTS TAB ── */}
        {activeTab === 'restaurants' && (
          <div>
            {/* Add Restaurant Form */}
            <div
              className="glass-card mb-4"
              style={{ borderRadius: '14px', border: '1px solid var(--border-color)' }}
            >
              <div className="card-body p-4">
                <h6 className="fw-bold mb-4">
                  ➕ Register New Restaurant
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Restaurant Name"
                      value={newRestaurant.name}
                      onChange={e => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                      style={{ borderRadius: '10px' }}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Area (e.g. Adyar)"
                      value={newRestaurant.area}
                      onChange={e => setNewRestaurant({ ...newRestaurant, area: e.target.value })}
                      style={{ borderRadius: '10px' }}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cuisine Type"
                      value={newRestaurant.cuisine}
                      onChange={e => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
                      style={{ borderRadius: '10px' }}
                    />
                  </div>
                </div>
                <button
                  className="btn btn-warning fw-bold mt-3"
                  onClick={handleAddRestaurant}
                  style={{ borderRadius: '10px' }}
                >
                  Register Restaurant
                </button>
              </div>
            </div>

            {/* Restaurant List */}
            <div className="row g-3">
              {restaurants.map(r => (
                <div className="col-md-4" key={r.id}>
                  <div
                    className="glass-card"
                    style={{ borderRadius: '14px' }}
                  >
                    <div className="card-body p-4">
                      <h5 className="fw-bold mb-2">{r.name}</h5>
                      <p className="text-secondary small mb-1">📍 {r.area}</p>
                      <p className="text-secondary small mb-3">🍽 {r.cuisine}</p>
                      <div
                        className="p-2 rounded text-center mb-3"
                        style={{ background: 'var(--input-bg, #f8f9fa)', fontSize: '0.75rem', color: 'var(--text-color, #666)' }}
                      >
                        QR Code will be generated by backend
                      </div>
                      <button className="btn btn-outline-warning btn-sm w-100">
                        Manage Menu
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div
            className="glass-card"
            style={{ borderRadius: '14px' }}
          >
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4">All Orders</h6>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th className="text-secondary fw-normal small border-bottom">Order ID</th>
                      <th className="text-secondary fw-normal small border-bottom">Restaurant</th>
                      <th className="text-secondary fw-normal small border-bottom">Table</th>
                      <th className="text-secondary fw-normal small border-bottom">Total</th>
                      <th className="text-secondary fw-normal small border-bottom">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td className="fw-bold">{order.id}</td>
                        <td className="text-secondary">{order.restaurant}</td>
                        <td className="text-secondary">Table {order.table}</td>
                        <td className="fw-bold">₹{order.total}</td>
                        <td>
                          <span className={`badge bg-${statusColor[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;