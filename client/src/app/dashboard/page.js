"use client";
// src/app/dashboard/page.js
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFoods } from "@/hooks/useFoods";
import Navbar from "@/components/ui/Navbar";
import StatsCards from "@/components/dashboard/StatsCards";
import FoodCard from "@/components/food/FoodCard";
import FoodFilter from "@/components/food/FoodFilter";
import FoodModal from "@/components/food/FoodModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Plus, PackageOpen } from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    foods, stats, pagination, loading,
    saving, deleting,
    fetchFoods, fetchStats, createFood, updateFood, deleteFood,
  } = useFoods();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // State cho ConfirmDialog xóa
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Redirect nếu chưa login
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (user) {
      fetchFoods({ status, search });
      fetchStats();
    }
  }, [user, status, fetchFoods, fetchStats]);

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (user) fetchFoods({ status, search });
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const refresh = useCallback(() => {
    fetchFoods({ status, search });
    fetchStats();
  }, [status, search, fetchFoods, fetchStats]);

  const handleSave = async (formData) => {
    try {
      if (editingFood) {
        await updateFood(editingFood.id, formData);
      } else {
        await createFood(formData);
      }
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
      throw err;
    }
  };

  // Bước 1: Mở ConfirmDialog thay vì window.confirm()
  const handleDeleteRequest = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  // Bước 2: Người dùng xác nhận → thực hiện xóa
  const handleDeleteConfirm = async () => {
    try {
      await deleteFood(deletingId);
      refresh();
    } catch {
      toast.error("Không thể xóa");
    } finally {
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const openAdd = () => { setEditingFood(null); setModalOpen(true); };
  const openEdit = (food) => { setEditingFood(food); setModalOpen(true); };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Xin chào, <span className="gradient-text">{user.name}</span> 
          </h1>
          <p className="text-white/50 mt-1">Theo dõi thực phẩm của bạn để tránh lãng phí</p>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Filter */}
        <FoodFilter
          search={search}
          status={status}
          onSearch={setSearch}
          onStatus={(s) => { setStatus(s); fetchFoods({ status: s, search }); }}
        />

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : foods.length === 0 ? (
          /* Empty state */
          <div className="glass flex flex-col items-center justify-center py-20 text-center">
            <PackageOpen className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/40 text-lg font-medium">Chưa có thực phẩm nào</p>
            <p className="text-white/30 text-sm mt-1">Nhấn nút + để thêm thực phẩm đầu tiên</p>
            <button onClick={openAdd}
              className="mt-6 px-6 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-opacity hover:opacity-80"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              Thêm thực phẩm
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {foods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onEdit={openEdit}
                  onDelete={handleDeleteRequest}
                  isDeleting={deleting && deletingId === food.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => fetchFoods({ status, search, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  ← Trước
                </button>
                <span className="text-white/50 text-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchFoods({ status, search, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Tiếp →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* FAB — Floating Action Button */}
      <button
        onClick={openAdd}
        disabled={saving}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 8px 32px rgba(99,102,241,0.4)" }}
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Modal thêm / sửa */}
      <FoodModal
        isOpen={modalOpen}
        food={editingFood}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      {/* ConfirmDialog xóa */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Xóa thực phẩm"
        message="Bạn có chắc chắn muốn xóa thực phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Giữ lại"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleting}
        variant="danger"
      />
    </div>
  );
}
