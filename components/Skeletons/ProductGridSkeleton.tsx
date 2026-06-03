import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-slate-200">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
