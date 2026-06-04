"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { X, Trash2, Minus, Plus, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  inventory: {
    S: number;
    M: number;
    L: number;
    XL: number;
    XXL: number;
  };
}

interface CartItem {
  _id: string;
  productId: Product;
  size: string;
  quantity: number;
}


export default function CartDrawer() {
  const {
    cart,
    loading,
    isDrawerOpen,
    closeDrawer,
    removeFromCart,
    updateQuantity,
    fetchCart,
    itemCount,
    subtotal,
  } = useCart();

  const [checkingOut, setCheckingOut]     = useState(false);
  const [orderSuccess, setOrderSuccess]   = useState<string | null>(null);
  const [orderError, setOrderError]       = useState<string | null>(null);

  const handleCheckout = async () => {
    setCheckingOut(true);
    setOrderError(null);
    try {
      const res  = await fetch("/api/orders", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setOrderError(data.error || "Checkout failed."); return; }
      setOrderSuccess(data.data?.orderNumber || "Confirmed");
      await fetchCart();
    } catch {
      setOrderError("Something went wrong. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    },
    [closeDrawer]
  );

  useEffect(() => {
    if (isDrawerOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, handleKeyDown]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping bag"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-0.5">
              Your
            </p>
            <h2 className="text-sm font-semibold tracking-widest uppercase text-slate-900">
              Bag
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {itemCount > 0 && (
              <span className="text-[10px] uppercase tracking-widest text-slate-400">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
            <button
              onClick={closeDrawer}
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 transition-colors"
              aria-label="Close bag"
            >
              <X size={16} strokeWidth={1.5} className="text-slate-700" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <CartDrawerSkeleton />
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
              <div className="w-16 h-16 border border-slate-200 flex items-center justify-center">
                <ShoppingBag size={22} strokeWidth={1} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                  Your bag is empty
                </p>
                <p className="text-[10px] text-slate-400 tracking-wider">
                  Add something beautiful to get started.
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="mt-2 text-[10px] uppercase tracking-widest border border-slate-900 text-slate-900 px-6 py-2.5 hover:bg-slate-900 hover:text-white transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {cart.map((item: CartItem) => {
                const product = item.productId;
                const price = product?.price || 0;
                return (
                  <li key={item._id} className="flex gap-4 px-6 py-5">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-24 bg-slate-100 flex-shrink-0">
                      {product?.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name || "Product"}
                          fill
                          className="object-cover"
                          sizes="80px"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <ShoppingBag size={16} strokeWidth={1} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 leading-tight truncate">
                            {product?.name || "Unknown Product"}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
                            Size: {item.size}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 whitespace-nowrap">
                          ৳{(price * item.quantity).toLocaleString("en-BD")}
                        </p>
                      </div>

                      {/* Quantity + Remove */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-slate-200">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={10} strokeWidth={2} />
                          </button>
                          <span className="w-8 text-center text-xs font-medium text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={10} strokeWidth={2} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={11} strokeWidth={1.5} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — Summary + Actions */}
        {cart.length > 0 && !loading && (
          <div className="border-t border-slate-200 px-6 py-6 space-y-4">
            {/* Subtotal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  Subtotal
                </span>
                <span className="text-xs font-medium text-slate-700">
                  ৳{subtotal.toLocaleString("en-BD")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-slate-400">
                  Shipping
                </span>
                <span className="text-[10px] text-slate-400 tracking-wide">
                  Calculated at checkout
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest font-semibold text-slate-900">
                  Total
                </span>
                <span className="text-sm font-bold text-slate-900">
                  ৳{subtotal.toLocaleString("en-BD")}
                </span>
              </div>
            </div>

            {/* Order Success */}
            {orderSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2.5">
                <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Order Placed!</p>
                  <p className="text-[10px] text-emerald-600 font-mono">{orderSuccess}</p>
                </div>
              </div>
            )}
            {orderError && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-3 py-2">{orderError}</p>
            )}

            {/* Buttons */}
            {!orderSuccess ? (
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full bg-black text-white text-[11px] uppercase tracking-[0.25em] py-4 hover:bg-slate-800 active:bg-slate-700 transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {checkingOut && <Loader2 size={13} className="animate-spin" />}
                {checkingOut ? "Placing Order…" : "Checkout"}
              </button>
            ) : (
              <button
                onClick={() => { setOrderSuccess(null); closeDrawer(); }}
                className="w-full bg-emerald-600 text-white text-[11px] uppercase tracking-[0.25em] py-4 hover:bg-emerald-700 transition-colors"
              >
                ✓ Done
              </button>
            )}
            <button
              onClick={closeDrawer}
              className="w-full border border-slate-300 text-slate-700 text-[11px] uppercase tracking-[0.25em] py-3.5 hover:border-slate-900 hover:text-slate-900 transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// Inline skeleton for drawer loading state
function CartDrawerSkeleton() {
  return (
    <div className="px-6 py-4 space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-20 h-24 bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 bg-slate-200 rounded w-3/4" />
            <div className="h-2 bg-slate-200 rounded w-1/4" />
            <div className="h-2 bg-slate-200 rounded w-1/2 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
