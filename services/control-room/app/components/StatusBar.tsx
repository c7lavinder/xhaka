"use client";

import { motion } from "framer-motion";
import { Wifi, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface StatusBarProps {
  compact?: boolean;
}

export default function StatusBar({ compact = false }: StatusBarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        <span className="text-teal-400">LIVE</span>
        <span>·</span>
        <span>c7lavinder/xhaka</span>
        <span className="ml-auto flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {time}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-3 bg-slate-800/40 backdrop-blur-xl border border-slate-700/30 rounded-xl mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-medium text-teal-400">LIVE</span>
        </div>
        <span className="text-xs text-slate-500">Xhaka Control Room · c7lavinder/xhaka</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <Wifi className="w-3 h-3 text-teal-400" />
        <Clock className="w-3 h-3" />
        <span>{time}</span>
      </div>
    </motion.div>
  );
}
