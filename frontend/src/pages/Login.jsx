import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Login = () => {
  const [role, setRole] = useState('customer');
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [waiterCode, setWaiterCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (mobile.length !== 10) {
      setError('Please enter a valid 10 digit mobile number');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCustomerLogin = () => {
    if (otp !== '1234') { setError('Invalid OTP. Try 1234'); return; }
    login({ username: mobile, role: 'customer' }, 'mock-token');
    navigate('/restaurants');
  };

  const handleWaiterLogin = () => {
    if (waiterCode !== 'WAITER-001') { setError('Invalid waiter code. Try WAITER-001'); return; }
    login({ username: waiterCode, role: 'waiter' }, 'mock-token');
    navigate('/waiter');
  };

  const handleAdminLogin = () => {
    if (email !== 'admin@foodiexpress.com' || password !== 'admin123') {
      setError('Invalid credentials');
      return;
    }
    login({ username: email, role: 'admin' }, 'mock-token');
    navigate('/admin');
  };

  return (
    <div className="page-body min-vh-100 d-flex flex-column">
      <Navbar />

      <div className="d-flex align-items-center justify-content-center p-4 flex-grow-1">
        <div 
          className="glass-card fade-up"
          style={{ width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '20px' }}
        >

          <div className="text-center mb-4">
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍽</div>
            <h2 className="top-bar-title fw-bold fs-4 mb-1">
              Goodfood Easyfood
            </h2>
            <p className="text-secondary small">
              Sign in to continue
            </p>
          </div>

          <div className="role-pills mb-4">
            {[
              { val: 'customer', label: '👤 Customer' },
              { val: 'waiter', label: '🍴 Waiter' },
              { val: 'admin', label: '⚙️ Admin' },
            ].map(r => (
              <button
                key={r.val}
                className={`role-pill ${role === r.val ? 'active' : ''}`}
                onClick={() => { setRole(r.val); setStep(1); setError(''); }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="alert alert-danger p-2 small text-center border-0 bg-danger bg-opacity-10 text-danger mb-3">
              {error}
            </div>
          )}

          {role === 'customer' && (
            <div>
              {step === 1 ? (
                <div>
                  <div className="form-group mb-3">
                    <label className="form-label text-secondary small mb-1">Mobile Number</label>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Enter 10 digit mobile number"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                    />
                  </div>
                  <button className="btn-primary-custom w-100 justify-content-center py-2" onClick={handleSendOtp}>
                    Send OTP →
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-secondary small mb-3">
                    OTP sent to +91 {mobile}
                  </p>
                  <div className="form-group mb-3">
                    <label className="form-label text-secondary small mb-1">Enter OTP</label>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Enter OTP (use 1234)"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                    />
                  </div>
                  <button className="btn-primary-custom w-100 justify-content-center py-2" onClick={handleCustomerLogin}>
                    Verify OTP →
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="btn btn-link text-secondary text-decoration-none small mt-2 w-100"
                  >
                    ← Change number
                  </button>
                </div>
              )}
            </div>
          )}

          {role === 'waiter' && (
            <div>
              <div className="form-group mb-3">
                <label className="form-label text-secondary small mb-1">Waiter Code</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Enter waiter code (WAITER-001)"
                  value={waiterCode}
                  onChange={e => setWaiterCode(e.target.value)}
                />
              </div>
              <button className="btn-primary-custom w-100 justify-content-center py-2" onClick={handleWaiterLogin}>
                Login as Waiter →
              </button>
            </div>
          )}

          {role === 'admin' && (
            <div>
              <div className="form-group mb-3">
                <label className="form-label text-secondary small mb-1">Email</label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="admin@foodiexpress.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label text-secondary small mb-1">Password</label>
                <input
                  className="form-control"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button className="btn-primary-custom w-100 justify-content-center py-2" onClick={handleAdminLogin}>
                Login as Admin →
              </button>
            </div>
          )}

          <div 
            className="rounded p-3 mt-4"
            style={{ background: 'var(--input-bg, rgba(0,0,0,0.05))' }}
          >
            <p className="small text-secondary fw-bold mb-2" style={{ fontSize: '0.7rem' }}>
              DEMO CREDENTIALS
            </p>
            <p className="small mb-1 fw-bold" style={{ color: 'var(--brand-color, #ffc107)' }}>
              Customer: any 10 digits + OTP 1234
            </p>
            <p className="small mb-1 fw-bold" style={{ color: 'var(--brand-color, #ffc107)' }}>
              Waiter: WAITER-001
            </p>
            <p className="small mb-0 fw-bold" style={{ color: 'var(--brand-color, #ffc107)' }}>
              Admin: admin@foodiexpress.com / admin123
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;