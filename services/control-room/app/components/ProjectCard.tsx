"use client";

import { motion } from "framer-motion";
import { FolderKanban } from "lucide-react";

interface ProjectCardProps {
  name: string;
  description: string;
  status: "active" | "completed" | "paused" | "planned";
  highlights?: string[];
  index?: number;
}

const statusConfig = {
  active: { label: "Active", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
  completed: { label: "Done", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  paused: { label: "Paused", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  planned: { label: "Planned", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};

export default function ProjectCard({ name, description, status, highlights = [], index = 0 }: ProjectCardProps) {
  const c = statusConfig[status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
            <FolderKanban className={`w-5 h-5 ${c.color}`} />
          </div>
          <h3 className="font-bold text-white">{name}</h3>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.color} border ${c.border}`}>{c.label}</span>
      </div>
      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{description}</p>
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {highlights.slice(0, 3).map((h, i) => (
            <span key={i} className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded">{h}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
