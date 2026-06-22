import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const gst = +(totalAmount * 0.05).toFixed(2);
  const total = +(totalAmount + gst).toFixed(2);

  if (cartItems.length === 0) {
    return (
      <div className="min-vh-100 bg-dark text-light">
        <Navbar />
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <div className="text-center">
            <div style={{ fontSize: '4rem' }}>🛒</div>
            <h4 className="text-warning mt-3 fw-bold">Your cart is empty</h4>
            <p className="text-secondary">Add some delicious food from the menu</p>
            <button
              className="btn btn-warning fw-bold mt-3"
              onClick={() => navigate('/menu')}
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-dark text-light">

      <Navbar />

      <div className="container py-4">
        <h2 className="text-warning fw-bold mb-1">Your Cart</h2>
        <p className="text-secondary small mb-4">
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
        </p>

        <div className="row g-4">

          {/* Cart Items */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary small">Items</span>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={clearCart}
              >
                Clear All
              </button>
            </div>

            {cartItems.map(item => (
              <div
                key={item.id}
                className="card bg-black text-light border-secondary mb-3"
                style={{ borderRadius: '12px' }}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-center gap-3">

                    {/* Emoji */}
                    <div style={{ fontSize: '2.5rem', width: '60px', textAlign: 'center' }}>
                      {item.emoji}
                    </div>

                    {/* Details */}
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1">{item.name}</h6>
                      <small className="text-secondary">₹{item.price} each</small>
                    </div>

                    {/* Quantity Control */}
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        style={{ width: '32px', height: '32px', padding: 0 }}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="fw-bold" style={{ minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        style={{ width: '32px', height: '32px', padding: 0 }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div style={{ minWidth: '70px', textAlign: 'right' }}>
                      <span className="fw-bold text-warning">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      🗑
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div
              className="card bg-black text-light border border-warning"
              style={{ borderRadius: '12px', position: 'sticky', top: '80px' }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold text-warning mb-4">Order Summary</h5>

                {/* Item list */}
                {cartItems.map(item => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <span className="text-secondary small">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="small">₹{item.price * item.quantity}</span>
                  </div>
                ))}

                <hr className="border-secondary" />

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">GST (5%)</span>
                  <span>₹{gst}</span>
                </div>

                <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                  <span className="text-warning">Total</span>
                  <span className="text-warning">₹{total}</span>
                </div>

                {/* Table Number */}
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    TABLE NUMBER
                  </label>
                  <input
                    type="number"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Enter your table number"
                    style={{ borderRadius: '10px' }}
                  />
                </div>

                {/* Order Type */}
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-bold">
                    ORDER TYPE
                  </label>
                  <div className="d-flex gap-2">
                    <button className="btn btn-warning flex-fill fw-bold btn-sm">
                      🪑 Dine In
                    </button>
                    <button className="btn btn-outline-warning flex-fill fw-bold btn-sm">
                      🥡 Takeaway
                    </button>
                  </div>
                </div>

                <button
                  className="btn btn-warning w-100 fw-bold py-3"
                  style={{ borderRadius: '12px', fontSize: '1rem' }}
                  onClick={() => {
                    alert('✅ Order placed successfully! Please pay at counter.');
                    clearCart();
                    navigate('/restaurants');
                  }}
                >
                  Place Order — ₹{total}
                </button>

                <p className="text-secondary text-center small mt-3 mb-0">
                  💵 Pay at the counter after ordering
                </p>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;