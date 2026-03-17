"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "teal" | "purple" | "yellow" | "blue" | "red";
  index?: number;
}

const colorMap = {
  teal: { bg: "bg-teal-500/10", icon: "text-teal-400", value: "text-teal-400" },
  purple: { bg: "bg-purple-500/10", icon: "text-purple-400", value: "text-white" },
  yellow: { bg: "bg-yellow-500/10", icon: "text-yellow-400", value: "text-white" },
  blue: { bg: "bg-blue-500/10", icon: "text-blue-400", value: "text-white" },
  red: { bg: "bg-red-500/10", icon: "text-red-400", value: "text-white" },
};

export default function MetricCard({ title, value, subtitle, icon: Icon, color = "teal", index = 0 }: MetricCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <span className="text-slate-400 text-sm">{title}</span>
      </div>
      <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </motion.div>
  );
}
