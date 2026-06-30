"use client";
// src/components/ui/ConfirmDialog.jsx
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

/**
 * ConfirmDialog — Thay thế window.confirm() bằng dialog đẹp, có animation.
 *
 * Props:
 *   isOpen      : boolean
 *   title       : string  (VD: "Xóa thực phẩm")
 *   message     : string  (VD: "Bạn có chắc chắn muốn xóa?")
 *   confirmText : string  (mặc định "Xác nhận")
 *   cancelText  : string  (mặc định "Hủy")
 *   onConfirm   : () => void
 *   onCancel    : () => void
 *   loading     : boolean (disable button khi đang xử lý)
 *   variant     : "danger" | "warning" | "info"
 */
export default function ConfirmDialog({
  isOpen,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  loading = false,
  variant = "danger",
}) {
  // Đóng khi nhấn Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantConfig = {
    danger:  { iconBg: "rgba(239,68,68,0.15)",   iconColor: "#ef4444", btnGradient: "linear-gradient(135deg, #ef4444, #dc2626)" },
    warning: { iconBg: "rgba(245,158,11,0.15)",  iconColor: "#f59e0b", btnGradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
    info:    { iconBg: "rgba(99,102,241,0.15)",   iconColor: "#6366f1", btnGradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
  };
  const cfg = variantConfig[variant] || variantConfig.danger;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Dialog box */}
      <div
        className="glass w-full max-w-sm p-6 animate-fade-in"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon vòng tròn */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: cfg.iconBg }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: cfg.iconColor }} />
            </div>
            <h3 className="font-bold text-white text-base leading-snug">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-white/40 hover:text-white transition-colors cursor-pointer ml-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="text-white/60 text-sm leading-relaxed mb-6 pl-[52px]">
            {message}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm text-white/60 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: cfg.btnGradient }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
