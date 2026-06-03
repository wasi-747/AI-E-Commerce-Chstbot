"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Navbar() {
  const { itemCount, openDrawer } = useCart();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <span className="text-white text-sm font-bold tracking-widest">T</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-[0.2em] text-slate-900 uppercase group-hover:text-slate-600 transition-colors duration-200">
                TechDojo
              </span>
              <span className="text-[9px] tracking-[0.35em] text-slate-400 uppercase mt-0.5">
                Store
              </span>
            </div>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-8">
            {["New Arrivals", "T-Shirts", "Pants", "Sale"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs tracking-widest uppercase text-slate-500 hover:text-slate-900 transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Bag button — opens drawer, does NOT navigate */}
          <button
            onClick={openDrawer}
            className="flex items-center gap-2 relative group"
            aria-label="Open shopping bag"
          >
            <ShoppingBag
              size={20}
              className="text-slate-700 group-hover:text-black transition-colors duration-200"
              strokeWidth={1.5}
            />
            <span className="text-xs tracking-widest uppercase text-slate-500 group-hover:text-slate-900 transition-colors duration-200 hidden sm:inline">
              Bag
            </span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold leading-none">
                {itemCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </nav>
  );
}
