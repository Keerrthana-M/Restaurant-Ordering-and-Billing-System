import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Check if user was already logged in (stored in localStorage)
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = (userData, token) => {
        const userInfo = { ...userData, token };
        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook — any component can call useAuth() to get user/login/logout
export function useAuth() {
    return useContext(AuthContext);
}