import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState("dine_in");

  const gst = +(totalAmount * 0.05).toFixed(2);
  const total = +(totalAmount + gst).toFixed(2);

  const handlePlaceOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const payload = {
      customer_id: user.id,
      restaurant_id: Number(localStorage.getItem("selectedRestaurantId")),
      table_number: Number(localStorage.getItem("tableNumber")),
      order_type: orderType,
      items: cartItems.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }))
    };
    console.log(payload);

    try {
      const res = await fetch(
        "http://127.0.0.1:5000/api/restaurants/place-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
    alert(data.error || "Order failed.");
    return;
}

alert(`🎉 Order #${data.order_id} placed successfully!`);

clearCart();

navigate("/my-orders");

    } catch (err) {
      console.error(err);
      alert("Unable to connect to backend.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="page-body d-flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
          <div className="text-center">
            <div style={{ fontSize: '4rem' }}>🛒</div>
            <h4 className="restaurant-card-title mt-3">Your cart is empty</h4>
            <p className="text-secondary">Add some delicious food from the menu</p>
            <button
              className="btn-primary-custom mt-3"
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
    <div>
      <Navbar />

      <div className="page-body fade-up pb-5 mb-5">

        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="top-bar-title mb-1">Your Cart</h2>
            <p className="top-bar-sub">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <button
            className="btn-outline-custom"
            onClick={() => navigate('/menu')}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Menu
          </button>
        </div>

        <div className="row g-4">

          {/* Cart Items */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary small">Items</span>
              <button
                className="btn-outline-custom py-1 px-3"
                style={{ fontSize: '0.8rem', color: '#ff4757', borderColor: 'rgba(255,71,87,0.4)' }}
                onClick={clearCart}
              >
                Clear All
              </button>
            </div>

            {cartItems.map(item => (
              <div
                key={item.id}
                className="glass-card mb-3 p-3"
              >
                <div className="d-flex align-items-center gap-3">

                  <div style={{ fontSize: '2.5rem', width: '60px', textAlign: 'center' }}>
                    {item.emoji}
                  </div>

                  <div className="flex-grow-1">
                    <h6 className="menu-card-name mb-1">{item.name}</h6>
                    <small className="text-secondary">₹{item.price} each</small>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn-outline-custom"
                      style={{ width: '32px', height: '32px', padding: 0, fontSize: '1rem' }}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="fw-bold" style={{ minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      className="btn-outline-custom"
                      style={{ width: '32px', height: '32px', padding: 0, fontSize: '1rem' }}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ minWidth: '70px', textAlign: 'right' }}>
                    <span className="menu-price">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>

                  <button
                    className="btn-outline-custom"
                    style={{ color: '#ff4757', borderColor: 'rgba(255,71,87,0.4)' }}
                    onClick={() => removeFromCart(item.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>

                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div
              className="glass-card p-4"
              style={{ position: 'sticky', top: '80px', border: '1px solid rgba(255,193,7,0.3)' }}
            >
              <h5 className="restaurant-card-title mb-4">Order Summary</h5>

              {cartItems.map(item => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="small">₹{item.price * item.quantity}</span>
                </div>
              ))}

              <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary">GST (5%)</span>
                <span>₹{gst}</span>
              </div>

              <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                <span className="menu-price">Total</span>
                <span className="menu-price">₹{total}</span>
              </div>

              {/* Table Number */}
              <div className="search-input mb-3" style={{ cursor: 'default' }}>
                <i className="bi bi-geo-alt me-2"></i>
                Table {localStorage.getItem("tableNumber")}
              </div>

              {/* Order Type */}
              <div className="mb-4">
                <label className="nav-section-label d-block mb-2">
                  ORDER TYPE
                </label>
                <div className="d-flex gap-2">
                  <button
                    className={orderType === "dine_in" ? "btn-primary-custom flex-fill justify-content-center" : "btn-outline-custom flex-fill justify-content-center"}
                    onClick={() => setOrderType("dine_in")}
                  >
                    🪑 Dine In
                  </button>
                  <button
                    className={orderType === "takeaway" ? "btn-primary-custom flex-fill justify-content-center" : "btn-outline-custom flex-fill justify-content-center"}
                    onClick={() => setOrderType("takeaway")}
                  >
                    🥡 Takeaway
                  </button>
                </div>
              </div>

              <button
                className="btn-primary-custom w-100 justify-content-center py-3"
                style={{ fontSize: '1rem' }}
                onClick={handlePlaceOrder}
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
  );
};

export default Cart;