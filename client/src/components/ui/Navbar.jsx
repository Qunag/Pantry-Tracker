"use client";
// src/components/ui/Navbar.jsx
import { useAuth } from "@/context/AuthContext";
import { Apple, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="glass sticky top-0 z-50 mx-4 mt-4 px-6 py-3 flex items-center justify-between" style={{borderRadius: "16px"}}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center">
          <Apple className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="font-bold gradient-text">Food Expiry Tracker</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{background:"rgba(255,255,255,0.07)"}}>
          <User className="w-3.5 h-3.5 text-white/60" />
          <span className="text-sm text-white/80">{user?.name}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
