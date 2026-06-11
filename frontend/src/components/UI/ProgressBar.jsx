import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ label, percentage, color = 'azure', sublabel }) => {
  const colorMap = {
    azure: 'bg-gradient-to-r from-blue-600 to-fifa-azure',
    gold: 'bg-gradient-to-r from-amber-500 to-fifa-gold',
    rose: 'bg-gradient-to-r from-rose-500 to-pink-500',
    green: 'bg-gradient-to-r from-emerald-500 to-green-400'
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5 text-sm font-semibold">
        <span className="text-white flex items-center gap-2">
          {label}
          {sublabel && <span className="text-xs text-slate-400 font-normal">({sublabel})</span>}
        </span>
        <span className="text-fifa-gold">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-800/60 rounded-full h-2.5 overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorMap[color] || colorMap.azure}`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
