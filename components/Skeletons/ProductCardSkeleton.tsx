export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-slate-200 p-0 animate-pulse">
      {/* Product Image placeholder */}
      <div className="relative w-full aspect-[3/4] bg-slate-200" />

      {/* Product Info placeholder */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category */}
        <div className="h-2.5 bg-slate-200 w-1/4 mb-3 rounded-sm" />

        {/* Name */}
        <div className="space-y-2 mb-4">
          <div className="h-3.5 bg-slate-200 w-3/4 rounded-sm" />
          <div className="h-3.5 bg-slate-200 w-1/2 rounded-sm" />
        </div>

        {/* Price */}
        <div className="h-3.5 bg-slate-200 w-1/4 mb-6 rounded-sm" />

        {/* Size Selector */}
        <div className="mb-4">
          <div className="h-2 bg-slate-200 w-1/6 mb-2.5 rounded-sm" />
          <div className="flex gap-1.5 flex-wrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-9 h-9 bg-slate-150 border border-slate-200 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <div className="h-2 bg-slate-200 w-1/12 mb-2.5 rounded-sm" />
          <div className="w-20 h-8 bg-slate-200 rounded-sm" />
        </div>

        {/* Add to Cart Button */}
        <div className="w-full h-11 bg-slate-200 mt-auto rounded-sm" />
      </div>
    </div>
  );
}
