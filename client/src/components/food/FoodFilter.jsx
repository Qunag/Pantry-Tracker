"use client";
// src/components/food/FoodFilter.jsx
import { Search, X } from "lucide-react";

const TABS = [
  { value: "",        label: "Tất cả"   },
  { value: "safe",    label: "🟢 An toàn" },
  { value: "warning", label: "🟡 Sắp hết" },
  { value: "expired", label: "🔴 Hết hạn" },
];

export default function FoodFilter({ search, status, onSearch, onStatus }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Tìm kiếm thực phẩm..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="input-dark pl-10 pr-9"
        />
        {search && (
          <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 glass p-1" style={{borderRadius: 12}}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatus(tab.value)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            style={
              status === tab.value
                ? { background: "rgba(99,102,241,0.3)", color: "#a5b4fc" }
                : { color: "rgba(255,255,255,0.5)" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
