import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
  const Login = () => {
  const [role, setRole] = useState('customer');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); // 1: mobile, 2: otp, 3: name
  
  const [waiterCode, setWaiterCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // 1. Ask Flask to send the real OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobile })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep(2); // Move to OTP input screen
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify the OTP with Flask
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobile, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      if (data.new_user) {
        setStep(3); // New customer! Ask for their name.
      } else {
        login(data.user, data.token); // Existing customer, log them in!
        navigate('/restaurants');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Register a brand new customer
  const handleRegisterName = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/register-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobile, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      login(data.user, data.token);
      navigate('/restaurants');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Waiter Login
  const handleWaiterLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/waiter-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waiter_code: waiterCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid waiter code');
      
     login(data.user, data.token);

// Store restaurant id for waiter
localStorage.setItem(
  "selectedRestaurantId",
  data.user.restaurant_id
);

navigate('/waiter');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      
     login(data.user, data.token);
navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 fade-up">
      <div className="glass-card p-5" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center mb-4">
          <i className="bi bi-cup-hot text-warning" style={{ fontSize: '2.5rem' }}></i>
          <h2 className="text-light fw-bold mt-2">FoodieXpress</h2>
          <p className="text-secondary">Sign in to continue</p>
        </div>

        {/* Role Selector */}
        <div className="d-flex justify-content-center gap-2 mb-4">
          <button className={`btn flex-grow-1 ${role === 'customer' ? 'btn-outline-custom active border-warning text-warning' : 'btn-outline-secondary text-light'}`} onClick={() => { setRole('customer'); setStep(1); setError(''); }}>
            <i className="bi bi-person me-1"></i> Customer
          </button>
          <button className={`btn flex-grow-1 ${role === 'waiter' ? 'btn-outline-custom active border-warning text-warning' : 'btn-outline-secondary text-light'}`} onClick={() => { setRole('waiter'); setError(''); }}>
            <i className="bi bi-person-badge me-1"></i> Waiter
          </button>
          <button className={`btn flex-grow-1 ${role === 'admin' ? 'btn-outline-custom active border-warning text-warning' : 'btn-outline-secondary text-light'}`} onClick={() => { setRole('admin'); setError(''); }}>
            <i className="bi bi-gear me-1"></i> Admin
          </button>
        </div>

        {error && <div className="alert alert-danger py-2 border-0 bg-danger bg-opacity-25 text-danger">{error}</div>}

        {/* CUSTOMER LOGIN FLOW */}
        {role === 'customer' && (
          <div>
            {step === 1 && (
              <form onSubmit={handleSendOTP}>
                <div className="mb-4">
                  <label className="form-label text-secondary small text-uppercase fw-bold">Mobile Number</label>
                  <input type="text" className="search-input w-100 p-3 rounded glass-card border-0 text-light" placeholder="Enter 10-digit number" value={mobile} onChange={e => setMobile(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary-custom w-100 justify-content-center" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'} <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-4">
                  <label className="form-label text-secondary small text-uppercase fw-bold">Enter OTP</label>
                  <input type="text" className="search-input w-100 p-3 rounded glass-card border-0 text-light" placeholder="Enter 4-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary-custom w-100 justify-content-center" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <button type="button" className="btn btn-link text-secondary w-100 mt-2 text-decoration-none" onClick={() => setStep(1)}>
                  Wrong number? Go back
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleRegisterName}>
                <div className="mb-4">
                  <label className="form-label text-secondary small text-uppercase fw-bold">What's your name?</label>
                  <input type="text" className="search-input w-100 p-3 rounded glass-card border-0 text-light" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary-custom w-100 justify-content-center" disabled={loading}>
                  {loading ? 'Creating account...' : 'Complete Profile'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* WAITER LOGIN */}
        {role === 'waiter' && (
          <form onSubmit={handleWaiterLogin}>
            <div className="mb-4">
              <label className="form-label text-secondary small text-uppercase fw-bold">Waiter Code</label>
              <input type="text" className="search-input w-100 p-3 rounded glass-card border-0 text-light" placeholder="e.g. WAITER-001" value={waiterCode} onChange={e => setWaiterCode(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary-custom w-100 justify-content-center" disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Waiter'}
            </button>
          </form>
        )}

        {/* ADMIN LOGIN */}
        {role === 'admin' && (
          <form onSubmit={handleAdminLogin}>
            <div className="mb-3">
              <label className="form-label text-secondary small text-uppercase fw-bold">Admin Email</label>
              <input type="email" className="search-input w-100 p-3 rounded glass-card border-0 text-light" placeholder="admin@foodiexpress.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="form-label text-secondary small text-uppercase fw-bold">Password</label>
              <input
  type="password"
  className="search-input w-100 p-3 rounded glass-card border-0 text-light"
  placeholder="••••••••"
  value={password}
  onChange={e => setPassword(e.target.value)}
  autoComplete="current-password"
  required
/>
            </div>
            <button type="submit" className="btn-primary-custom w-100 justify-content-center" disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;