import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import ProductDetailsActions from "@/components/ProductDetailsActions";
import ProductCard from "@/components/ProductCard";

import { dbConnect } from "@/lib/mongodb";
import ProductModel from "@/models/Product";

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

async function getProduct(id: string): Promise<Product | null> {
  try {
    await dbConnect();
    const product = await ProductModel.findById(id).lean();
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}

async function getRelatedProducts(category: string, currentId: string): Promise<Product[]> {
  try {
    await dbConnect();
    const related = await ProductModel.find({
      category,
      _id: { $ne: currentId }
    })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(related)) || [];
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-40 px-6">
        <div className="w-12 h-12 border border-slate-200 flex items-center justify-center mb-6 bg-white">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-medium">
          Product Not Found
        </p>
        <p className="text-[10px] text-slate-400 tracking-wider mb-8 text-center uppercase">
          The piece you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/"
          className="text-[10px] uppercase tracking-widest border border-slate-900 text-slate-900 px-8 py-3 hover:bg-slate-900 hover:text-white transition-colors duration-200"
        >
          Return to Collection
        </Link>
      </div>
    );
  }

  const relatedProducts = await getRelatedProducts(product.category, product._id);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-[9px] uppercase tracking-[0.2em]">
            <li>
              <Link href="/" className="text-slate-400 hover:text-slate-900 transition-colors">
                Collection
              </Link>
            </li>
            <li className="text-slate-300">/</li>
            <li>
              <span className="text-slate-400">{product.category}</span>
            </li>
            <li className="text-slate-300">/</li>
            <li>
              <span className="text-slate-900 font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 bg-white border border-slate-200 p-6 sm:p-8">
          {/* Left Column - Image */}
          <div className="lg:col-span-7">
            <ProductImage imageUrl={product.imageUrl} name={product.name} />
          </div>

          {/* Right Column - Info & Action */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-2">
                {product.category}
              </p>
              <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight leading-tight mb-4">
                {product.name}
              </h1>
              <p className="text-lg font-semibold text-slate-900 tracking-wide mb-6">
                ৳{product.price.toLocaleString("en-BD")}
              </p>
            </div>

            <hr className="border-slate-200 my-6" />

            {/* Interactive Add to Bag controls */}
            <ProductDetailsActions product={product} />

            {/* Premium Details Sections */}
            <div className="mt-10 pt-8 border-t border-slate-200 space-y-6">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-slate-900 font-semibold mb-2">
                  Description
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed tracking-wide">
                  A modern wardrobe essential designed for daily refinement. Constructed from high-density organic cotton for the perfect balance of breathability and structure. Finished with flatlock stitching and reinforced seams for enduring quality.
                </p>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-slate-900 font-semibold mb-2">
                  Details & Care
                </h3>
                <ul className="text-xs text-slate-500 leading-relaxed tracking-wide list-disc list-inside space-y-1">
                  <li>100% Organic combed cotton</li>
                  <li>Weight: 220 GSM heavyweight knit</li>
                  <li>Machine wash cold, lay flat to dry</li>
                  <li>Crafted responsibly in Bangladesh</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-slate-900">
                Related Pieces
              </h2>
              <Link
                href="/"
                className="text-[9px] uppercase tracking-widest text-slate-400 hover:text-slate-900 border-b border-transparent hover:border-slate-900 transition-all pb-0.5"
              >
                View Collection
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p._id} product={p} priority={index < 4} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
