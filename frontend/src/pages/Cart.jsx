import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState("dine_in");
  const [tableNumber, setTableNumber] = useState(localStorage.getItem("tableNumber") || "");
  const [tableError, setTableError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState(null);

  const gst = +(totalAmount * 0.05).toFixed(2);
  const total = +(totalAmount + gst).toFixed(2);

  const handlePlaceOrder = async () => {
    if (orderType === "dine_in") {
      if (!tableNumber || !tableNumber.toString().trim()) {
        setTableError("Please enter your table number.");
        return;
      }
    }
    setTableError("");

    const user = JSON.parse(localStorage.getItem("user"));

    const payload = {
      customer_id: user?.id,
      restaurant_id: Number(localStorage.getItem("selectedRestaurantId")),
      table_number: orderType === "dine_in" ? Number(tableNumber) : null,
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

      setPlacedOrderInfo(data);
      setOrderSuccess(true);
      clearCart();

      setTimeout(() => {
        navigate("/my-orders");
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("Unable to connect to backend.");
    }
  };

  if (orderSuccess) {
    return (
      <div>
        <Navbar />
        <div className="page-body d-flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
          <div className="text-center glass-card p-5" style={{ maxWidth: 460 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</div>
            <h3 className="text-light fw-bold mb-2">Order Placed Successfully!</h3>
            <p className="text-warning fw-bold fs-5 mb-3">
              Tracking your order...
            </p>
            <p className="text-secondary small mb-4">
              Your order #{placedOrderInfo?.order_id} has been sent to {placedOrderInfo?.restaurant || 'the kitchen'}.
            </p>
            <div className="d-flex align-items-center justify-content-center gap-2 text-warning small">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Redirecting to My Orders page...
            </div>
          </div>
        </div>
      </div>
    );
  }

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

              {/* Order Type */}
              <div className="mb-4">
                <label className="nav-section-label d-block mb-2">
                  ORDER TYPE
                </label>
                <div className="d-flex gap-2 mb-3">
                  <button
                    type="button"
                    className={orderType === "dine_in" ? "btn-primary-custom flex-fill justify-content-center" : "btn-outline-custom flex-fill justify-content-center"}
                    onClick={() => {
                      setOrderType("dine_in");
                      setTableError("");
                    }}
                  >
                    🪑 Dine In
                  </button>
                  <button
                    type="button"
                    className={orderType === "takeaway" ? "btn-primary-custom flex-fill justify-content-center" : "btn-outline-custom flex-fill justify-content-center"}
                    onClick={() => {
                      setOrderType("takeaway");
                      setTableError("");
                    }}
                  >
                    🥡 Takeaway
                  </button>
                </div>

                {/* Table Number Input Field (Required for Dine In, Hidden for Takeaway) */}
                {orderType === "dine_in" && (
                  <div>
                    <label className="nav-section-label d-block mb-1">
                      TABLE NUMBER
                    </label>
                    <div className="search-input mb-1" style={{ border: tableError ? '1px solid #ff4757' : '1px solid rgba(255,255,255,0.1)' }}>
                      <i className="bi bi-geo-alt me-2"></i>
                      <input
                        type="text"
                        placeholder="Enter the table number in front of you"
                        value={tableNumber}
                        onChange={(e) => {
                          setTableNumber(e.target.value);
                          if (e.target.value.trim()) setTableError("");
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          outline: 'none',
                          width: '100%',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    {tableError && (
                      <small className="text-danger d-block mt-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                        {tableError}
                      </small>
                    )}
                  </div>
                )}
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