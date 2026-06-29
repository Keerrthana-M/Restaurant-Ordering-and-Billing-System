import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const initialOrders = [
  {
    id: 'ORD-001',
    table: 3,
    items: [
      { name: 'Butter Chicken', qty: 1, price: 280 },
      { name: 'Biryani', qty: 2, price: 320 },
    ],
    status: 'Pending',
    time: '1:05 PM',
    type: 'Dine In'
  },
  {
    id: 'ORD-002',
    table: 7,
    items: [
      { name: 'Masala Dosa', qty: 2, price: 80 },
      { name: 'Mango Lassi', qty: 2, price: 90 },
    ],
    status: 'Preparing',
    time: '1:15 PM',
    type: 'Dine In'
  },
  {
    id: 'ORD-003',
    table: 1,
    items: [
      { name: 'Paneer Tikka', qty: 1, price: 220 },
      { name: 'Cold Coffee', qty: 1, price: 100 },
    ],
    status: 'Ready',
    time: '1:20 PM',
    type: 'Takeaway'
  },
  {
    id: 'ORD-004',
    table: 5,
    items: [
      { name: 'Idli Sambar', qty: 3, price: 60 },
    ],
    status: 'Delivered',
    time: '12:50 PM',
    type: 'Dine In'
  },
];

const statusColor = {
  Pending: 'warning',
  Preparing: 'info',
  Ready: 'primary',
  Delivered: 'success',
};

const statusSteps = ['Pending', 'Preparing', 'Ready', 'Delivered'];

const WaiterDashboard = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered'];

  const filtered = activeTab === 'All'
    ? orders
    : orders.filter(o => o.status === activeTab);

  const updateStatus = (id, newStatus) => {
    setOrders(prev =>
      prev.map(o => o.id === id ? { ...o, status: newStatus } : o)
    );
  };

  const getTotal = (items) =>
    items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const getNextStatus = (current) => {
    const idx = statusSteps.indexOf(current);
    return idx < statusSteps.length - 1 ? statusSteps[idx + 1] : null;
  };

  return (
    <div className="page-body min-vh-100">

      <Navbar />

      <div className="container py-4">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="top-bar-title fw-bold mb-1">Waiter Dashboard</h2>
            <p className="text-secondary small">Manage and update orders</p>
          </div>

          {/* Summary Cards */}
          <div className="d-flex gap-3">
            {['Pending', 'Preparing', 'Ready'].map(s => (
              <div
                key={s}
                className="glass-card text-center p-2"
                style={{ minWidth: '80px', borderRadius: '10px' }}
              >
                <div className={`fw-bold text-${statusColor[s]} fs-4`}>
                  {orders.filter(o => o.status === s).length}
                </div>
                <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                  {s}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`btn btn-sm ${activeTab === tab ? 'btn-warning' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="ms-1 badge bg-secondary">
                {tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="row g-3">
          {filtered.map(order => (
            <div className="col-md-6" key={order.id}>
              <div
                className="glass-card h-100"
                style={{ borderRadius: '14px' }}
              >
                <div className="card-body p-4">

                  {/* Order Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="fw-bold mb-0">{order.id}</h6>
                      <small className="text-secondary">
                        Table {order.table} · {order.time} · {order.type}
                      </small>
                    </div>
                    <span className={`badge bg-${statusColor[order.status]}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="mb-3">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="d-flex justify-content-between py-1 border-bottom"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <span>{item.name} × {item.qty}</span>
                        <span className="text-secondary">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="d-flex justify-content-between fw-bold mb-3">
                    <span className="text-secondary">Total</span>
                    <span>₹{getTotal(order.items)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-2">
                    {getNextStatus(order.status) && (
                      <button
                        className="btn btn-warning btn-sm fw-bold flex-fill"
                        onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                      >
                        Mark {getNextStatus(order.status)}
                      </button>
                    )}
                    {order.status === 'Delivered' && (
                      <button
                        className="btn btn-success btn-sm fw-bold flex-fill"
                        disabled
                      >
                        ✓ Completed
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-5 text-secondary">
            <div style={{ fontSize: '3rem' }}>📋</div>
            <h5 className="mt-3">No orders in this category</h5>
          </div>
        )}

      </div>
    </div>
  );
};

export default WaiterDashboard;