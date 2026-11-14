"use client";

import React from "react";
import Image from "next/image";
import { UploadCloud, X, Star, Plus } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  error?: string;
}

const PRESET_MOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
];

export function ImageUploader({ images, onChange, error }: ImageUploaderProps) {
  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([item, ...rest]);
  };

  const handleAddPreset = (url: string) => {
    if (images.length >= 8) return;
    if (images.includes(url)) return;
    onChange([...images, url]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert local file to Object URL for instant preview
    const newUrls: string[] = [];
    for (let i = 0; i < files.length && images.length + newUrls.length < 8; i++) {
      const url = URL.createObjectURL(files[i]);
      newUrls.push(url);
    }
    onChange([...images, ...newUrls]);
  };

  return (
    <div className="space-y-5 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Upload Product Photos</h3>
          <p className="text-xs text-slate-500">
            Ads with clear real photos get up to 5x more buyer enquiries
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {images.length} / 8 Photos
        </span>
      </div>

      {/* Upload Dropzone */}
      <label className="border-2 border-dashed border-slate-300 hover:border-[#00A896] bg-slate-50 hover:bg-[#00A896]/5 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#00A896] mb-2">
          <UploadCloud className="w-6 h-6" />
        </div>
        <span className="text-sm font-bold text-slate-800">
          Click to upload photos from your device
        </span>
        <span className="text-xs text-slate-400 mt-1">
          Supports JPG, PNG, WEBP (Max 8 photos)
        </span>
      </label>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

      {/* Quick Preset Photos selector for easy demo testing */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-semibold text-slate-600 block">
          Or add sample demo photos with 1-click:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_MOCK_PHOTOS.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddPreset(url)}
              disabled={images.includes(url) || images.length >= 8}
              className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 disabled:opacity-40 hover:scale-105 transition-transform"
            >
              <Image
                src={url}
                alt={`Preset ${i}`}
                fill
                sizes="56px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                <Plus className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Image Previews List */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group bg-slate-100"
            >
              <Image
                src={img}
                alt={`Photo ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />

              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-[#0A2540] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Cover
                </span>
              )}

              {/* Action Buttons */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(index)}
                    className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs font-bold"
                    title="Make Cover Photo"
                  >
                    Set Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  title="Remove Photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
