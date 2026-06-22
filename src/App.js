import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Page Imports
import Login from './pages/Login';
import RestaurantList from './pages/RestaurantList';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import WaiterDashboard from './pages/WaiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QRScanner from './pages/QRScanner';
import LandingPage from './pages/LandingPage';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage  />} />
            <Route path="/login" element={<Login />} />
            <Route path="/restaurants" element={
              <ProtectedRoute><RestaurantList /></ProtectedRoute>
            } />
            <Route path="/menu" element={
              <ProtectedRoute><Menu /></ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute><Cart /></ProtectedRoute>
            } />
            <Route path="/waiter" element={
              <ProtectedRoute><WaiterDashboard /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/scan" element={
              <ProtectedRoute><QRScanner /></ProtectedRoute>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;