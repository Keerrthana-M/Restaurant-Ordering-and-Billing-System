import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const restaurants = [
  {
    id: 1,
    name: 'Saravana Bhavan',
    area: 'Adyar',
    cuisine: 'South Indian',
    timing: '7 AM - 11 PM',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=300&fit=crop',
    description: 'Famous for idli, dosa and sambar'
  },
  {
    id: 2,
    name: 'KFC',
    area: 'Anna Nagar',
    cuisine: 'Fast Food',
    timing: '10 AM - 12 AM',
    image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=600&h=300&fit=crop',
    description: 'Crispy fried chicken, burgers and wraps'
  },
  {
    id: 3,
    name: 'Murugan Idli Shop',
    area: 'T Nagar',
    cuisine: 'South Indian',
    timing: '6 AM - 10 PM',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=300&fit=crop',
    description: 'World famous idli and sambar since 1970'
  },
];

const RestaurantList = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <div className="page-body fade-up">

        {/* Top Bar */}
        <div className="mb-5">
          <h2 className="top-bar-title mb-1">Select a Restaurant</h2>
          <p className="top-bar-sub">Choose a restaurant or scan the QR code at your table</p>
        </div>

        {/* QR Banner */}
        <div className="qr-banner glass-card mb-5 d-flex align-items-center justify-content-between p-4">
          <div className="d-flex align-items-center gap-4">
            <div className="qr-banner-icon" style={{ fontSize: '2.5rem' }}>
              <i className="bi bi-qr-code-scan text-warning"></i>
            </div>
            <div>
              <h5 className="qr-banner-title mb-1 text-light fw-bold">Scan QR Code</h5>
              <p className="qr-banner-text text-secondary mb-0">
                At the restaurant? Scan the table QR code to order instantly.
              </p>
            </div>
          </div>
          <button className="btn-primary-custom" onClick={() => navigate('/scan')}>
            <i className="bi bi-camera"></i> Open Scanner
          </button>
        </div>

        <div className="or-divider mb-5">OR BROWSE RESTAURANTS</div>

        {/* Restaurant Cards */}
        <div className="row g-4">
          {restaurants.map((r, i) => (
            <div className="col-md-4" key={r.id}>
              <div className="restaurant-card h-100" style={{ animationDelay: `${i * 0.1}s` }}>
                <div
                  className="restaurant-card-banner"
                  style={{
                    backgroundImage: `url(${r.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="restaurant-card-body">
                  <h4 className="restaurant-card-title">{r.name}</h4>
                  <div className="d-flex gap-2 mb-3 flex-wrap">
                    <span className="badge-pill gold"><i className="bi bi-geo-alt me-1"></i>{r.area}</span>
                    <span className="badge-pill blue"><i className="bi bi-cup-hot me-1"></i>{r.cuisine}</span>
                    <span className="badge-pill purple"><i className="bi bi-clock me-1"></i>{r.timing}</span>
                  </div>
                  <p className="restaurant-card-info mb-4" style={{ fontSize: '0.85rem' }}>{r.description}</p>
                  <button className="btn-primary-custom w-100 justify-content-center" onClick={() => navigate('/menu')}>
                    View Menu <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default RestaurantList;