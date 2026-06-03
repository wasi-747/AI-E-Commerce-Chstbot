"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

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

interface ProductDetailsActionsProps {
  product: Product;
}

export default function ProductDetailsActions({ product }: ProductDetailsActionsProps) {
  const { addToCart, loading, error } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const sizes = ["S", "M", "L", "XL", "XXL"] as const;
  const currentStock = product.inventory[selectedSize as keyof typeof product.inventory];

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart(product._id, selectedSize, quantity);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
            Select Size
          </p>
          {currentStock === 0 ? (
            <span className="text-[10px] text-red-500 uppercase tracking-wider font-medium">
              Sold Out in {selectedSize}
            </span>
          ) : currentStock <= 3 ? (
            <span className="text-[10px] text-amber-600 uppercase tracking-wider font-medium">
              Low Stock: {currentStock} left
            </span>
          ) : (
            <span className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">
              In Stock
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {sizes.map((size) => {
            const isOutOfStock = product.inventory[size] === 0;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                disabled={isOutOfStock}
                className={`w-12 h-12 text-xs border tracking-wider transition-all duration-150 rounded-none ${
                  selectedSize === size
                    ? "bg-black text-white border-black"
                    : isOutOfStock
                      ? "bg-white text-slate-350 border-slate-200 cursor-not-allowed line-through"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:text-slate-900"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium mb-3">
          Quantity
        </p>
        <div className="flex items-center border border-slate-300 w-32">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || currentStock === 0}
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30"
          >
            —
          </button>
          <input
            type="number"
            min="1"
            max={currentStock || 1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 h-10 text-center text-xs font-semibold text-slate-900 border-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            disabled={currentStock === 0}
          />
          <button
            type="button"
            onClick={() => setQuantity(Math.min(currentStock || 1, quantity + 1))}
            disabled={quantity >= (currentStock || 1) || currentStock === 0}
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="pt-2">
        <button
          onClick={handleAddToCart}
          disabled={isAdding || loading || currentStock === 0}
          className={`w-full py-4 text-xs tracking-[0.25em] uppercase font-semibold transition-all duration-300 rounded-none disabled:cursor-not-allowed ${
            addedFeedback
              ? "bg-slate-750 text-white"
              : currentStock === 0
                ? "bg-slate-100 text-slate-400 border border-slate-250 cursor-not-allowed"
                : "bg-black text-white hover:bg-slate-800 active:bg-slate-700"
          }`}
        >
          {isAdding
            ? "Adding to Bag..."
            : addedFeedback
              ? "✓ Added to Bag"
              : currentStock === 0
                ? "Sold Out"
                : "Add to Bag"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-[10px] tracking-wide text-center">
          {error}
        </p>
      )}
    </div>
  );
}
