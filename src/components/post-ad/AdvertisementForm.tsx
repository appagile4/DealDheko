import React from "react";
import { Input } from "@/components/common/Input";

interface AdvertisementFormProps {
  formData: {
    title: string;
    description: string;
    price: number | string;
    condition: "New" | "Used";
    brand?: string;
    year?: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string | number) => void;
  category: string;
}

export function AdvertisementForm({
  formData,
  errors,
  onChange,
  category,
}: AdvertisementFormProps) {
  const isVehicle = category === "cars" || category === "bikes";

  return (
    <div className="space-y-5 text-left">
      <div className="text-left">
        <h3 className="text-base font-bold text-slate-900">Include Some Details</h3>
        <p className="text-xs text-slate-500">Provide accurate and complete information</p>
      </div>

      {/* Ad Title */}
      <Input
        label="Ad Title *"
        placeholder="e.g. Royal Enfield Classic 350 / iPhone 14 Pro"
        value={formData.title}
        onChange={(e) => onChange("title", e.target.value)}
        error={errors.title}
        helperText="Mention key features, brand, model, and condition (Min 10 characters)"
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Description *
        </label>
        <textarea
          rows={4}
          placeholder="Describe what you are selling, its condition, accessories included, reason for selling, etc."
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          className={`w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#0A2540] focus:ring-1 focus:ring-[#0A2540] ${
            errors.description ? "border-rose-500" : ""
          }`}
        />
        {errors.description && (
          <p className="text-xs text-rose-600 font-medium">{errors.description}</p>
        )}
      </div>

      {/* Price */}
      <Input
        label="Set a Price (₹) *"
        type="number"
        placeholder="e.g. 25000"
        value={formData.price}
        onChange={(e) => onChange("price", Number(e.target.value))}
        error={errors.price}
      />

      {/* Condition */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">Condition</label>
        <div className="flex gap-3">
          {(["Used", "New"] as const).map((cond) => (
            <button
              key={cond}
              type="button"
              onClick={() => onChange("condition", cond)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                formData.condition === cond
                  ? "border-[#00A896] bg-[#00A896]/10 text-[#00A896]"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Vehicle fields */}
      {isVehicle && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Input
            label="Brand / Make"
            placeholder="e.g. Honda / Yamaha / TVS"
            value={formData.brand || ""}
            onChange={(e) => onChange("brand", e.target.value)}
          />
          <Input
            label="Registration Year"
            placeholder="e.g. 2021"
            value={formData.year || ""}
            onChange={(e) => onChange("year", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
