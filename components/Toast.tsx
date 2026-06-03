"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export default function Toast() {
  const { toastMessage } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      setVisible(true);
    } else {
      // Delay hiding to allow fade-out transition
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  if (!visible && !toastMessage) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${
        toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="bg-slate-900 text-white text-[11px] uppercase tracking-[0.2em] px-6 py-3.5 shadow-lg flex items-center gap-3">
        <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
        {toastMessage}
      </div>
    </div>
  );
}
