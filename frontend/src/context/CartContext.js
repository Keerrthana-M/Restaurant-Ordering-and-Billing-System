import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // -----------------------------
  // ADD TO CART
  // -----------------------------
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);

      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? {
                ...i,
                quantity: i.quantity + 1
              }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          menu_item_id: item.id, // Backend expects this
          quantity: 1
        }
      ];
    });
  };

  // -----------------------------
  // REMOVE ITEM
  // -----------------------------
  const removeFromCart = (id) => {
    setCartItems(prev =>
      prev.filter(item => item.id !== id)
    );
  };

  // -----------------------------
  // UPDATE QUANTITY
  // -----------------------------
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              quantity
            }
          : item
      )
    );
  };

  // -----------------------------
  // CLEAR CART
  // -----------------------------
  const clearCart = () => {
    setCartItems([]);
  };

  // -----------------------------
  // TOTAL PRICE
  // -----------------------------
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // -----------------------------
  // TOTAL ITEMS
  // -----------------------------
  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);