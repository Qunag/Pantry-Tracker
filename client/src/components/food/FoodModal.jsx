"use client";
// src/components/food/FoodModal.jsx
import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const EMPTY = { name: "", quantity: 1, unit: "", expiryDate: "", barcode: "" };

export default function FoodModal({ isOpen, food, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (food) {
      setForm({
        name:       food.name       || "",
        quantity:   food.quantity   || 1,
        unit:       food.unit       || "",
        barcode:    food.barcode    || "",
        expiryDate: food.expiryDate ? food.expiryDate.split("T")[0] : "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [food, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "quantity" ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ ...form, expiryDate: form.expiryDate });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="glass w-full max-w-md p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{food ? "Cập nhật thực phẩm" : "Thêm thực phẩm mới"}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Tên thực phẩm *</label>
            <input name="name" value={form.name} onChange={handleChange}
              className="input-dark" placeholder="VD: Sữa tươi TH" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Số lượng</label>
              <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange}
                className="input-dark" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Đơn vị</label>
              <input name="unit" value={form.unit} onChange={handleChange}
                className="input-dark" placeholder="hộp, gói, kg..." />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Hạn sử dụng *</label>
            <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange}
              className="input-dark" required
              style={{ colorScheme: "dark" }}
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Barcode (tùy chọn)</label>
            <input name="barcode" value={form.barcode} onChange={handleChange}
              className="input-dark" placeholder="8934563118037" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-white/60 hover:text-white transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Save className="w-4 h-4" /> Lưu</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
