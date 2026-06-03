import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/Skeletons/ProductGridSkeleton";

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

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch("http://localhost:3000/api/products", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Inner async component to fetch products and render the grid
async function ProductGridSection() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 border border-slate-200 bg-white">
        <div className="w-12 h-12 border border-slate-200 flex items-center justify-center mb-6">
          <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
          No Products
        </p>
        <p className="text-[10px] tracking-wider text-slate-300 uppercase">
          Seed the database to begin
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-slate-200">
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} priority={index < 12} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero / Collection Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-4">
            Summer 2026
          </p>
          <h1 className="text-3xl sm:text-5xl font-light text-slate-900 tracking-tight leading-tight max-w-2xl">
            The Essential Collection
          </h1>
          <p className="mt-4 text-sm text-slate-500 max-w-xl leading-relaxed tracking-wide">
            Thoughtfully crafted basics. Premium fabrics, refined fits — built to
            last a season and well beyond.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px w-8 bg-slate-400" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400">
              Premium Essentials
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGridSection />
        </Suspense>
      </div>

      {/* Footer Strip */}
      <div className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            © 2026 TechDojo Store
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            Premium Essentials · Bangladesh
          </p>
        </div>
      </div>
    </div>
  );
}
