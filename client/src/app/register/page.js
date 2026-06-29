"use client";
// src/app/register/page.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { UserPlus, Mail, Lock, User, Apple } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Mật khẩu tối thiểu 6 ký tự"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Tạo tài khoản thành công!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: "radial-gradient(ellipse at top, #1e1b4b 0%, #0f0f1a 60%)"}}>
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="glass p-8 w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 mb-4">
            <Apple className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Tạo tài khoản</h1>
          <p className="text-white/50 text-sm mt-1">Bắt đầu theo dõi thực phẩm của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input name="name" type="text" placeholder="Họ và tên" value={form.name}
              onChange={handleChange} className="input-dark" style={{ paddingLeft: '2.5rem' }} required minLength={2} />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input name="email" type="email" placeholder="Email" value={form.email}
              onChange={handleChange} className="input-dark" style={{ paddingLeft: '2.5rem' }} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input name="password" type="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" value={form.password}
              onChange={handleChange} className="input-dark" style={{ paddingLeft: '2.5rem' }} required />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            style={{background: "linear-gradient(135deg, #8b5cf6, #ec4899)"}}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><UserPlus className="w-4 h-4" /> Đăng ký</>
            )}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
