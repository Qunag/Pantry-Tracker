"use client";
// src/components/dashboard/StatsCards.jsx
import { ShoppingBasket, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const cards = [
  { key: "total",   label: "Tổng cộng", icon: ShoppingBasket, color: "#6366f1", bg: "rgba(99,102,241,0.15)"  },
  { key: "safe",    label: "An toàn",   icon: ShieldCheck,    color: "#22c55e", bg: "rgba(34,197,94,0.15)"   },
  { key: "warning", label: "Sắp hết",   icon: AlertTriangle,  color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
  { key: "expired", label: "Hết hạn",   icon: XCircle,        color: "#ef4444", bg: "rgba(239,68,68,0.15)"   },
];

export default function StatsCards({ stats }) {
  const chartData = [
    { name: "An toàn", value: stats.safe,    color: "#22c55e" },
    { name: "Sắp hết", value: stats.warning, color: "#f59e0b" },
    { name: "Hết hạn", value: stats.expired, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <div key={key} className="glass p-5 flex flex-col gap-3 animate-fade-in hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">{label}</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
          </div>
          <span className="text-3xl font-bold" style={{ color }}>{stats[key]}</span>

          {/* Mini donut chart chỉ hiện ở card Total */}
          {key === "total" && stats.total > 0 && (
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={18} outerRadius={30} dataKey="value" strokeWidth={0}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
