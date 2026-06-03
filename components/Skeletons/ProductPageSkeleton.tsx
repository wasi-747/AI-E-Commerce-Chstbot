export default function ProductPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 animate-pulse">
      {/* Breadcrumbs placeholder */}
      <div className="h-3.5 bg-slate-200 w-48 mb-8 rounded-sm" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column - Image Placeholder */}
        <div className="lg:col-span-7">
          <div className="aspect-[3/4] bg-slate-200 w-full rounded-sm" />
        </div>

        {/* Right Column - Details Placeholder */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          {/* Category */}
          <div className="h-2.5 bg-slate-200 w-24 mb-3 rounded-sm" />

          {/* Name */}
          <div className="space-y-3 mb-6">
            <div className="h-7 bg-slate-200 w-3/4 rounded-sm" />
            <div className="h-7 bg-slate-200 w-1/2 rounded-sm" />
          </div>

          {/* Price */}
          <div className="h-5 bg-slate-200 w-28 mb-8 rounded-sm" />

          <hr className="border-slate-200 my-6" />

          {/* Size Selector */}
          <div className="mb-6">
            <div className="h-2.5 bg-slate-200 w-12 mb-3 rounded-sm" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 bg-slate-200 rounded-sm" />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-8">
            <div className="h-2.5 bg-slate-200 w-8 mb-3 rounded-sm" />
            <div className="w-24 h-10 bg-slate-200 rounded-sm" />
          </div>

          {/* Action Button */}
          <div className="w-full h-12 bg-slate-250 mb-8 rounded-sm" />

          {/* Collapsible Details */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="h-3 bg-slate-200 w-full rounded-sm" />
            <div className="h-3 bg-slate-200 w-11/12 rounded-sm" />
            <div className="h-3 bg-slate-200 w-4/5 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
