"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dummy user ID - replace with actual user ID from auth in production
  const userId = "dummy-user-123";

  // Fetch cart from API
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/cart?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }
      const data = await response.json();
      setCart(data.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, size, quantity) => {
    try {
      setError(null);
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, size, quantity }),
      });
      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status}`);
      }
      await fetchCart();
    } catch (err) {
      console.error("Error adding to cart:", err.message);
      setError(err.message);
      throw err;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      setError(null);
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error(`Failed to remove from cart: ${response.status}`);
      }
      await fetchCart();
    } catch (err) {
      console.error("Error removing from cart:", err.message);
      setError(err.message);
      throw err;
    }
  };

  // Fetch cart on initial mount
  useEffect(() => {
    fetchCart();
  }, []);

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    removeFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
