'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { ListingImage } from '@/types';

interface ImageGalleryProps {
  images: ListingImage[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If no images provided, show placeholder
  const displayImages =
    images && images.length > 0
      ? images
      : [
          {
            id: 'placeholder',
            listing_id: 'placeholder',
            image_url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1200&q=80',
            is_primary: true,
            sort_order: 0,
          },
        ];

  const currentImage = displayImages[selectedIndex] || displayImages[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-3">
      {/* Main Image Container */}
      <div 
        className="relative aspect-4/3 sm:aspect-16/10 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 cursor-zoom-in group shadow-xs"
        onClick={() => setIsFullscreen(true)}
      >
        <Image
          src={currentImage.image_url}
          alt={`${title} - view ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Counter Badge */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-slate-900/75 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium">
            {selectedIndex + 1} / {displayImages.length}
          </div>
        )}

        {/* Fullscreen icon button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(true);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900/90 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="View Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Arrows for multi images */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {displayImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img.image_url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 animate-in fade-in">
          <div className="flex items-center justify-between text-white z-10">
            <span className="text-sm font-medium">
              {selectedIndex + 1} of {displayImages.length}
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close Fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4">
            <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
              <Image
                src={currentImage.image_url}
                alt={title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          <div className="text-center text-slate-400 text-xs pb-2 truncate max-w-md mx-auto">
            {title}
          </div>
        </div>
      )}
    </div>
  );
}
