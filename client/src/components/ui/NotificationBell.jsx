"use client";
// src/components/ui/NotificationBell.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, AlertTriangle, Clock } from "lucide-react";
import api from "@/lib/api";
import { CATEGORIES } from "@/components/food/FoodModal";

const POLL_INTERVAL = 5 * 60 * 1000; // 5 phút

export default function NotificationBell() {
  const [open, setOpen]           = useState(false);
  const [foods, setFoods]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const dropdownRef               = useRef(null);

  const fetchExpiring = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/foods/expiring");
      setFoods(data.data || []);
    } catch {
      // silently ignore — không làm crash Navbar
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch khi mount và poll mỗi 5 phút
  useEffect(() => {
    fetchExpiring();
    const interval = setInterval(fetchExpiring, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchExpiring]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const count = foods.length;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  const getCategoryEmoji = (cat) =>
    CATEGORIES.find((c) => c.value === cat)?.emoji || "📦";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen((v) => !v); if (!open) fetchExpiring(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer hover:bg-white/10"
        style={{ background: open ? "rgba(99,102,241,0.2)" : undefined }}
        title="Thông báo thực phẩm sắp hết hạn"
      >
        <Bell className="w-4 h-4 text-white/70" />
        {/* Badge */}
        {count > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 animate-fade-in"
            style={{ background: count > 0 ? "#ef4444" : "#f59e0b", color: "#fff" }}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-12 w-80 glass animate-fade-in z-[200]"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-sm">Cảnh báo hết hạn</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : count === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                  style={{ background: "rgba(34,197,94,0.15)" }}>
                  <span className="text-xl">✅</span>
                </div>
                <p className="text-white/50 text-sm">Không có thực phẩm sắp hết hạn</p>
                <p className="text-white/30 text-xs mt-1">Tất cả thực phẩm đều còn an toàn!</p>
              </div>
            ) : (
              foods.map((food) => {
                const isExpired = food.daysLeft <= 0;
                const isWarning = food.daysLeft > 0 && food.daysLeft <= 3;
                const iconColor = isExpired ? "#ef4444" : "#f59e0b";
                const bgColor   = isExpired ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)";

                return (
                  <div
                    key={food.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: bgColor }}>
                      {isExpired
                        ? <AlertTriangle className="w-4 h-4" style={{ color: iconColor }} />
                        : <Clock className="w-4 h-4" style={{ color: iconColor }} />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {getCategoryEmoji(food.category)} {food.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: iconColor }}>
                        {isExpired
                          ? `Đã hết hạn từ ${formatDate(food.expiryDate)}`
                          : food.daysLeft === 1
                          ? "Hết hạn ngày mai!"
                          : `Còn ${food.daysLeft} ngày (${formatDate(food.expiryDate)})`
                        }
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div className="px-4 py-2 border-t border-white/10">
              <p className="text-xs text-white/30 text-center">
                {count} thực phẩm cần chú ý • Cập nhật mỗi 5 phút
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
