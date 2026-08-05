import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const statusColor = {
  pending: '#ffc107',
  preparing: '#2196f3',
  ready: '#9c27b0',
  delivered: '#4caf50',
};

const statusSteps = [
  'pending',
  'preparing',
  'ready',
  'delivered'
];

const WaiterDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const restaurantId = localStorage.getItem("selectedRestaurantId");

  const loadOrders = async () => {
    try {
      console.log("Restaurant ID:", restaurantId);

      const res = await fetch(
        `http://127.0.0.1:5000/api/restaurants/orders/${restaurantId}`
      );

      const data = await res.json();

      console.log("Orders from API:", data);

      setOrders(data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const tabs = ['All', 'pending', 'preparing', 'ready', 'delivered'];

  const filtered = activeTab === 'All'
    ? orders
    : orders.filter(o => o.status === activeTab);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch(
        `http://127.0.0.1:5000/api/restaurants/order/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      loadOrders();

    } catch (err) {
      console.log(err);
    }
  };

  const getTotal = (items) =>
    items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const getNextStatus = (current) => {
    const idx = statusSteps.indexOf(current);
    return idx < statusSteps.length - 1 ? statusSteps[idx + 1] : null;
  };

  return (
    <div>
      <Navbar />

      <div className="page-body fade-up pb-5 mb-5">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
          <div>
            <h2 className="top-bar-title mb-1">Waiter Dashboard</h2>
            <p className="top-bar-sub">Manage and update orders</p>
          </div>

          {/* Summary Cards */}
          <div className="d-flex gap-3">
            {['pending', 'preparing', 'ready'].map(s => (
              <div
                key={s}
                className="glass-card text-center p-3"
                style={{ minWidth: '90px' }}
              >
                <div className="fw-bold fs-4" style={{ color: statusColor[s] }}>
                  {orders.filter(o => o.status === s).length}
                </div>
                <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
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
              className={activeTab === tab ? "btn-primary-custom" : "btn-outline-custom"}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span
                className="badge-pill gold ms-2"
                style={{ fontSize: '0.7rem' }}
              >
                {tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="row g-3">
          {filtered.map(order => (
            <div className="col-md-6" key={order.order_id}>
              <div className="glass-card h-100 p-4">

                {/* Order Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <h6 className="menu-card-name mb-0">Order #{order.order_id}</h6>
                      {order.order_type === 'takeaway' ? (
                        <span
                          className="badge-pill"
                          style={{
                            background: '#0dcaf022',
                            color: '#0dcaf0',
                            border: '1px solid #0dcaf055',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          🥡 Takeaway
                        </span>
                      ) : (
                        <span
                          className="badge-pill gold"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          🪑 Dine In
                        </span>
                      )}
                    </div>
                    <small className="text-secondary">
                      {order.order_type === 'takeaway'
                        ? `${order.created_at}`
                        : `Table ${order.table_number || 'N/A'} · ${order.created_at}`}
                    </small>
                  </div>
                  <span
                    className="badge-pill"
                    style={{
                      background: `${statusColor[order.status]}22`,
                      color: statusColor[order.status],
                      border: `1px solid ${statusColor[order.status]}55`
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
                  <span className="menu-price">₹{order.total_amount}</span>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2">
                  {getNextStatus(order.status) && (
                    <button
                      className="btn-primary-custom flex-fill justify-content-center"
                      onClick={() => updateStatus(order.order_id, getNextStatus(order.status))}
                    >
                      Mark {getNextStatus(order.status)}
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button
                      className="btn-outline-custom flex-fill justify-content-center"
                      style={{ color: '#4caf50', borderColor: 'rgba(76,175,80,0.4)' }}
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

        {filtered.length === 0 && (
          <div className="glass-card text-center py-5 mt-3">
            <i className="bi bi-clipboard" style={{ fontSize: '3rem', color: '#4a5568' }}></i>
            <h5 className="mt-3">No orders in this category</h5>
          </div>
        )}

      </div>
    </div>
  );
};

export default WaiterDashboard;