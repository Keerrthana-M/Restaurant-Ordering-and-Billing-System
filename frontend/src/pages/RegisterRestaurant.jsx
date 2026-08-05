import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

const CUISINE_OPTIONS = [
  'South Indian',
  'North Indian',
  'Chinese',
  'Fast Food',
  'Cafe',
  'Bakery',
  'Multi-Cuisine',
  'Biryani',
  'Italian',
];

const RegisterRestaurant = () => {
  const navigate = useNavigate();
  const { setThemeOverride } = useTheme();

  // Force dark mode on this page (matches landing page style)
  useEffect(() => {
    setThemeOverride('dark');
    return () => setThemeOverride(null);
  }, [setThemeOverride]);

  // Form state — grouped by section
  const [form, setForm] = useState({
    owner_name: '',
    email: '',
    password: '',
    confirm_password: '',
    restaurant_name: '',
    phone: '',
    address: '',
    cuisine_type: '',
    opening_hours: '',
    gst_number: '',
  });

  // UX state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Countdown after success
  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) {
      navigate('/login?role=admin');
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear the specific field error as user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Client-side validation
  const validate = () => {
    const errors = {};
    if (!form.owner_name.trim()) errors.owner_name = 'Owner name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Valid email address is required';
    if (!form.password || form.password.length < 8)
      errors.password = 'Password must be at least 8 characters';
    if (form.confirm_password !== form.password)
      errors.confirm_password = 'Passwords do not match';
    if (!form.restaurant_name.trim()) errors.restaurant_name = 'Restaurant name is required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone))
      errors.phone = 'Valid 10-digit phone number is required';
    if (!form.address.trim()) errors.address = 'Address is required';
    if (!form.cuisine_type) errors.cuisine_type = 'Please select a cuisine type';
    if (!form.opening_hours.trim()) errors.opening_hours = 'Opening hours are required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Run client-side validation first
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error
      const firstKey = Object.keys(errors)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        owner_name: form.owner_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        restaurant_name: form.restaurant_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        cuisine_type: form.cuisine_type,
        opening_hours: form.opening_hours.trim(),
        gst_number: form.gst_number.trim(),
      };

      const res = await fetch('http://127.0.0.1:5000/api/auth/register-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle field-level errors from server
        if (data.fields) {
          setFieldErrors(data.fields);
        } else {
          // Form-level error (e.g. email already exists)
          setFormError(data.error || 'Registration failed. Please try again.');
        }
        return;
      }

      // Success!
      setSuccess(true);
    } catch (err) {
      setFormError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${hasError ? '#ff4757' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '10px',
    color: '#fff',
    padding: '12px 16px',
    width: '100%',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  const labelStyle = {
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'block',
  };

  const errorStyle = {
    color: '#ff4757',
    fontSize: '0.78rem',
    marginTop: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const sectionDivider = (icon, label) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 20px' }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffc107', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,193,7,0.2)' }} />
    </div>
  );

  // ── SUCCESS STATE ──
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          {/* Animated checkmark */}
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'rgba(76,175,80,0.15)',
            border: '2px solid #4caf50',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulse 1.5s infinite'
          }}>
            <span style={{ fontSize: '2.5rem' }}>✅</span>
          </div>
          <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 10, fontSize: '1.6rem' }}>
            You're all set!
          </h2>
          <p style={{ color: '#4caf50', fontSize: '1rem', marginBottom: 8, fontWeight: 600 }}>
            Restaurant registered successfully!
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 28 }}>
            You can now login with your email and password to access your restaurant dashboard.
          </p>
          <div style={{
            background: 'rgba(255,193,7,0.1)',
            border: '1px solid rgba(255,193,7,0.25)',
            borderRadius: '12px',
            padding: '14px 20px',
            color: '#ffc107',
            fontSize: '0.9rem',
            marginBottom: 24,
          }}>
            ⏳ Redirecting to login in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}…
          </div>
          <button
            onClick={() => navigate('/login?role=admin')}
            style={{
              background: '#ffc107', border: 'none', borderRadius: '10px',
              padding: '12px 32px', color: '#000', fontWeight: 700,
              fontSize: '0.95rem', cursor: 'pointer'
            }}
          >
            Login Now →
          </button>
        </div>
      </div>
    );
  }

  // ── FORM STATE ──
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Navbar hideToggle forceDark showOnlyLogin />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🏪</div>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>
            Register Your Restaurant
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            Join FoodieXpress and start receiving digital orders today
          </p>
        </div>

        {/* Form-level API error alert */}
        {formError && (
          <div style={{
            background: 'rgba(255,71,87,0.12)',
            border: '1px solid rgba(255,71,87,0.4)',
            borderRadius: '10px',
            padding: '14px 18px',
            color: '#ff6b81',
            fontSize: '0.9rem',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <span>⚠️</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '28px 28px 8px',
          }}>

            {/* ───────── SECTION 1: YOUR ACCOUNT ───────── */}
            {sectionDivider('👤', 'Your Account')}

            {/* Owner Name */}
            <div style={{ marginBottom: 18 }} id="field-owner_name">
              <label style={labelStyle} htmlFor="owner_name">Owner Full Name</label>
              <input
                id="owner_name"
                name="owner_name"
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={form.owner_name}
                onChange={handleChange}
                style={inputStyle(!!fieldErrors.owner_name)}
                autoComplete="name"
              />
              {fieldErrors.owner_name && <p style={errorStyle}>⚡ {fieldErrors.owner_name}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }} id="field-email">
              <label style={labelStyle} htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                style={inputStyle(!!fieldErrors.email)}
                autoComplete="email"
              />
              {fieldErrors.email && <p style={errorStyle}>⚡ {fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18 }} id="field-password">
              <label style={labelStyle} htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  style={{ ...inputStyle(!!fieldErrors.password), paddingRight: 48 }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                    color: '#6b7280', padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && <p style={errorStyle}>⚡ {fieldErrors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 8 }} id="field-confirm_password">
              <label style={labelStyle} htmlFor="confirm_password">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  style={{ ...inputStyle(!!fieldErrors.confirm_password), paddingRight: 48 }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                    color: '#6b7280', padding: '4px'
                  }}
                  title={showConfirm ? 'Hide' : 'Show'}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.confirm_password && <p style={errorStyle}>⚡ {fieldErrors.confirm_password}</p>}
            </div>

            {/* ───────── SECTION 2: YOUR RESTAURANT ───────── */}
            {sectionDivider('🍽️', 'Your Restaurant')}

            {/* Restaurant Name */}
            <div style={{ marginBottom: 18 }} id="field-restaurant_name">
              <label style={labelStyle} htmlFor="restaurant_name">Restaurant Name</label>
              <input
                id="restaurant_name"
                name="restaurant_name"
                type="text"
                placeholder="e.g. Spice Garden"
                value={form.restaurant_name}
                onChange={handleChange}
                style={inputStyle(!!fieldErrors.restaurant_name)}
              />
              {fieldErrors.restaurant_name && <p style={errorStyle}>⚡ {fieldErrors.restaurant_name}</p>}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 18 }} id="field-phone">
              <label style={labelStyle} htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={handleChange}
                style={inputStyle(!!fieldErrors.phone)}
                maxLength={10}
              />
              {fieldErrors.phone && <p style={errorStyle}>⚡ {fieldErrors.phone}</p>}
            </div>

            {/* Address */}
            <div style={{ marginBottom: 18 }} id="field-address">
              <label style={labelStyle} htmlFor="address">Restaurant Address</label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="Full address including area and city"
                value={form.address}
                onChange={handleChange}
                style={inputStyle(!!fieldErrors.address)}
              />
              {fieldErrors.address && <p style={errorStyle}>⚡ {fieldErrors.address}</p>}
            </div>

            {/* Cuisine Type */}
            <div style={{ marginBottom: 18 }} id="field-cuisine_type">
              <label style={labelStyle} htmlFor="cuisine_type">Cuisine Type</label>
              <select
                id="cuisine_type"
                name="cuisine_type"
                value={form.cuisine_type}
                onChange={handleChange}
                style={{
                  ...inputStyle(!!fieldErrors.cuisine_type),
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none'/></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: '40px',
                  cursor: 'pointer',
                }}
              >
                <option value="" style={{ background: '#1a1d26' }}>Select cuisine type…</option>
                {CUISINE_OPTIONS.map(c => (
                  <option key={c} value={c} style={{ background: '#1a1d26' }}>{c}</option>
                ))}
              </select>
              {fieldErrors.cuisine_type && <p style={errorStyle}>⚡ {fieldErrors.cuisine_type}</p>}
            </div>

            {/* Opening Hours */}
            <div style={{ marginBottom: 18 }} id="field-opening_hours">
              <label style={labelStyle} htmlFor="opening_hours">Opening Hours</label>
              <input
                id="opening_hours"
                name="opening_hours"
                type="text"
                placeholder='e.g. "9 AM – 11 PM" or "Open 24/7"'
                value={form.opening_hours}
                onChange={handleChange}
                style={inputStyle(!!fieldErrors.opening_hours)}
              />
              {fieldErrors.opening_hours && <p style={errorStyle}>⚡ {fieldErrors.opening_hours}</p>}
            </div>

            {/* GST Number (optional) */}
            <div style={{ marginBottom: 28 }} id="field-gst_number">
              <label style={labelStyle} htmlFor="gst_number">
                GST Number{' '}
                <span style={{ color: '#4b5563', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.78rem' }}>
                  (optional)
                </span>
              </label>
              <input
                id="gst_number"
                name="gst_number"
                type="text"
                placeholder="e.g. 33AAAAA0000A1Z5"
                value={form.gst_number}
                onChange={handleChange}
                style={inputStyle(false)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? 'rgba(255,193,7,0.5)' : '#ffc107',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.5px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'background 0.2s, transform 0.1s',
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 18, height: 18,
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderTop: '2px solid #000',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Registering…
                </>
              ) : (
                '🚀 Register Restaurant'
              )}
            </button>

            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', paddingBottom: 8 }}>
              Already registered?{' '}
              <span
                onClick={() => navigate('/login?role=admin')}
                style={{ color: '#ffc107', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Login as Admin
              </span>
            </p>

          </div>
        </form>
      </div>

      {/* Inline keyframes for spinner and pulse */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(76,175,80,0); }
        }
        input::placeholder { color: #4b5563 !important; }
        select option { background: #1a1d26 !important; }
      `}</style>
    </div>
  );
};

export default RegisterRestaurant;
