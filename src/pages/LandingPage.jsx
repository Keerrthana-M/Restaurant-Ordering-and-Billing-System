import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

const restaurants = [
  {
    id: 'rest-one',
    emoji: '🍛',
    name: 'Saravana Bhavan — Adyar',
    cuisine: 'South Indian',
    area: 'Adyar',
    timing: '7 AM – 11 PM',
    description: "Famous for idli, dosa, and sambar. One of Chennai's most loved vegetarian restaurants."
  },
  {
    id: 'rest-two',
    emoji: '🍗',
    name: 'KFC — Anna Nagar',
    cuisine: 'Fast Food',
    area: 'Anna Nagar',
    timing: '10 AM – 12 AM',
    description: 'Crispy fried chicken, burgers, and wraps. Perfect for quick meals.'
  },
  {
    id: 'rest-three',
    emoji: '🥘',
    name: 'Murugan Idli Shop — T Nagar',
    cuisine: 'South Indian',
    area: 'T Nagar',
    timing: '6 AM – 10 PM',
    description: "World famous idli and sambar. A Chennai breakfast institution since 1970."
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [openAccordion, setOpenAccordion] = useState(null);
  const { setThemeOverride } = useTheme();

  // 🎯 THE FIX: Lock the app into dark mode while on this page
  useEffect(() => {
    setThemeOverride('dark');
    
    // Cleanup function: release the lock when navigating away!
    return () => setThemeOverride(null);
  }, [setThemeOverride]);

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-dark text-light min-vh-100" style={{ backgroundColor: '#0a0a0f' }}>

      <Navbar hideToggle forceDark />

      {/* Hero */}
      <section style={{
        backgroundImage: "url('/food-mix-salad-noodles-grillea-chicken-garlic-greena-top-view.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }}></div>
        <div className="container d-flex align-items-center" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          <div>
            <p className="fw-bold text-warning" style={{ letterSpacing: '3px', fontSize: '0.85rem' }}>
              WELCOME TO
            </p>
            <h1 className="display-3 fw-bold mb-3 text-white">
              Goodfood <span className="text-warning">Easyfood</span>
            </h1>
            <p className="lead mb-4 text-light" style={{ maxWidth: 500, opacity: 0.8 }}>
              Order from Chennai's best restaurants. Scan the QR code at your table and order instantly — no app download needed.
            </p>
            <button className="btn btn-warning btn-lg me-3 fw-bold" onClick={() => navigate('/login')}>
              Order Now
            </button>
            <button className="btn btn-outline-light btn-lg fw-bold" onClick={() => scrollTo('restaurants')}>
              View Restaurants
            </button>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-5 bg-dark" style={{ backgroundColor: '#0f1117' }}>
        <div className="container">
          <h2 className="text-center mb-2 fw-bold text-warning">Who Uses Our App?</h2>
          <p className="text-center mb-5 text-secondary">Three different roles, one powerful platform</p>
          <div className="row g-4">

            <div className="col-md-4">
              <div className="card bg-black text-light h-100 border border-warning" style={{ borderRadius: '16px' }}>
                <div className="card-body text-center p-4">
                  <div className="h1 mb-3 text-warning"><i className="bi bi-person-fill"></i></div>
                  <h3 className="card-title mb-3 fw-bold">Customer</h3>
                  <p className="card-text text-secondary">
                    Scan QR code at your table, browse the menu, and place your order directly from your phone.
                  </p>
                  <button className="btn btn-warning mt-3 fw-bold" onClick={() => navigate('/login')}>
                    Login as Customer
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-black text-light h-100 border border-secondary" style={{ borderRadius: '16px' }}>
                <div className="card-body text-center p-4">
                  <div className="h1 mb-3 text-warning"><i className="bi bi-clipboard-check-fill"></i></div>
                  <h3 className="card-title mb-3 fw-bold">Waiter</h3>
                  <p className="card-text text-secondary">
                    View incoming orders, update status, and manage today's menu availability.
                  </p>
                  <button className="btn btn-warning mt-3 fw-bold" onClick={() => navigate('/login')}>
                    Login as Waiter
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-black text-light h-100 border border-secondary" style={{ borderRadius: '16px' }}>
                <div className="card-body text-center p-4">
                  <div className="h1 mb-3 text-warning"><i className="bi bi-speedometer2"></i></div>
                  <h3 className="card-title mb-3 fw-bold">Admin</h3>
                  <p className="card-text text-secondary">
                    Register your restaurant, add menu items, manage waiters, and view analytics dashboard.
                  </p>
                  <button className="btn btn-warning mt-3 fw-bold" onClick={() => navigate('/login')}>
                    Login as Admin
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5 bg-black text-light">
        <div className="container">
          <h2 className="text-center mb-2 fw-bold text-white">How It Works</h2>
          <p className="text-center mb-5 text-secondary">Order food in 3 simple steps</p>
          <div className="row g-4 text-center">

            {[
              { step: 1, title: 'Scan QR Code', text: 'Go to any partner restaurant and scan the QR code on your table' },
              { step: 2, title: 'Choose Your Food', text: 'Browse the restaurant menu and add items to your cart' },
              { step: 3, title: 'Place Your Order', text: 'Confirm your order and pay at the counter. That\'s it!' },
            ].map(s => (
              <div className="col-md-4" key={s.step}>
                <div
                  className="bg-warning rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-dark"
                  style={{ width: 60, height: 60 }}
                >
                  <h4 className="mb-0 fw-bold">{s.step}</h4>
                </div>
                <h5 className="fw-bold text-white">{s.title}</h5>
                <p className="text-secondary">{s.text}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Restaurants Accordion */}
      <section id="restaurants" className="py-5 bg-dark text-light">
        <div className="container">
          <h2 className="text-center mb-2 fw-bold text-warning">Our Partner Restaurants</h2>
          <p className="text-center mb-5 text-secondary">Scan their QR code and order instantly</p>

          <div className="accordion" id="restaurantAccordion">
            {restaurants.map(r => (
              <div className="accordion-item bg-black text-light border border-secondary mt-2" style={{ overflow: 'hidden', borderRadius: '12px' }} key={r.id}>
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button bg-black text-light fw-bold ${openAccordion !== r.id ? 'collapsed' : ''}`}
                    type="button"
                    style={{ boxShadow: 'none' }}
                    onClick={() => toggleAccordion(r.id)}
                  >
                    {r.emoji} {r.name}
                  </button>
                </h2>
                <div className={`accordion-collapse collapse ${openAccordion === r.id ? 'show' : ''}`}>
                  <div className="accordion-body text-secondary border-top border-secondary">
                    <strong className="text-warning">Cuisine:</strong> {r.cuisine} &nbsp;|&nbsp;
                    <strong className="text-warning">Area:</strong> {r.area} &nbsp;|&nbsp;
                    <strong className="text-warning">Timing:</strong> {r.timing}
                    <br /><br />
                    {r.description}
                    <br /><br />
                    <button className="btn btn-warning btn-sm fw-bold" onClick={() => navigate('/login')}>
                      View Menu
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-light py-4 border-top border-secondary">
        <div className="container text-center">
          <h5 className="mb-1 fw-bold text-warning">🍽 Goodfood Easyfood</h5>
          <p className="small mb-2 text-secondary">Chennai's universal restaurant ordering platform</p>
          <p className="small mb-0 text-secondary">© 2026 Goodfood Easyfood. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;