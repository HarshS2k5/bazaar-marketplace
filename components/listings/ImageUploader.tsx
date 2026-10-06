'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Star, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ImageItem {
  id: string;
  file?: File;
  previewUrl: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export function ImageUploader({ images, onChange, maxImages = 8 }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const newItems: ImageItem[] = [];
    const remainingSlots = maxImages - images.length;

    if (fileList.length > remainingSlots) {
      setError(`You can only add up to ${maxImages} images in total.`);
    }

    const filesToProcess = Array.from(fileList).slice(0, remainingSlots);

    for (const file of filesToProcess) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not a supported format. Please use JPG, PNG, or WebP.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`"${file.name}" is larger than 5MB. Please upload smaller images.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: crypto.randomUUID(),
        file,
        previewUrl,
        isPrimary: images.length === 0 && newItems.length === 0,
      });
    }

    if (newItems.length > 0) {
      const combined = [...images, ...newItems];
      // Guarantee at least one is primary
      if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
        combined[0].isPrimary = true;
      }
      onChange(combined);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    const next = images.filter((img) => img.id !== id);
    if (next.length > 0 && !next.some((img) => img.isPrimary)) {
      next[0].isPrimary = true;
    }
    onChange(next);
  };

  const handleSetPrimary = (id: string) => {
    const next = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    onChange(next);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center gap-3 group"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm sm:text-base">
            Click to upload photos or drag and drop
          </p>
          <p className="text-xs text-slate-500 mt-1">
            JPG, PNG or WebP (max 5MB each). Up to {maxImages} photos.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 pointer-events-none group-hover:border-emerald-500 group-hover:text-emerald-700"
        >
          Select Images
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Error notice */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Previews Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Uploaded Photos ({images.length}/{maxImages})
            </span>
            <span className="text-xs text-slate-400">
              Star indicates the cover photo shown on cards
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((item, index) => (
              <div
                key={item.id}
                className={`group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border-2 transition-all shadow-xs ${
                  item.isPrimary ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200'
                }`}
              >
                <Image
                  src={item.previewUrl}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />

                {/* Primary Badge */}
                {item.isPrimary && (
                  <div className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    <span>Primary</span>
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                  <div className="flex items-center justify-between">
                    {!item.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(item.id)}
                        className="p-1 rounded-md bg-white/90 text-slate-700 hover:text-emerald-700 hover:bg-white text-xs font-medium flex items-center gap-1 px-1.5 shadow-xs"
                        title="Set as primary photo"
                      >
                        <Star className="w-3 h-3" />
                        <span>Set Primary</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 shadow-xs ml-auto"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Move Left / Right Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'left')}
                        className="p-1 rounded-md bg-white/90 text-slate-800 hover:bg-white shadow-xs"
                        title="Move left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'right')}
                        className="p-1 rounded-md bg-white/90 text-slate-800 hover:bg-white shadow-xs"
                        title="Move right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
