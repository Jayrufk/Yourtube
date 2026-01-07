"use client";

import { useState } from "react";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Movies",
  "News",
  "Sports",
  "Technology",
  "Comedy",
  "Education",
  "Science",
  "Travel",
  "Food",
  "Fashion",
];

export default function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
      {categories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
              ${
                isActive
                  ? "bg-black text-white"
                  : "bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-100"
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
