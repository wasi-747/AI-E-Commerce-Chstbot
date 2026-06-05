"use client";

import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import ChatWidget from "@/components/ChatWidget";

interface StoreLayoutWrapperProps {
  children: React.ReactNode;
}

export default function StoreLayoutWrapper({ children }: StoreLayoutWrapperProps) {
  return (
    <CartProvider>
      {/* AI Stylist Sidebar — fixed left panel */}
      <ChatWidget />

      {/* Main content — offset by sidebar width (w-80 = 320px) */}
      <div className="ml-80">
        <Navbar />
        <CartDrawer />
        <Toast />
        {children}
      </div>
    </CartProvider>
  );
}
