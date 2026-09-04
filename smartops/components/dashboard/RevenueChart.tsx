"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatINR } from "@/lib/utils";

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No revenue data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
        />
        <Tooltip formatter={(value: number) => formatINR(value)} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
