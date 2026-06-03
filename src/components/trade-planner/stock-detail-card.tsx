'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Building2, BarChart3, DollarSign, Activity, Layers,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import type { QuarterlyResult, FinancialOverview } from '@/types/calculator';

interface StockDetailCardProps {
  symbol: string;
  name: string;
  financials?: FinancialOverview;
  quarterlyResults?: QuarterlyResult[];
  isLoading?: boolean;
}

const SIGNAL_CONFIG = {
  bullish: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  bearish: { icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
  neutral: { icon: Minus, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
} as const;

import { useCurrency } from '@/context/currency-context';

export function StockDetailCard({
  symbol,
  name,
  financials,
  quarterlyResults,
  isLoading,
}: StockDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { formatCurrency } = useCurrency();

  if (isLoading) {
    return (
      <div className="glass-card-static p-6 animate-pulse space-y-3">
        <div className="h-4 bg-mist rounded w-1/3" />
        <div className="h-3 bg-mist rounded w-2/3" />
        <div className="h-16 bg-mist rounded" />
      </div>
    );
  }

  if (!financials) return null;

  const signal = SIGNAL_CONFIG[financials.overallSignal];
  const SignalIcon = signal.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card-static overflow-hidden"
    >
      {/* ═══ Header: ภาพรวมบริษัท ═══ */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-lavender" />
              <h3
                className="text-sm font-semibold text-charcoal"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                รายละเอียดหุ้น {symbol}
              </h3>
            </div>
            <p className="text-[11px] text-slate-text">{name}</p>
          </div>

          {/* Overall Signal Badge */}
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${signal.bg} ${signal.color} border ${signal.border}`}>
            <SignalIcon className="w-3.5 h-3.5" />
            {financials.overallSignalTh}
          </div>
        </div>

        <p className="text-xs text-slate-text leading-relaxed">
          {financials.description}
        </p>

        {/* ═══ Key Metrics Grid ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <MetricBox label="Market Cap" value={financials.marketCap} icon={<DollarSign className="w-3 h-3" />} />
          <MetricBox label="P/E Ratio" value={financials.peRatio.toFixed(1)} icon={<BarChart3 className="w-3 h-3" />} />
          <MetricBox label="Beta" value={financials.beta.toFixed(2)} icon={<Activity className="w-3 h-3" />} />
          <MetricBox label="Dividend" value={`${financials.dividendYield.toFixed(2)}%`} icon={<Layers className="w-3 h-3" />} />
        </div>

        {/* 52-Week Range Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-text">
            <span>52W Low: {formatCurrency(financials.low52w)}</span>
            <span>52W High: {formatCurrency(financials.high52w)}</span>
          </div>
          <div className="relative h-1.5 bg-mist rounded-full overflow-hidden">
            <div
              className="absolute h-full rounded-full bg-gradient-to-r from-rose-300 via-amber-300 to-emerald-300"
              style={{ width: '100%' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-text">
            <span>{financials.sector}</span>
            <span>{financials.industry}</span>
          </div>
        </div>
      </div>

      {/* ═══ Expand Button ═══ */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-lavender bg-mist/60 hover:bg-mist transition-colors cursor-pointer border-t border-slate-100"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            ซ่อนผลประกอบการรายไตรมาส
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            ดูผลประกอบการ 6 ไตรมาสล่าสุด
          </>
        )}
      </button>

      {/* ═══ Quarterly Results (Expandable) ═══ */}
      <AnimatePresence>
        {isExpanded && quarterlyResults && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-lavender" />
                <h4
                  className="text-sm font-semibold text-charcoal"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  ผลประกอบการรายไตรมาส
                </h4>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-5 gap-2 text-[10px] font-semibold text-slate-text uppercase tracking-wider px-2">
                <span>ไตรมาส</span>
                <span className="text-right">รายได้</span>
                <span className="text-right">Growth</span>
                <span className="text-right">EPS</span>
                <span className="text-right">Surprise</span>
              </div>

              {/* Table Rows */}
              {quarterlyResults.map((q, index) => (
                <motion.div
                  key={q.quarter}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-5 gap-2 items-center py-2 px-2 rounded-lg hover:bg-ghost/60 transition-colors text-xs"
                >
                  <span className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>
                    {q.quarter}
                  </span>
                  <span className="text-right text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>
                    ${(q.revenue / 1000).toFixed(1)}B
                  </span>
                  <span className={`text-right font-semibold flex items-center justify-end gap-0.5 ${q.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {q.revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {q.revenueGrowth >= 0 ? '+' : ''}{q.revenueGrowth.toFixed(1)}%
                  </span>
                  <span className="text-right text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>
                    ${q.eps.toFixed(2)}
                  </span>
                  <span className={`text-right font-semibold ${q.surprise >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {q.surprise >= 0 ? '+' : ''}{q.surprise.toFixed(1)}%
                  </span>
                </motion.div>
              ))}

              {/* Legend */}
              <p className="text-[10px] text-slate-text/60 pt-1">
                Growth = เปลี่ยนแปลง YoY · EPS = กำไรต่อหุ้น · Surprise = ผลจริง vs คาดการณ์
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Metric Box — ช่องตัวเลขเล็กๆ */
function MetricBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-ghost/80 rounded-xl p-2.5 space-y-1">
      <div className="flex items-center gap-1 text-[10px] text-slate-text">
        <span className="text-lavender">{icon}</span>
        {label}
      </div>
      <p
        className="text-sm font-bold text-charcoal"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </p>
    </div>
  );
}
