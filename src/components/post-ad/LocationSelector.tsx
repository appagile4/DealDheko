import React from "react";
import { Input } from "@/components/common/Input";
import { INDIAN_STATES, POPULAR_CITIES } from "@/data/locations";

interface LocationSelectorProps {
  locationData: {
    state: string;
    city: string;
    area: string;
    pincode: string;
  };
  sellerData: {
    name: string;
    phone: string;
    email: string;
  };
  errors: Record<string, string>;
  onChangeLocation: (field: string, value: string) => void;
  onChangeSeller: (field: string, value: string) => void;
}

export function LocationSelector({
  locationData,
  sellerData,
  errors,
  onChangeLocation,
  onChangeSeller,
}: LocationSelectorProps) {
  return (
    <div className="space-y-6 text-left">
      {/* Location Details */}
      <div className="space-y-4">
        <div className="text-left">
          <h3 className="text-base font-bold text-slate-900">Confirm Your Location</h3>
          <p className="text-xs text-slate-500">
            Helps local buyers find your advertisement quickly
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">State *</label>
            <select
              value={locationData.state}
              onChange={(e) => onChangeLocation("state", e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-[#0A2540]"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-rose-600">{errors.state}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">City *</label>
            <select
              value={locationData.city}
              onChange={(e) => onChangeLocation("city", e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-[#0A2540]"
            >
              <option value="">Select City</option>
              {POPULAR_CITIES.filter((c) => c.name !== "All India").map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.city && <p className="text-xs text-rose-600">{errors.city}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Neighbourhood / Area *"
            placeholder="e.g. Indiranagar / Bandra West"
            value={locationData.area}
            onChange={(e) => onChangeLocation("area", e.target.value)}
            error={errors.area}
          />
          <Input
            label="Pincode"
            placeholder="e.g. 560038"
            value={locationData.pincode}
            onChange={(e) => onChangeLocation("pincode", e.target.value)}
          />
        </div>
      </div>

      {/* Seller Information */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="text-left">
          <h3 className="text-base font-bold text-slate-900">Your Contact Details</h3>
          <p className="text-xs text-slate-500">
            Verified contact info builds buyer trust and prevents spam
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Your Name *"
            placeholder="e.g. Arjun Verma"
            value={sellerData.name}
            onChange={(e) => onChangeSeller("name", e.target.value)}
            error={errors.name}
          />
          <Input
            label="Phone Number *"
            placeholder="+91 98765 43210"
            value={sellerData.phone}
            onChange={(e) => onChangeSeller("phone", e.target.value)}
            error={errors.phone}
          />
          <Input
            label="Email Address"
            placeholder="name@example.com"
            value={sellerData.email}
            onChange={(e) => onChangeSeller("email", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
