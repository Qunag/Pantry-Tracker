"use client";
// src/app/profile/page.js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/ui/Navbar";
import { User, Lock, Shield, Calendar, ShoppingBasket, Save, Eye, EyeOff, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading: authLoading, updateProfile, changePassword } = useAuth();
  const router = useRouter();

  // --- Profile form ---
  const [name, setName]             = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // --- Password form ---
  const [pwForm, setPwForm]         = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw]         = useState({ current: false, newPw: false, confirm: false });
  const [savingPw, setSavingPw]     = useState(false);

  // --- Stats ---
  const [stats, setStats]           = useState(null);

  // Redirect nếu chưa login
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  // Sync tên hiện tại vào form
  useEffect(() => {
    if (user) setName(user.name || "");
  }, [user]);

  // Lấy stats
  useEffect(() => {
    if (!user) return;
    api.get("/api/foods/stats").then((r) => setStats(r.data.data)).catch(() => {});
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Tên phải có ít nhất 2 ký tự");
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile(name.trim());
      toast.success("Đã cập nhật tên thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể cập nhật");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword);
      toast.success("Đổi mật khẩu thành công!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể đổi mật khẩu");
    } finally {
      setSavingPw(false);
    }
  };

  const togglePw = (field) => setShowPw((v) => ({ ...v, [field]: !v[field] }));

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen pb-20">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
        </Link>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Hồ sơ <span className="gradient-text">cá nhân</span>
          </h1>
          <p className="text-white/50 mt-1">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Tổng thực phẩm", value: stats.total, icon: ShoppingBasket, color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
              { label: "Ngày tham gia",  value: joinedDate,  icon: Calendar,       color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
              { label: "Đã hết hạn",     value: stats.expired, icon: Shield,       color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="glass p-4 flex flex-col gap-2 animate-fade-in">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs text-white/50">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Section 1: Thông tin cá nhân */}
        <div className="glass p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold">Thông tin cá nhân</h2>
              <p className="text-xs text-white/40">Cập nhật tên hiển thị của bạn</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Email</label>
              <input
                value={user.email}
                readOnly
                className="input-dark opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-white/30 mt-1">Email không thể thay đổi</p>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Tên hiển thị *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-dark"
                placeholder="Nhập tên của bạn"
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile || name.trim() === user.name}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              {savingProfile ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Lưu thay đổi
            </button>
          </form>
        </div>

        {/* Section 2: Đổi mật khẩu */}
        <div className="glass p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
              <Lock className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="font-bold">Đổi mật khẩu</h2>
              <p className="text-xs text-white/40">Mật khẩu mới phải có ít nhất 6 ký tự</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { field: "currentPassword", label: "Mật khẩu hiện tại", pwKey: "current" },
              { field: "newPassword",     label: "Mật khẩu mới",      pwKey: "newPw"   },
              { field: "confirm",         label: "Xác nhận mật khẩu mới", pwKey: "confirm" },
            ].map(({ field, label, pwKey }) => (
              <div key={field}>
                <label className="text-sm text-white/60 mb-1.5 block">{label}</label>
                <div className="relative">
                  <input
                    type={showPw[pwKey] ? "text" : "password"}
                    value={pwForm[field]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="input-dark pr-10"
                    placeholder="••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePw(pwKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPw[pwKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={savingPw || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
            >
              {savingPw ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
