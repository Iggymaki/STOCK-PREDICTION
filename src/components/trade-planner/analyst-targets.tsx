'use client';

import { motion } from 'framer-motion';
import { RATING_CONFIG } from '@/lib/constants';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import type { AnalystTarget, AssetInsight } from '@/types/calculator';
import { useCurrency } from '@/context/currency-context';

interface AnalystTargetsProps {
  analysts: AnalystTarget[];
  currentPrice: number;
  consensusRatingTh: string;
  consensusRating: AssetInsight['consensusRating'];
  averageTarget: number;
  upsidePercent: number;
  aiTarget?: number;
}

export function AnalystTargets({
  analysts,
  currentPrice,
  consensusRatingTh,
  consensusRating,
  averageTarget,
  upsidePercent,
  aiTarget,
}: AnalystTargetsProps) {
  const { formatCurrency } = useCurrency();

  const ratingCfg = RATING_CONFIG[consensusRating] || RATING_CONFIG['hold'];
  const isUpside = upsidePercent > 0;

  if (!analysts || analysts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 h-full flex flex-col"
      >
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-lavender" />
          <h3
            className="text-base font-semibold text-charcoal"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            ราคาเป้าหมาย
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-mist/30 rounded-2xl border border-dashed border-slate-300">
          <Target className="w-8 h-8 text-slate-text/40" />
          <div>
            <p className="text-sm font-semibold text-charcoal">ไม่มีข้อมูลราคาเป้าหมายจากนักวิเคราะห์</p>
            {aiTarget ? (
              <p className="text-xs text-lavender font-medium mt-1">
                คุณสามารถใช้จุด Take Profit จาก AI: <strong className="text-charcoal font-bold">{formatCurrency(aiTarget)}</strong> แทนได้
              </p>
            ) : (
              <p className="text-xs text-slate-text mt-1">ยังไม่มีนักวิเคราะห์ประเมินราคาเป้าหมายสำหรับหุ้นตัวนี้</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-lavender" />
        <h3
          className="text-base font-semibold text-charcoal"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          ราคาเป้าหมาย
        </h3>
      </div>

      {/* Consensus Card */}
      <div className="glass-card-static p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-text font-medium">ความเห็นรวมนักวิเคราะห์</p>
            <div className="flex items-center gap-2">
              <span className={`text-base font-bold ${ratingCfg.color}`}>
                {consensusRatingTh}
              </span>
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-[11px] text-slate-text font-medium">ราคาเป้าหมายเฉลี่ย</p>
            <p className="text-lg font-bold text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(averageTarget)}
            </p>
          </div>
        </div>

        {/* Upside/Downside Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-text">ราคาปัจจุบัน {formatCurrency(currentPrice)}</span>
            <span className={`font-semibold flex items-center gap-1 ${isUpside ? 'text-emerald-600' : 'text-rose-500'}`}>
              {isUpside ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUpside ? '+' : ''}{upsidePercent.toFixed(1)}% {isUpside ? 'Upside' : 'Downside'}
            </span>
          </div>
          <div className="relative h-2.5 rounded-full bg-mist overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                background: isUpside
                  ? 'linear-gradient(to right, oklch(0.85 0.10 160), oklch(0.75 0.12 160))'
                  : 'linear-gradient(to right, oklch(0.85 0.10 15), oklch(0.75 0.12 15))',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.abs(upsidePercent), 100)}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Individual Analysts */}
      <div className="space-y-2">
        {analysts.map((analyst, index) => {
          const analystRating = RATING_CONFIG[analyst.rating] || RATING_CONFIG['hold'];
          const diff = ((analyst.targetPrice - currentPrice) / currentPrice * 100).toFixed(1);
          const isPositive = analyst.targetPrice > currentPrice;

          return (
            <motion.div
              key={analyst.firm}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.06 }}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-ghost/80 transition-colors duration-200"
            >
              <div>
                <p className="text-xs font-bold text-charcoal">{analyst.firm}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-semibold ${analystRating.color}`}>
                    {analystRating.emoji} {analyst.ratingTh}
                  </span>
                  <span className="text-[9px] text-slate-text/70">• {analyst.date}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(analyst.targetPrice)}
                </p>
                <p className={`text-[10px] font-semibold mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {isPositive ? '+' : ''}{diff}%
                </p>
              </div>
            </motion.div>
          );
        })}

        {aiTarget && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-lavender/5 border border-lavender/20 mt-2"
          >
            <div>
              <p className="text-xs font-bold text-lavender flex items-center gap-1">
                ✨ AlphaCore AI
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold text-lavender-dark">
                  เป้าหมายทำกำไร (TP)
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(aiTarget)}
              </p>
              <p className={`text-[10px] font-semibold mt-0.5 ${aiTarget > currentPrice ? 'text-emerald-600' : 'text-rose-500'}`}>
                {aiTarget > currentPrice ? '+' : ''}{(((aiTarget - currentPrice) / currentPrice) * 100).toFixed(1)}%
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
