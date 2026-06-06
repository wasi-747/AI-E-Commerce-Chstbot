"use client";

import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ShoppingBag, User, ChevronDown, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import AuthModal from "@/components/AuthModal";
import OrdersModal from "@/components/OrdersModal";

export default function Navbar() {
  const { itemCount, openDrawer } = useCart();
  const { data: session, status } = useSession();
  const [authOpen, setAuthOpen]     = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] || "Account";

  return (
    <>
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

            {/* Right Actions */}
            <div className="flex items-center gap-4">

              {/* Auth — Logged In: user dropdown | Logged Out: sign in button */}
              {status === "loading" ? (
                <div className="w-16 h-4 bg-slate-100 animate-pulse rounded" aria-hidden />
              ) : session ? (
                <div ref={dropRef} className="relative">
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-1.5 group"
                    aria-expanded={dropOpen}
                    aria-label="Account menu"
                  >
                    <div className="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center">
                      <User size={13} className="text-white" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs tracking-widest uppercase text-slate-600 group-hover:text-slate-900 transition-colors hidden sm:inline max-w-[80px] truncate">
                      {firstName}
                    </span>
                    <ChevronDown
                      size={11}
                      className={`text-slate-400 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {dropOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 shadow-lg z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-[9px] uppercase tracking-widest text-slate-400">Signed in as</p>
                        <p className="text-xs text-slate-900 font-medium truncate mt-0.5">
                          {session.user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => { setOrdersOpen(true); setDropOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
                      >
                        <ShoppingBag size={12} strokeWidth={1.5} />
                        My Orders
                      </button>
                      <button
                        onClick={() => { signOut({ callbackUrl: "/" }); setDropOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <LogOut size={12} strokeWidth={1.5} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="text-xs tracking-widest uppercase text-slate-500 hover:text-slate-900 transition-colors duration-200 flex items-center gap-1.5"
                  aria-label="Sign in to your account"
                >
                  <User size={16} strokeWidth={1.5} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Bag */}
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
        </div>
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <OrdersModal isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />
    </>
  );
}
