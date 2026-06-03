import ProductCard from "@/components/ProductCard";

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

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Welcome to TechDojo Store
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover our premium collection of high-quality t-shirts and pants.
            Shop now and enjoy great deals!
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-xl text-gray-500 mb-4">No products available</p>
            <p className="text-gray-400">Please check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
