"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const { cart } = useCart();
  const itemCount = cart.length;

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Store Name */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">
              T
            </div>
            <span className="text-xl font-bold hidden sm:inline">
              TechDojo Store
            </span>
          </Link>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <ShoppingCart size={24} />
            <span className="font-semibold">
              {itemCount > 0 && (
                <span className="ml-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {itemCount}
                </span>
              )}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
