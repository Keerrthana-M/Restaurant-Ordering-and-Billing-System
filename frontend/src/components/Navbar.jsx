import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ hideToggle = false, forceDark = false, showOnlyLogin = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const dropdownRef = useRef(null);

  const { user, logout, isLoggedIn } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch active order count for customer
  useEffect(() => {
    if (isLoggedIn && user?.role === 'customer' && user?.id) {
      fetch(`http://127.0.0.1:5000/api/restaurants/customer-orders/${user.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(orders => {
          if (Array.isArray(orders)) {
            const active = orders.filter(o =>
              ['pending', 'preparing', 'ready'].includes((o.status || '').toLowerCase())
            );
            setActiveOrderCount(active.length);
          }
        })
        .catch(err => console.log(err));
    }
  }, [isLoggedIn, user]);

  const handleHomeClick = () => {
    if (isLoggedIn && user?.role === 'customer') {
      navigate('/restaurants');
    } else {
      navigate('/');
    }
  };

  const customerLinks = [
    { label: 'Menu', path: '/menu', icon: '🍽' },
    { label: 'Restaurants', path: '/restaurants', icon: '🏪' },
    { label: 'My Orders', path: '/my-orders', icon: '📋' },
    { label: 'Scan QR', path: '/scan', icon: '📷' },
    { label: 'Cart', path: '/cart', icon: '🛒' },
  ];

  const links = user?.role === 'waiter'
    ? [{ label: 'Dashboard', path: '/waiter', icon: '📋' }]
    : user?.role === 'admin'
    ? [{ label: 'Dashboard', path: '/admin', icon: '📊' }]
    : customerLinks;

  return (
    <>
      <nav 
        // If forceDark is true, drop the glass-card class so it doesn't adapt to light mode
        className={forceDark ? "" : "glass-card"}
        style={{
          // If forceDark is true, force a dark background
          background: forceDark ? 'rgba(15, 17, 23, 0.95)' : undefined,
          borderBottom: '1px solid rgba(255,193,7,0.2)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 200,
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none'
        }}
      >
        {/* Left - Hamburger + Home + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {isLoggedIn && !showOnlyLogin && (
            <button
              onClick={() => setMenuOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--brand-color, #ffc107)', fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px' }}
            >
              ☰
            </button>
          )}
          <button
            onClick={handleHomeClick}
            title={isLoggedIn && user?.role === 'customer' ? "Go to Select Restaurant" : "Go to Home"}
            style={{ background: 'none', border: 'none', color: 'var(--brand-color, #ffc107)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 6px' }}
          >
            🏠
          </button>
          <span
            onClick={handleHomeClick}
            // If forced dark, ensure the text stays white instead of turning black
            className={forceDark ? "text-light" : "top-bar-title"}
            style={{ fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
          >
            🍽 Goodfood Easyfood
          </span>
        </div>

        {/* Right - Theme Toggle + Cart + My Orders + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Render the toggle button ONLY if hideToggle is false */}
          {!hideToggle && (
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              style={{ background: 'transparent', border: '1px solid rgba(255,193,7,0.3)', borderRadius: 8, padding: '6px 10px', color: 'var(--brand-color, #ffc107)', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}

          {/* Cart Button */}
          {isLoggedIn && !showOnlyLogin && user?.role !== 'waiter' && user?.role !== 'admin' && (
            <button
              onClick={() => navigate('/cart')}
              style={{ background: 'transparent', border: '1px solid var(--brand-color, #ffc107)', borderRadius: 8, padding: '6px 14px', color: 'var(--brand-color, #ffc107)', fontSize: '0.8rem', cursor: 'pointer', position: 'relative' }}
            >
              🛒 Cart
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#ff4757', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {/* My Orders Button for Customer */}
          {isLoggedIn && !showOnlyLogin && user?.role === 'customer' && (
            <button
              onClick={() => navigate('/my-orders')}
              style={{ background: 'transparent', border: '1px solid var(--brand-color, #ffc107)', borderRadius: 8, padding: '6px 14px', color: 'var(--brand-color, #ffc107)', fontSize: '0.8rem', cursor: 'pointer', position: 'relative' }}
            >
              📋 My Orders
              {activeOrderCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#ffc107', color: '#000', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeOrderCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Dropdown Menu */}
          {showOnlyLogin ? (
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'var(--brand-color, #ffc107)', border: 'none', borderRadius: 8, padding: '6px 16px', color: '#000', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Login
            </button>
          ) : isLoggedIn ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(prev => !prev)}
                style={{ background: 'transparent', border: '1px solid var(--border-color, rgba(255,255,255,0.2))', borderRadius: 8, padding: '6px 14px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                👤 {user?.name || user?.username || 'User'} <span style={{ fontSize: '0.65rem', color: 'var(--brand-color, #ffc107)' }}>▼</span>
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: 160,
                    background: '#151821',
                    border: '1px solid rgba(255,193,7,0.3)',
                    borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    zIndex: 400,
                    overflow: 'hidden',
                    padding: '6px 0'
                  }}
                >
                  {user?.role === 'customer' && (
                    <button
                      onClick={() => { navigate('/my-orders'); setUserDropdownOpen(false); }}
                      style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,193,7,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      📋 My Orders
                    </button>
                  )}
                  <button
                    onClick={() => { logout(); navigate('/login'); setUserDropdownOpen(false); }}
                    style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#ff4757', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,71,87,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'var(--brand-color, #ffc107)', border: 'none', borderRadius: 8, padding: '6px 16px', color: '#000', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Slide-out menu */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300 }}>
          <div 
            onClick={e => e.stopPropagation()} 
            className="glass-card"
            style={{ width: 280, height: '100%', padding: '24px 16px', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <span className="top-bar-title" style={{ fontWeight: 800 }}>Menu</span>
              <button onClick={() => setMenuOpen(false)} className="text-secondary" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <button
              onClick={() => { handleHomeClick(); setMenuOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', background: 'none', border: 'none', borderRadius: 10, color: 'inherit', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}
            >
              <span>🏠</span> Home
            </button>

            {links.map(link => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', background: 'none', border: 'none', borderRadius: 10, color: 'inherit', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}
              >
                <span>{link.icon}</span> {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;