'use client';

import { motion } from 'framer-motion';
import type { FamousInvestor } from '@/types/calculator';

interface FamousInvestorsProps {
  investors: FamousInvestor[];
  symbol: string;
}

const ACTION_CONFIG = {
  buy: { color: 'text-emerald-600', bgColor: 'bg-emerald-50', label: '🟢' },
  hold: { color: 'text-amber-600', bgColor: 'bg-amber-50', label: '🟡' },
  sell: { color: 'text-rose-500', bgColor: 'bg-rose-50', label: '🔴' },
} as const;

/**
 * ★ Famous Investors — คนดัง / กูรู ที่ถือหุ้นตัวนี้
 * แสดงรูป, ตำแหน่ง, action (ซื้อ/ถือ/ขาย), ความเห็น
 */
export function FamousInvestors({ investors, symbol }: FamousInvestorsProps) {
  if (!investors || investors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg">👑</span>
        <h3
          className="text-base font-semibold text-charcoal"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          คนดังที่ถือ {symbol}
        </h3>
      </div>

      {/* Investor Cards */}
      <div className="space-y-3">
        {investors.map((investor, index) => {
          const actionCfg = ACTION_CONFIG[investor.action];

          return (
            <motion.div
              key={investor.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.08 }}
              className="glass-card-static p-4 hover:bg-white/70 transition-colors duration-300"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-lavender-light flex items-center justify-center text-xl shrink-0">
                  {investor.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-semibold text-charcoal"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {investor.nameTh}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${actionCfg.bgColor} ${actionCfg.color}`}>
                      {actionCfg.label} {investor.actionTh}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-text">
                    {investor.title}
                  </p>

                  <p className="text-[11px] text-slate-text/80"
                     style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    📊 {investor.shares}
                  </p>

                  {/* Comment */}
                  <p className="text-xs text-charcoal/70 bg-ghost rounded-lg p-2 leading-relaxed">
                    💬 {investor.comment}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
