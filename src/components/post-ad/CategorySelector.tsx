import React from "react";
import { POPULAR_CATEGORIES } from "@/data/categories";
import { Category } from "@/types/category";
import { Check } from "lucide-react";

interface CategorySelectorProps {
  selectedCategory: string;
  onSelect: (category: Category) => void;
}

export function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-left">
        <h3 className="text-base font-bold text-slate-900">Choose a Category</h3>
        <p className="text-xs text-slate-500">
          Select the department that best describes what you are listing
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {POPULAR_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat)}
              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? "border-[#0047BA] bg-[#0047BA]/10 text-[#0047BA] font-bold shadow-sm"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="truncate pr-2">
                <span className="block text-sm truncate">{cat.name}</span>
                <span className="text-[10px] text-slate-400 block">{cat.itemCount} ads</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-[#0047BA] shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
