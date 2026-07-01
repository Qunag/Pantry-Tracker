"use client";
// src/components/dashboard/CategoryChart.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { CATEGORIES } from "@/components/food/FoodModal";

const BAR_COLOR = "#6366f1";

const CATEGORY_COLORS = {
  vegetable: "#22c55e",
  meat:      "#ef4444",
  frozen:    "#60a5fa",
  dairy:     "#f9a8d4",
  dry:       "#fbbf24",
  drink:     "#34d399",
  other:     "#a78bfa",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="px-3 py-2 text-sm rounded-xl"
      style={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <span style={{ color: d.color }}>{d.emoji} {d.label}</span>
      <span className="ml-2 font-bold text-white">{d.count}</span>
    </div>
  );
};

export default function CategoryChart({ data = [] }) {
  if (!data || data.length < 2) return null; // Ẩn nếu chỉ có 1 category

  // Map từ API sang dạng recharts hiểu
  const chartData = data
    .map((item) => {
      const catInfo = CATEGORIES.find((c) => c.value === item.category) || CATEGORIES.at(-1);
      return {
        category: item.category,
        label:    catInfo.label,
        emoji:    catInfo.emoji,
        count:    item.count,
        color:    CATEGORY_COLORS[item.category] || BAR_COLOR,
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="glass p-5 mb-6 animate-fade-in">
      <h2 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
        <span>📊</span> Phân bổ theo danh mục
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={28}>
          <XAxis
            dataKey="emoji"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 18 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.category} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
