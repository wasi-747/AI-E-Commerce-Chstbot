"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useState } from "react";
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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, loading, error } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizes = ["S", "M", "L", "XL", "XXL"] as const;

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart(product._id, selectedSize, quantity);
      setQuantity(1);
      setSelectedSize("M");
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const currentStock =
    product.inventory[selectedSize as keyof typeof product.inventory];

  return (
    <div className="group flex flex-col bg-white border border-slate-200 hover:border-slate-400 transition-colors duration-300">
      {/* Product Image */}
      <Link
        href={`/product/${product._id}`}
        className="relative w-full aspect-[3/4] bg-slate-105 overflow-hidden block"
      >
        {product.imageUrl && !imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
            <svg
              className="w-8 h-8 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 21h10.5A2.25 2.25 0 0019.5 18.75V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v12A2.25 2.25 0 006.75 21z"
              />
            </svg>
            <p className="text-xs tracking-widest uppercase text-slate-400">
              Image unavailable
            </p>
          </div>
        )}

        {/* Out of stock overlay */}
        {currentStock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-[10px] tracking-widest uppercase text-slate-500 border border-slate-300 px-3 py-1.5 bg-white">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category */}
        <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">
          {product.category}
        </p>

        {/* Name */}
        <Link href={`/product/${product._id}`} className="hover:text-slate-650 transition-colors">
          <h3 className="text-sm font-medium text-slate-900 leading-snug mb-3 hover:underline">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-sm text-slate-900 font-semibold mb-5 tracking-wide">
          ৳{product.price.toLocaleString("en-BD")}
        </p>

        {/* Size Selector */}
        <div className="mb-4">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-2">
            Size
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {sizes.map((size) => {
              const isOutOfStock = product.inventory[size] === 0;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  disabled={isOutOfStock}
                  className={`w-9 h-9 text-xs border transition-colors duration-150 ${
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : isOutOfStock
                        ? "bg-white text-slate-300 border-slate-200 cursor-not-allowed line-through"
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
        <div className="mb-5">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-2">
            Qty
          </p>
          <input
            type="number"
            min="1"
            max={currentStock || 1}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-20 px-3 py-2 bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition-colors"
          />
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || loading || currentStock === 0}
          className={`w-full py-3 text-xs tracking-widest uppercase font-medium transition-colors duration-200 mt-auto disabled:cursor-not-allowed ${
            addedFeedback
              ? "bg-slate-700 text-white"
              : currentStock === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-slate-800 active:bg-slate-700"
          }`}
        >
          {isAdding
            ? "Adding..."
            : addedFeedback
              ? "✓ Added"
              : currentStock === 0
                ? "Sold Out"
                : "Add to Bag"}
        </button>

        {error && (
          <p className="text-red-500 text-[10px] mt-2 tracking-wide text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
