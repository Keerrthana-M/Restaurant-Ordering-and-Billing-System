import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const fallbackImages = {
  'South Indian': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=300&fit=crop',
  'Fast Food': 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=600&h=300&fit=crop',
  'North Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=300&fit=crop',
  'Chinese': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=300&fit=crop',
  'Italian': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=300&fit=crop',
  'Biryani': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&h=300&fit=crop',
  'Cafe': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=300&fit=crop',
  'Default': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=300&fit=crop'
};

const RestaurantList = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New state to track what the user is typing in the search bar
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Removed the trailing slash here to fix the 404 error
    fetch('http://127.0.0.1:5000/api/restaurants')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load restaurants');
        return res.json();
      })
      .then(data => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleViewMenu = (restaurantId) => {
    localStorage.setItem('selectedRestaurantId', restaurantId);
    navigate('/menu');
  };

  // THE NEW LOGIC: Hide by default unless searched
  const displayedRestaurants = searchQuery.trim() === '' 
    ? [] // If search is empty, return an empty array (0 cards)
    : restaurants.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (r.cuisine_type && r.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <div className="page-body fade-up pb-5 mb-5">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="top-bar-title mb-1">Select a Restaurant</h2>
          <p className="top-bar-sub">Choose a restaurant or scan the QR code at your table</p>
        </div>
        <button className="btn-outline-custom ms-3 py-1 px-2" onClick={() => navigate('/login')}>
          Logout
        </button>
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

      {/* Search Bar */}
      <div className="mb-4">
        <div className="position-relative">
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ fontSize: '1.2rem' }}></i>
          <input
            type="text"
            className="w-100 py-3 pe-3 rounded glass-card border-0 text-light"
            placeholder="Search by restaurant name or cuisine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              paddingLeft: '3rem' // Pushes text to the right of the absolute icon
            }}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <p className="text-secondary text-center py-5">Loading restaurants from database...</p>
      )}

      {/* Error state */}
      {error && (
        <p className="text-danger text-center py-5">{error} — is the Flask server running?</p>
      )}

      {/* Zero State: Ask user to search if the bar is empty */}
      {!loading && !error && searchQuery.trim() === '' && (
        <div className="text-center py-5">
          <i className="bi bi-search mb-3 d-block" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
          <h5 className="text-light">Find your favorite food</h5>
          <p className="text-secondary">Type a restaurant name or cuisine (e.g., "Biryani") in the search bar above.</p>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && searchQuery.trim() !== '' && displayedRestaurants.length === 0 && (
        <div className="text-center py-5">
          <p className="text-secondary">No restaurants found matching "{searchQuery}".</p>
        </div>
      )}

      {/* Restaurant Cards */}
      {!loading && !error && displayedRestaurants.length > 0 && (
        <div className="row g-4">
          {displayedRestaurants.map((r, i) => (
            <div className="col-md-4" key={r.id}>
              <div className="restaurant-card h-100" style={{ animationDelay: `${i * 0.1}s` }}>
                <div 
                  className="restaurant-card-banner" 
                  style={{ 
                    backgroundImage: `url(${fallbackImages[r.cuisine_type] || fallbackImages['Default']})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center' 
                  }}
                />
                <div className="restaurant-card-body">
                  <h4 className="restaurant-card-title">{r.name}</h4>
                  <div className="d-flex gap-2 mb-3 flex-wrap">
                    <span className="badge-pill gold"><i className="bi bi-geo-alt me-1"></i>{r.area || 'Unknown Location'}</span>
                    <span className="badge-pill blue"><i className="bi bi-cup-hot me-1"></i>{r.cuisine_type || 'General'}</span>
                  </div>
                  <p className="restaurant-card-info mb-4" style={{ fontSize: '0.85rem' }}>{r.address || 'Address not available'}</p>
                  <button className="btn-primary-custom w-100 justify-content-center" onClick={() => handleViewMenu(r.id)}>
                    View Menu <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;