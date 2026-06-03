"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useState } from "react";

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

  const sizes = ["S", "M", "L", "XL", "XXL"] as const;

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart(product._id, selectedSize, quantity);
      setQuantity(1);
      setSelectedSize("M");
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const categoryStyles = {
    pants: "bg-indigo-100 text-indigo-800",
    "t-shirts": "bg-purple-100 text-purple-800",
  };

  const badgeStyle =
    categoryStyles[product.category as keyof typeof categoryStyles] ||
    "bg-gray-100 text-gray-800";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {/* Product Image */}
      <div className="relative w-full h-64 bg-gray-200">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
            No Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Name and Category */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <div className="mb-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badgeStyle}`}
          >
            {product.category}
          </span>
        </div>

        {/* Price */}
        <p className="text-2xl font-bold text-blue-600 mb-4">
          ৳{product.price.toFixed(2)}
        </p>

        {/* Size Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size
          </label>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                disabled={product.inventory[size] === 0}
                className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? "bg-blue-600 text-white border-blue-600"
                    : product.inventory[size] === 0
                      ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white text-gray-900 border-gray-300 hover:border-blue-600"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            max={
              product.inventory[selectedSize as keyof typeof product.inventory]
            }
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>

        {/* Stock Info */}
        <p className="text-xs text-gray-500 mb-4">
          {product.inventory[selectedSize as keyof typeof product.inventory]} in
          stock
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={
            isAdding ||
            loading ||
            product.inventory[
              selectedSize as keyof typeof product.inventory
            ] === 0
          }
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
}
