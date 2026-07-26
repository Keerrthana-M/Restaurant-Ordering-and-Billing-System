import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
  JSON.parse(localStorage.getItem("user")) || null
);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const login = (userData, jwtToken) => {
  setUser(userData);
  setToken(jwtToken);

  localStorage.setItem("token", jwtToken);

  // ⭐ Save user information
  localStorage.setItem(
    "user",
    JSON.stringify(userData)
  );
};
  const logout = () => {
  setUser(null);
  setToken(null);

  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);