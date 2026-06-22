import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const menuData = [
  { id: 1, name: 'Idli Sambar', category: 'Breakfast', price: 60, description: 'Soft idlis with hot sambar and chutney', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=250&fit=crop' },
  { id: 2, name: 'Masala Dosa', category: 'Breakfast', price: 80, description: 'Crispy dosa with spiced potato filling', image: 'https://www.cookwithmanali.com/wp-content/uploads/2020/05/Masala-Dosa.jpg' },
  { id: 3, name: 'Pongal', category: 'Breakfast', price: 70, description: 'Creamy rice and lentil dish with ghee', image: 'https://files.prokerala.com/recipes/pics/1024/venn-pongal-41.jpg' },
  { id: 4, name: 'Butter Chicken', category: 'Main Course', price: 280, description: 'Creamy tomato-based curry with chicken', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Chicken_makhani.jpg' },
  { id: 5, name: 'Biryani', category: 'Main Course', price: 320, description: 'Aromatic basmati rice with spiced meat', image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&h=250&fit=crop' },
  { id: 6, name: 'Paneer Tikka', category: 'Starters', price: 220, description: 'Grilled cottage cheese with spices', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=250&fit=crop' },
  { id: 7, name: 'Samosa', category: 'Starters', price: 40, description: 'Crispy pastry with spiced potato filling', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop' },
  { id: 8, name: 'Gulab Jamun', category: 'Desserts', price: 80, description: 'Soft milk dumplings in sugar syrup', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIBaiAdYy-d6SCXCndRDyfg_Txdv35ecAVhFV35VcMgdHXXDlxsammBAE&s=10' },
  { id: 9, name: 'Ice Cream', category: 'Desserts', price: 90, description: 'Creamy vanilla and chocolate scoops', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=250&fit=crop' },
  { id: 10, name: 'Mango Lassi', category: 'Beverages', price: 90, description: 'Refreshing mango yogurt drink', image: 'https://st3.depositphotos.com/5653638/19408/i/450/depositphotos_194087460-stock-photo-mango-lassi-smoothie-big-glasses.jpg' },
  { id: 11, name: 'Cold Coffee', category: 'Beverages', price: 100, description: 'Chilled blended coffee with cream', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=250&fit=crop' },
  { id: 12, name: 'Chicken Kebab', category: 'Starters', price: 260, description: 'Juicy minced chicken skewers', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=250&fit=crop' },
];

const categories = ['All', 'Breakfast', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState({});
  const { addToCart, totalItems } = useCart();
  const { navigate } = useNavigate();

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
    <div className="page-body fade-up pb-5 mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="top-bar-title mb-1">Our Menu</h2>
          <p className="top-bar-sub">Browse categories and add items to your cart</p>
        </div>
      </div>

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
                      backgroundImage: `url(${item.image})`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center',
                      height: '140px'
                    }}
                  />
                  <div className="menu-card-body d-flex flex-column flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge-pill gold">{item.category}</span>
                      <span className="menu-price">₹{item.price}</span>
                    </div>
                    <h6 className="menu-card-name text-light">{item.name}</h6>
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
              <h5 className="mt-3 text-light">No dishes found</h5>
              <p className="text-secondary small">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;