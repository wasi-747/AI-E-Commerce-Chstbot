import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import ChatWidget from "@/components/ChatWidget";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "TechDojo Store — Premium Essentials",
  description: "AI-powered shopping for premium t-shirts & pants. Browse, add to cart, and checkout via natural language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="font-sans antialiased bg-white text-slate-900">
        <SessionProviderWrapper>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <Toast />
            {children}
            <ChatWidget />
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
