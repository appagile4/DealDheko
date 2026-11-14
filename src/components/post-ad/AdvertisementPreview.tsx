"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { CheckCircle2, MapPin, User, Eye, ArrowLeft, Send } from "lucide-react";

interface AdvertisementPreviewProps {
  data: {
    title: string;
    description: string;
    price: number | string;
    condition: "New" | "Used";
    category: string;
    images: string[];
    state: string;
    city: string;
    area: string;
    pincode: string;
    sellerName: string;
    sellerPhone: string;
    sellerEmail: string;
  };
  onPublish: () => void;
  onBack: () => void;
  isPublished: boolean;
  publishedSlug?: string;
}

export function AdvertisementPreview({
  data,
  onPublish,
  onBack,
  isPublished,
  publishedSlug,
}: AdvertisementPreviewProps) {
  if (isPublished) {
    return (
      <div className="py-12 text-center space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">
            Congratulations! Your Ad is Live!
          </h2>
          <p className="text-sm text-slate-500">
            Your advertisement &quot;{data.title}&quot; has been verified and published on DealDheko.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {publishedSlug && (
            <Link href={`/product/${publishedSlug}`} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full" leftIcon={<Eye className="w-4 h-4" />}>
                View Your Live Ad
              </Button>
            </Link>
          )}
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const coverImage =
    data.images[0] ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Preview Your Advertisement</h3>
          <p className="text-xs text-slate-500">
            This is how buyers will see your listing on DealDheko
          </p>
        </div>
      </div>

      {/* Card Preview */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-md max-w-lg mx-auto">
        <div className="relative aspect-[16/10] w-full bg-slate-900">
          <Image
            src={coverImage}
            alt={data.title}
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-cover"
          />
          <div className="absolute top-3 left-3 bg-[#FF6A00] text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
            Preview
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {formatPrice(Number(data.price) || 0)}
            </span>
            <h4 className="text-lg font-bold text-slate-800 mt-1">{data.title}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>
                {data.area}, {data.city}, {data.state}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 whitespace-pre-line">
            {data.description}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <span className="font-bold">{data.sellerName}</span>
            </div>
            <span className="text-slate-400">Listed: Just now</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Edit
        </Button>
        <Button
          variant="sell"
          size="lg"
          onClick={onPublish}
          rightIcon={<Send className="w-4 h-4 stroke-[3]" />}
          className="shadow-xl px-8"
        >
          Publish Ad Now
        </Button>
      </div>
    </div>
  );
}
