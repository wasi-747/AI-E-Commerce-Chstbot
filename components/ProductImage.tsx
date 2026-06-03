"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImageProps {
  imageUrl: string;
  name: string;
}

export default function ProductImage({ imageUrl, name }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full aspect-[3/4] bg-slate-105 border border-slate-200 overflow-hidden">
      {imageUrl && !imageError ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          priority
          className="object-cover hover:scale-[1.02] transition-transform duration-700 ease-out"
          sizes="(max-width: 1024px) 100vw, 60vw"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-3">
          <svg
            className="w-12 h-12 text-slate-300"
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
          <p className="text-xs tracking-widest uppercase text-slate-400 font-medium">
            Image unavailable
          </p>
        </div>
      )}
    </div>
  );
}
