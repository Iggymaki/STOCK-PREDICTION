'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, ShieldCheck, TrendingUp, TrendingDown, ArrowRight,
  Zap, AlertTriangle, ChevronDown, ChevronUp, Sparkles,
  Crosshair, Clock, BarChart3, Brain,
} from 'lucide-react';
import type { AIEntryAnalysis } from '@/types/calculator';
import { useCurrency } from '@/context/currency-context';

interface AIEntryCardProps {
  analysis: AIEntryAnalysis | null;
  currentPrice: number;
  symbol: string;
  isLoading: boolean;
  onApplyToCalculator: (entry: number, sl: number, tp: number) => void;
}

const SIGNAL_CONFIG = {
  strong_buy: { emoji: '🚀', label: 'ซื้อเลย!', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', glow: 'shadow-emerald-200/40' },
  buy: { emoji: '📈', label: 'น่าซื้อ', color: 'text-emerald-500', bg: 'bg-emerald-50/70', border: 'border-emerald-200', glow: 'shadow-emerald-200/30' },
  wait: { emoji: '✋', label: 'รอจังหวะ', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', glow: 'shadow-amber-200/30' },
  sell: { emoji: '📉', label: 'ขาย / หลีกเลี่ยง', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', glow: 'shadow-rose-200/30' },
} as const;

const CONFIDENCE_CONFIG = {
  high: { emoji: '🟢', label: 'สูง', color: 'text-emerald-600', bg: 'bg-emerald-100', width: 'w-full' },
  medium: { emoji: '🟡', label: 'ปานกลาง', color: 'text-amber-600', bg: 'bg-amber-100', width: 'w-2/3' },
  low: { emoji: '🔴', label: 'ต่ำ', color: 'text-rose-500', bg: 'bg-rose-100', width: 'w-1/3' },
} as const;

export function AIEntryCard({
  analysis,
  currentPrice,
  symbol,
  isLoading,
  onApplyToCalculator,
}: AIEntryCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { formatCurrency } = useCurrency();

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-static p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lavender to-sky flex items-center justify-center">
            <Brain className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
              AI กำลังวิเคราะห์ {symbol}...
            </h3>
            <p className="text-xs text-slate-text">กำลังประมวลผลข้อมูลราคา ข่าว และ Technical indicators</p>
          </div>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-mist rounded-2xl" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-mist rounded-xl" />
            <div className="h-16 bg-mist rounded-xl" />
            <div className="h-16 bg-mist rounded-xl" />
          </div>
          <div className="h-12 bg-mist rounded-xl" />
        </div>
      </motion.div>
    );
  }

  if (!analysis) return null;

  const signalCfg = SIGNAL_CONFIG[analysis.signal];
  const confCfg = CONFIDENCE_CONFIG[analysis.confidence];
  
  // คำนวณ % อย่างปลอดภัย — ป้องกัน Infinity / NaN เมื่อ price = 0
  const safePercent = (a: number, b: number) => {
    if (!b || b <= 0 || !a) return '0.0';
    return ((a - b) / b * 100).toFixed(1);
  };
  const entryDiff = safePercent(analysis.entryPrice, currentPrice);
  const slDiff = safePercent(analysis.stopLoss, currentPrice);
  const tpDiff = safePercent(analysis.takeProfit, currentPrice);

  // ถ้าราคาไม่พร้อม แสดงข้อความเตือน
  const priceUnavailable = currentPrice <= 0 || analysis.entryPrice <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card-static overflow-hidden shadow-lg ${signalCfg.glow}`}
    >
      {/* ═══ Header — Signal Badge ═══ */}
      <div className="bg-gradient-to-r from-lavender/10 via-sky/5 to-transparent p-5 border-b border-white/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lavender to-sky flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal flex items-center gap-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                AI แนะนำจุดเข้าซื้อ
              </h3>
              <p className="text-[11px] text-slate-text">
                วิเคราะห์โดย Llama 3.3 · {analysis.timeframe}
              </p>
            </div>
          </div>

          {/* Signal Badge */}
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${signalCfg.bg} ${signalCfg.color} border ${signalCfg.border}`}>
            {signalCfg.emoji} {signalCfg.label}
          </span>
        </div>
      </div>

      {priceUnavailable && (
        <div className="mx-5 mt-5 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            ไม่สามารถดึงราคาปัจจุบันจากตลาดได้ ระบบจึงแสดงการประเมินเบื้องต้นเท่านั้น
          </p>
        </div>
      )}

      <div className="p-5 space-y-5">
        {/* ═══ Main: 3 Price Points ═══ */}
        <div className="grid grid-cols-3 gap-3">
          {/* Entry */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-b from-lavender/10 to-transparent rounded-2xl p-3.5 text-center border border-lavender/20"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Crosshair className="w-3 h-3 text-lavender" />
              <span className="text-[10px] font-semibold text-slate-text uppercase tracking-wider">จุดเข้า</span>
            </div>
            <p className="text-xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(analysis.entryPrice)}
            </p>
            <p className={`text-[10px] font-semibold mt-0.5 ${Number(entryDiff) <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {Number(entryDiff) <= 0 ? '↓' : '↑'} {Math.abs(Number(entryDiff))}% จากราคาปัจจุบัน
            </p>
          </motion.div>

          {/* Stop Loss */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-b from-rose-50 to-transparent rounded-2xl p-3.5 text-center border border-rose-100"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              <span className="text-[10px] font-semibold text-slate-text uppercase tracking-wider">Stop Loss</span>
            </div>
            <p className="text-xl font-bold text-rose-500" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(analysis.stopLoss)}
            </p>
            <p className="text-[10px] font-semibold text-rose-400 mt-0.5">
              ↓ {slDiff}% จากราคาปัจจุบัน
            </p>
          </motion.div>

          {/* Take Profit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-b from-emerald-50 to-transparent rounded-2xl p-3.5 text-center border border-emerald-100"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-semibold text-slate-text uppercase tracking-wider">Take Profit</span>
            </div>
            <p className="text-xl font-bold text-emerald-600" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(analysis.takeProfit)}
            </p>
            <p className="text-[10px] font-semibold text-emerald-500 mt-0.5">
              ↑ {tpDiff}% จากราคาปัจจุบัน
            </p>
          </motion.div>
        </div>

        {/* ═══ Risk:Reward + Confidence ═══ */}
        <div className="grid grid-cols-2 gap-3">
          {/* R:R */}
          <div className="bg-ghost/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-lavender/20 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-lavender" />
            </div>
            <div>
              <p className="text-[10px] text-slate-text font-medium">Risk : Reward</p>
              <p className={`text-lg font-bold ${analysis.riskReward >= 2 ? 'text-emerald-600' : analysis.riskReward >= 1 ? 'text-amber-600' : 'text-rose-500'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                1 : {analysis.riskReward.toFixed(1)}
              </p>
              <p className="text-[9px] text-slate-text">
                {analysis.riskReward >= 2 ? '✨ คุ้มค่ามาก' : analysis.riskReward >= 1 ? '👍 พอใช้ได้' : '⚠️ ต่ำไป'}
              </p>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-ghost/80 rounded-xl p-3">
            <p className="text-[10px] text-slate-text font-medium mb-1.5">ความมั่นใจ AI</p>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-bold ${confCfg.color}`}>
                {confCfg.emoji} {confCfg.label}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-mist overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: analysis.confidence === 'high' ? '100%' : analysis.confidence === 'medium' ? '66%' : '33%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${analysis.confidence === 'high' ? 'bg-emerald-400' : analysis.confidence === 'medium' ? 'bg-amber-400' : 'bg-rose-400'}`}
              />
            </div>
            <p className="text-[9px] text-slate-text mt-1">{analysis.confidenceTh}</p>
          </div>
        </div>

        {/* ═══ AI Signal Explanation ═══ */}
        <div className={`rounded-xl p-4 border ${signalCfg.bg} ${signalCfg.border}`}>
          <div className="flex items-start gap-2">
            <Brain className={`w-4 h-4 ${signalCfg.color} shrink-0 mt-0.5`} />
            <div>
              <p className={`text-xs font-bold ${signalCfg.color}`}>{analysis.signalTh}</p>
              <p className="text-xs text-charcoal/80 leading-relaxed mt-1">{analysis.reasoning}</p>
            </div>
          </div>
        </div>

        {/* ═══ Key Factors ═══ */}
        <div className="flex flex-wrap gap-1.5">
          {analysis.keyFactors.map((factor, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium text-slate-text bg-mist px-2.5 py-1 rounded-full flex items-center gap-1"
            >
              <Zap className="w-2.5 h-2.5 text-lavender" />
              {factor}
            </span>
          ))}
        </div>

        {/* ═══ Technical Levels (Expandable) ═══ */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-lavender hover:bg-mist/50 rounded-lg transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showDetails ? 'ซ่อนแนว Support/Resistance' : 'ดูแนว Support/Resistance'}
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3">
                {/* Support */}
                <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> แนวรับ (Support)
                  </p>
                  <div className="space-y-1.5">
                    {analysis.technicalLevels.support.map((level, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-text">S{idx + 1}</span>
                        <span className="text-xs font-bold text-emerald-600" style={{ fontFamily: 'var(--font-mono)' }}>
                          {formatCurrency(level)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resistance */}
                <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100">
                  <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> แนวต้าน (Resistance)
                  </p>
                  <div className="space-y-1.5">
                    {analysis.technicalLevels.resistance.map((level, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-text">R{idx + 1}</span>
                        <span className="text-xs font-bold text-rose-500" style={{ fontFamily: 'var(--font-mono)' }}>
                          {formatCurrency(level)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeframe */}
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-text bg-ghost rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5 text-lavender" />
                <span>กรอบเวลาที่แนะนำ: <strong className="text-charcoal">{analysis.timeframe}</strong></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ CTA: Apply to Calculator ═══ */}
        <motion.button
          type="button"
          onClick={() => onApplyToCalculator(analysis.entryPrice, analysis.stopLoss, analysis.takeProfit)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold cursor-pointer"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          🧮 ใช้จุดนี้ไปคำนวณไม้ <ArrowRight className="w-4 h-4" />
        </motion.button>

        {/* Disclaimer */}
        <div className="flex items-start gap-1.5 px-1">
          <AlertTriangle className="w-3 h-3 text-slate-text/40 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-text/50 leading-relaxed">
            ผลวิเคราะห์จาก AI เป็นเพียงข้อมูลประกอบการตัดสินใจ ไม่ใช่คำแนะนำการลงทุน
          </p>
        </div>
      </div>
    </motion.div>
  );
}
