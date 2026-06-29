import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );
  
  // NEW: A temporary override state for specific pages (like the Landing Page)
  const [themeOverride, setThemeOverride] = useState(null);

  useEffect(() => {
    // If an override exists, use it. Otherwise, use the saved theme.
    const activeTheme = themeOverride || theme;
    
    localStorage.setItem('theme', theme); // Always save the real preference
    
    // Apply the active theme to both standard and Bootstrap variables
    document.body.setAttribute('data-theme', activeTheme);
    document.body.setAttribute('data-bs-theme', activeTheme);
  }, [theme, themeOverride]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    // Pass setThemeOverride down so the Landing Page can use it
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeOverride }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);