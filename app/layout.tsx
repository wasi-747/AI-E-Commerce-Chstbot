import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "TechDojo Store — Premium Essentials",
  description: "Thoughtfully crafted premium clothing — T-shirts & Pants for everyday excellence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="font-sans antialiased bg-white text-slate-900">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <Toast />
          {children}
          <ChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}
