"use client";
// src/components/food/FoodCard.jsx
import { Calendar, Package, Pencil, Trash2 } from "lucide-react";

const STATUS_CONFIG = {
  safe:    { label: "An toàn",   borderColor: "#22c55e", badgeClass: "badge-safe"    },
  warning: { label: "Sắp hết",   borderColor: "#f59e0b", badgeClass: "badge-warning" },
  expired: { label: "Hết hạn",   borderColor: "#ef4444", badgeClass: "badge-expired" },
};

export default function FoodCard({ food, onEdit, onDelete, isDeleting }) {
  const cfg = STATUS_CONFIG[food.status] || STATUS_CONFIG.safe;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const daysLabel =
    food.daysLeft <= 0 ? "Đã hết hạn"
    : food.daysLeft === 1 ? "Còn 1 ngày"
    : `Còn ${food.daysLeft} ngày`;

  return (
    <div
      className="glass p-5 flex flex-col gap-3 animate-fade-in hover:scale-[1.02] transition-transform duration-200 cursor-default"
      style={{ borderColor: cfg.borderColor, borderWidth: 1 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white leading-snug line-clamp-2">{food.name}</h3>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.badgeClass} ${food.status === "warning" ? "animate-pulse-warning" : ""}`}>
          {cfg.label}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 text-sm text-white/60">
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5" />
          <span>{food.quantity}{food.unit ? ` ${food.unit}` : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(food.expiryDate)}</span>
        </div>
      </div>

      {/* Days left bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white/40">{daysLabel}</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(0, Math.min(100, (food.daysLeft / 30) * 100))}%`,
              background: cfg.borderColor,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEdit(food)}
          disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Pencil className="w-3.5 h-3.5" /> Sửa
        </button>
        <button
          onClick={() => onDelete(food.id)}
          disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Xóa
        </button>
      </div>
    </div>
  );
}
