"use client";

import React, { useState } from "react";
import { CategorySelector } from "@/components/post-ad/CategorySelector";
import { AdvertisementForm } from "@/components/post-ad/AdvertisementForm";
import { ImageUploader } from "@/components/post-ad/ImageUploader";
import { LocationSelector } from "@/components/post-ad/LocationSelector";
import { AdvertisementPreview } from "@/components/post-ad/AdvertisementPreview";
import { Button } from "@/components/common/Button";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { useMarketplace } from "@/context/MarketplaceContext";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = [
  { id: 1, title: "Category" },
  { id: 2, title: "Details" },
  { id: 3, title: "Photos" },
  { id: 4, title: "Location" },
  { id: 5, title: "Preview" },
];

export default function PostAdPage() {
  const { addCustomAd, user } = useMarketplace();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState("");

  // Form State
  const [category, setCategory] = useState<string>("cars");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    condition: "Used" as "New" | "Used",
    brand: "",
    year: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [locationData, setLocationData] = useState({
    state: "Delhi",
    city: "Delhi",
    area: "",
    pincode: "",
  });
  const [sellerData, setSellerData] = useState({
    name: user?.name || "Verified Seller",
    phone: user?.phone || "+91 98765 43210",
    email: user?.email || "seller@example.com",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const err: Record<string, string> = {};

    if (step === 1) {
      if (!category) err.category = "Please select a category";
    }

    if (step === 2) {
      if (!formData.title.trim()) err.title = "Ad title is required";
      else if (formData.title.length < 8) err.title = "Title should be at least 8 characters";

      if (!formData.description.trim()) err.description = "Ad description is required";
      else if (formData.description.length < 15)
        err.description = "Please provide more details (at least 15 characters)";

      if (!formData.price || Number(formData.price) <= 0)
        err.price = "Please enter a valid price in Rupees";
    }

    if (step === 3) {
      if (images.length === 0) err.images = "Please add at least one photo for your advertisement";
    }

    if (step === 4) {
      if (!locationData.state) err.state = "State is required";
      if (!locationData.city) err.city = "City is required";
      if (!locationData.area.trim()) err.area = "Area / neighbourhood is required";
      if (!sellerData.name.trim()) err.name = "Seller name is required";
      if (!sellerData.phone.trim()) err.phone = "Phone number is required";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat.slug);
    setCurrentStep(2);
  };

  const handlePublish = () => {
    const slug = `${formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newAd: Product = {
      id: `custom-ad-${Date.now()}`,
      title: formData.title,
      slug: slug,
      description: formData.description,
      price: Number(formData.price),
      category: category,
      condition: formData.condition,
      images: images.length > 0 ? images : [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      ],
      location: {
        city: locationData.city,
        state: locationData.state,
        area: locationData.area,
        pincode: locationData.pincode,
      },
      seller: {
        id: user?.id || "user-101",
        name: sellerData.name,
        avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        memberSince: "Nov 2026",
        verified: true,
        phone: sellerData.phone,
        location: {
          city: locationData.city,
          state: locationData.state,
          area: locationData.area,
        },
        totalAds: 1,
      },
      postedAt: new Date().toISOString(),
      featured: true,
      attributes: {
        ...(formData.brand ? { Brand: formData.brand } : {}),
        ...(formData.year ? { Year: formData.year } : {}),
        Condition: formData.condition,
      },
    };

    addCustomAd(newAd);
    setPublishedSlug(slug);
    setIsPublished(true);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Post Free Advertisement" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Progress Steps Header */}
      {!isPublished && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            {STEPS.map((s) => {
              const isPassed = currentStep > s.id;
              const isCurrent = currentStep === s.id;

              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isPassed
                          ? "bg-[#00A896] text-white"
                          : isCurrent
                          ? "bg-[#0A2540] text-white ring-4 ring-[#0A2540]/10"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : s.id}
                    </div>
                    <span
                      className={`text-xs font-bold hidden sm:inline ${
                        isCurrent ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {s.id !== STEPS.length && (
                    <div
                      className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                        isPassed ? "bg-[#00A896]" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Step 1: Category Selector */}
        {currentStep === 1 && (
          <CategorySelector
            selectedCategory={category}
            onSelect={handleCategorySelect}
          />
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <AdvertisementForm
            formData={formData}
            errors={errors}
            onChange={(field, val) => setFormData((prev) => ({ ...prev, [field]: val }))}
            category={category}
          />
        )}

        {/* Step 3: Photos */}
        {currentStep === 3 && (
          <ImageUploader
            images={images}
            onChange={setImages}
            error={errors.images}
          />
        )}

        {/* Step 4: Location & Seller */}
        {currentStep === 4 && (
          <LocationSelector
            locationData={locationData}
            sellerData={sellerData}
            errors={errors}
            onChangeLocation={(field, val) =>
              setLocationData((prev) => ({ ...prev, [field]: val }))
            }
            onChangeSeller={(field, val) =>
              setSellerData((prev) => ({ ...prev, [field]: val }))
            }
          />
        )}

        {/* Step 5: Preview & Publish */}
        {currentStep === 5 && (
          <AdvertisementPreview
            data={{
              ...formData,
              category,
              images,
              ...locationData,
              sellerName: sellerData.name,
              sellerPhone: sellerData.phone,
              sellerEmail: sellerData.email,
            }}
            onPublish={handlePublish}
            onBack={handleBack}
            isPublished={isPublished}
            publishedSlug={publishedSlug}
          />
        )}

        {/* Navigation Step Buttons (for Steps 2, 3, 4) */}
        {!isPublished && currentStep > 1 && currentStep < 5 && (
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
