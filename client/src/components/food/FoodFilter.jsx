"use client";
// src/components/food/FoodFilter.jsx
import { Search, X, ArrowUpDown } from "lucide-react";
import { CATEGORIES } from "./FoodModal";

const STATUS_TABS = [
  { value: "",        label: "Tất cả"   },
  { value: "safe",    label: "🟢 An toàn" },
  { value: "warning", label: "🟡 Sắp hết" },
  { value: "expired", label: "🔴 Hết hạn" },
];

const SORT_OPTIONS = [
  { value: "expiryDate:asc",   label: "Hạn sớm nhất" },
  { value: "expiryDate:desc",  label: "Hạn muộn nhất" },
  { value: "name:asc",         label: "Tên A → Z" },
  { value: "name:desc",        label: "Tên Z → A" },
  { value: "quantity:desc",    label: "Số lượng nhiều" },
  { value: "createdAt:desc",   label: "Mới thêm nhất" },
];

export default function FoodFilter({ search, status, category, sort, onSearch, onStatus, onCategory, onSort }) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Row 1: Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
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

        {/* Sort dropdown */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="input-dark pl-9 pr-4 appearance-none cursor-pointer"
            style={{ minWidth: 170 }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Status tabs + Category filter */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status tabs */}
        <div className="flex gap-1 glass p-1" style={{ borderRadius: 12 }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatus(tab.value)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap"
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

        {/* Divider */}
        <div className="h-6 w-px bg-white/10 hidden sm:block" />

        {/* Category chips */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => onCategory("")}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border"
            style={
              !category
                ? { background: "rgba(99,102,241,0.2)", borderColor: "#6366f1", color: "#a5b4fc" }
                : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }
            }
          >
            Tất cả
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategory(cat.value === category ? "" : cat.value)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border"
              style={
                category === cat.value
                  ? { background: "rgba(99,102,241,0.2)", borderColor: "#6366f1", color: "#a5b4fc" }
                  : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }
              }
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
