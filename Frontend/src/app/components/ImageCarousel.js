// src/app/components/ImageCarousel.js
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toImageUrl } from "@/lib/api";

export default function ImageCarousel({ images = [] }) {
  // Normalize incoming paths -> absolute URLs
  const normalized = useMemo(
    () => (Array.isArray(images) ? images : [])
      .filter(Boolean)
      .map(toImageUrl),
    [images]
  );

  const [index, setIndex] = useState(0);
  const [hadError, setHadError] = useState(false);

  // Keep index in range when images prop changes
  useEffect(() => {
    if (index >= normalized.length) setIndex(0);
  }, [normalized.length, index]);

  // Reset error state when slide changes
  useEffect(() => {
    setHadError(false);
  }, [index]);

  const hasImages = normalized.length > 0;

  const next = () =>
    setIndex((v) => (normalized.length ? (v + 1) % normalized.length : 0));
  const prev = () =>
    setIndex((v) =>
      normalized.length ? (v - 1 + normalized.length) % normalized.length : 0
    );

  if (!hasImages) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
        No Images Available
      </div>
    );
  }

  const displaySrc = hadError ? "/placeholder.png" : normalized[index];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Image
        src={displaySrc}
        alt="Product Image"
        width={900}
        height={600}
        className="w-full h-64 object-cover rounded-lg"
        onError={() => setHadError(true)}
        // Skip optimizer to avoid local dev issues with external hosts
        unoptimized
        priority={index === 0}
      />

      {normalized.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
            aria-label="Previous image"
          >
            &lt;
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
            aria-label="Next image"
          >
            &gt;
          </button>
        </>
      )}
    </div>
  );
}
