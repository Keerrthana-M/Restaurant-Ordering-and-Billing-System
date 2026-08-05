import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const categories = ['All', 'Breakfast', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

const fallbackImages = {
  Breakfast: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=250&fit=crop',
  Starters: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop',
  'Main Course': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&h=250&fit=crop',
  Desserts: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=250&fit=crop',
  Beverages: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=250&fit=crop',
};

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState({});
  const [menuData, setMenuData] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const restaurantId = localStorage.getItem('selectedRestaurantId');

  useEffect(() => {
    if (!restaurantId) {
      navigate('/restaurants');
      return;
    }

    Promise.all([
      fetch(`http://127.0.0.1:5000/api/restaurants/${restaurantId}/menu`).then(res => {
        if (!res.ok) throw new Error('Failed to load menu');
        return res.json();
      }),
      fetch(`http://127.0.0.1:5000/api/restaurants/${restaurantId}`).then(res => {
        if (!res.ok) return null;
        return res.json();
      })
    ])
      .then(([menuItems, restDetails]) => {
        setMenuData(menuItems || []);
        if (restDetails) setRestaurantInfo(restDetails);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [restaurantId, navigate]);

  const filtered = menuData.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (item) => {
    addToCart(item);
    setAdded(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [item.id]: false })), 1000);
  };

  return (
    <div>
      <Navbar />

      <div className="page-body fade-up pb-5 mb-5">

        {/* Header with Restaurant Context */}
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div>
            <h2 className="top-bar-title mb-1">
              Our Menu {restaurantInfo?.name ? <span style={{ color: 'var(--brand-color, #ffc107)' }}>at {restaurantInfo.name}</span> : ''}
            </h2>
            {restaurantInfo ? (
              <div className="d-flex align-items-center gap-2 flex-wrap mt-1" style={{ fontSize: '0.85rem' }}>
                <span className="badge-pill blue"><i className="bi bi-cup-hot me-1"></i>{restaurantInfo.cuisine_type || 'General'}</span>
                <span className="text-secondary">•</span>
                <span className="text-secondary"><i className="bi bi-geo-alt me-1"></i>{restaurantInfo.area || restaurantInfo.address}</span>
                {restaurantInfo.opening_hours && (
                  <>
                    <span className="text-secondary">•</span>
                    <span style={{ color: '#4caf50' }}><i className="bi bi-clock me-1"></i>{restaurantInfo.opening_hours}</span>
                  </>
                )}
              </div>
            ) : (
              <p className="top-bar-sub mb-0">Browse categories and add items to your cart</p>
            )}
          </div>
          <button className="btn-outline-custom" onClick={() => navigate('/restaurants')}>
            <i className="bi bi-arrow-left me-1"></i> Change Restaurant
          </button>
        </div>

        {loading && (
          <p className="text-secondary text-center">Loading menu...</p>
        )}

        {error && (
          <p className="text-danger text-center">{error} — is the Flask server running?</p>
        )}

        {!loading && !error && (
          <div className="row g-4">

            {/* Left Sidebar for Filters */}
            <div className="col-lg-3">
              <div className="glass-card position-sticky" style={{ top: '20px' }}>
                <div className="search-wrapper mb-4">
                  <i className="bi bi-search search-icon"></i>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search dishes..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <h6 className="nav-section-label mb-3">Categories</h6>
                <div className="d-flex flex-column gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      <i className={`bi ${activeCategory === cat ? 'bi-check2-circle' : 'bi-circle'} me-2`}></i>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Area for Menu Grid */}
            <div className="col-lg-9">
              <p className="text-secondary small mb-3">{filtered.length} items found</p>
              <div className="row g-3">
                {filtered.map(item => (
                  <div className="col-md-6 col-xl-4" key={item.id}>
                    <div className="menu-card h-100 d-flex flex-column">
                     <div
  className="menu-card-emoji"
  style={{
    backgroundImage: `url(${item.image_url || fallbackImages[item.category] || fallbackImages['Main Course']})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    height: '180px'
  }}
/>
                      <div className="menu-card-body d-flex flex-column flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="badge-pill gold">{item.category}</span>
                          <span className="menu-price">₹{item.price}</span>
                        </div>
                        <h6 className="menu-card-name">{item.name}</h6>
                        <p className="menu-card-desc flex-grow-1">{item.description}</p>
                        <button
                          className={`btn-primary-custom w-100 justify-content-center mt-2 ${added[item.id] ? 'bg-success border-success text-white' : ''}`}
                          onClick={() => handleAdd(item)}
                        >
                          {added[item.id] ? <><i className="bi bi-check2"></i> Added</> : '+ Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="glass-card text-center py-5 mt-3">
                  <i className="bi bi-search" style={{ fontSize: '3rem', color: '#4a5568' }}></i>
                  <h5 className="mt-3">No dishes found</h5>
                  <p className="text-secondary small">Try adjusting your search or filter.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;