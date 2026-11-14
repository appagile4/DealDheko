import React from "react";
import { POPULAR_CATEGORIES } from "@/data/categories";
import { CategoryCard } from "./CategoryCard";

export function PopularCategories() {
  return (
    <section className="my-8 sm:my-12">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Popular Categories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse top marketplace departments across Nepal
          </p>
        </div>
      </div>

      {/* 8-column responsive grid matching the reference design */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-y-6 sm:gap-y-8 gap-x-2 sm:gap-x-3 items-start">
        {POPULAR_CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
