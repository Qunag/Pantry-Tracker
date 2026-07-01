"use client";
// src/components/ui/Navbar.jsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/ui/NotificationBell";
import { Apple, LogOut, UserCog } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav
      className="glass sticky top-0 z-50 mx-4 mt-4 px-6 py-3 flex items-center justify-between"
      style={{ borderRadius: "16px" }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center">
          <Apple className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="font-bold gradient-text hidden sm:block">Food Expiry Tracker</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <NotificationBell />

        {/* Profile link */}
        <Link
          href="/profile"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
          style={
            pathname === "/profile"
              ? { background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }
              : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)" }
          }
          title="Hồ sơ cá nhân"
        >
          <UserCog className="w-3.5 h-3.5" />
          <span className="text-sm hidden sm:block">{user?.name}</span>
        </Link>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
          title="Đăng xuất"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
}
