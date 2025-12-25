"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4">
      {/* Ảnh lớn */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-gray-100">
        <Image
          src={mainImage}
          alt="Product image"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* List ảnh nhỏ */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {images.map((image, idx) => (
          <button
            key={idx}
            className={cn(
              "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md border-2",
              mainImage === image ? "border-green-600" : "border-transparent"
            )}
            onClick={() => setMainImage(image)}
          >
            <Image src={image} alt={`Thumb ${idx}`} fill className="object-cover" unoptimized />
          </button>
        ))}
      </div>
    </div>
  );
}