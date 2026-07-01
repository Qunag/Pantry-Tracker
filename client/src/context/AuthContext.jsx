"use client";
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Khôi phục session từ localStorage khi mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token  = localStorage.getItem("accessToken");
    if (stored && token) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  // --- LOGIN ---
  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    _saveTokens(data.accessToken, data.refreshToken);
    // Lấy thông tin user sau khi login
    const meRes    = await api.get("/api/auth/me");
    const userData = meRes.data.data;
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // --- REGISTER ---
  const register = async (name, email, password) => {
    const { data } = await api.post("/api/auth/register", { name, email, password });
    _saveTokens(data.accessToken, data.refreshToken);
    const meRes    = await api.get("/api/auth/me");
    const userData = meRes.data.data;
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // --- LOGOUT — thu hồi refresh token trên server ---
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        // Best-effort: nếu server lỗi vẫn logout phía client
        await api.post("/api/auth/logout", { refreshToken }).catch(() => {});
      }
    } finally {
      _clearSession();
      router.push("/login");
    }
  };

  // --- UPDATE PROFILE ---
  const updateProfile = async (name) => {
    const { data } = await api.put("/api/auth/profile", { name });
    const updated  = data.data;
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  // --- CHANGE PASSWORD — revoke all tokens sau khi đổi mật khẩu ---
  const changePassword = async (currentPassword, newPassword) => {
    await api.put("/api/auth/password", { currentPassword, newPassword });
    // Sau khi đổi mật khẩu, force logout để user đăng nhập lại với mật khẩu mới
    _clearSession();
    router.push("/login");
  };

  // --- Helpers ---
  const _saveTokens = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  };

  const _clearSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
