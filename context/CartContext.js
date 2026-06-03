"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status}`);
      const data = await response.json();
      setCart(data.data?.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to cart
  const addToCart = async (productId, size, quantity) => {
    try {
      setError(null);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size, quantity }),
      });
      if (!response.ok) throw new Error(`Failed to add to cart: ${response.status}`);
      await fetchCart();
      showToast("Item added to bag");
      setIsDrawerOpen(true);
    } catch (err) {
      console.error("Error adding to cart:", err.message);
      setError(err.message);
      throw err;
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setError(null);
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!response.ok) throw new Error(`Failed to update quantity: ${response.status}`);
      await fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err.message);
      setError(err.message);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      setError(null);
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Failed to remove from cart: ${response.status}`);
      await fetchCart();
    } catch (err) {
      console.error("Error removing from cart:", err.message);
      setError(err.message);
      throw err;
    }
  };

  // Toast helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Drawer helpers
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Computed values
  const itemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const subtotal = cart.reduce((total, item) => {
    const price = item.productId?.price || 0;
    return total + price * (item.quantity || 1);
  }, 0);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cart,
    loading,
    error,
    isDrawerOpen,
    toastMessage,
    itemCount,
    subtotal,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    openDrawer,
    closeDrawer,
    showToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
