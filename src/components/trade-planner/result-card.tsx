'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber, formatRatio, formatPercent } from '@/lib/formatters';
import { RISK_LEVELS } from '@/lib/constants';
import type { CalculatorResult } from '@/types/calculator';
import { useCurrency } from '@/context/currency-context';

interface ResultCardProps {
  result: CalculatorResult;
  riskPercent: number;
  entryPrice: number;
}

/** AnimatedNumber — ตัวเลขนับขึ้น/ลง แบบลื่นไหล */
function AnimatedValue({ value, prefix = '', suffix = '' }: { value: string; prefix?: string; suffix?: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="inline-block"
      >
        {prefix}{value}{suffix}
      </motion.span>
    </AnimatePresence>
  );
}

/**
 * ★ Result Card — Glassmorphism dynamic card
 * Sticky ฝั่งขวา, อัปเดต real-time, เปลี่ยน glow ตาม risk level
 */
export function ResultCard({
  result,
  riskPercent,
  entryPrice,
}: ResultCardProps) {
  const { formatCurrency, currency } = useCurrency();
  // หา active risk level สำหรับ glow color
  const activeLevel = RISK_LEVELS.reduce((closest, level) =>
    Math.abs(level.percent - riskPercent) < Math.abs(closest.percent - riskPercent) ? level : closest
  , RISK_LEVELS[0]);

  const isValid = result.isValid;

  // กำหนด glow style ตาม risk level
  const glowStyles: Record<string, string> = {
    safe: '0 0 40px oklch(0.85 0.10 160 / 0.20), 0 8px 32px oklch(0.70 0.05 280 / 0.08)',
    moderate: '0 0 40px oklch(0.88 0.10 80 / 0.20), 0 8px 32px oklch(0.70 0.05 280 / 0.08)',
    risky: '0 0 40px oklch(0.85 0.10 15 / 0.25), 0 8px 32px oklch(0.70 0.05 280 / 0.08)',
  };

  return (
    <motion.div
      layout
      className="glass-card-static p-6 space-y-5"
      style={{
        boxShadow: isValid ? glowStyles[activeLevel.id] : 'var(--shadow-float)',
      }}
      animate={{
        boxShadow: isValid ? glowStyles[activeLevel.id] : 'var(--shadow-float)',
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-base font-semibold text-charcoal"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          📊 ผลคำนวณ
        </h3>
        {isValid && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5"
          >
            <div className="live-dot" />
            <span className="text-[11px] font-medium text-slate-text">LIVE</span>
          </motion.div>
        )}
      </div>

      {/* Main Result — Position Size */}
      <AnimatePresence mode="wait">
        {isValid ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-4 space-y-1"
          >
            <p className="text-xs text-slate-text font-medium">จำนวนที่ควรซื้อ</p>
            <div
              className="text-4xl font-bold text-charcoal tracking-tight"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <AnimatedValue value={formatNumber(result.positionSize)} />
            </div>
            <p className="text-sm text-slate-text">หุ้น / เหรียญ</p>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-3xl mb-2">🧮</p>
            <p className="text-sm text-slate-text">
              {result.validationError || 'กรอกข้อมูลเพื่อเริ่มคำนวณ'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Grid */}
      {isValid && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          <DetailItem
            label="ต้นทุนรวม"
            value={formatCurrency(result.totalCost)}
            sublabel={currency === 'THB' ? `$${result.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : ''}
            color="text-sky"
          />
          <DetailItem
            label="ขาดทุนสูงสุด"
            value={formatCurrency(result.maxLoss)}
            sublabel={`(${formatPercent(riskPercent)} ของเงินทุน)`}
            color="text-rose"
          />
          <DetailItem
            label="กำไรสูงสุด"
            value={formatCurrency(result.maxProfit)}
            sublabel={currency === 'THB' ? `$${result.maxProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : ''}
            color="text-mint"
          />
          <DetailItem
            label="R:R Ratio"
            value={formatRatio(result.riskRewardRatio)}
            sublabel={
              result.riskRewardRatio >= 2 ? '✨ คุ้มค่ามาก' :
              result.riskRewardRatio >= 1 ? '👍 พอใช้ได้' : '⚠️ ต่ำไป'
            }
            color="text-lavender"
          />
        </motion.div>
      )}

      {/* Capital Usage Bar */}
      {isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-xs">
            <span className="text-slate-text font-medium">ใช้เงินทุน</span>
            <span
              className="font-semibold text-charcoal"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <AnimatedValue value={formatPercent(result.capitalUsagePercent)} />
            </span>
          </div>
          <div className="h-2 rounded-full bg-mist overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(to right, oklch(0.85 0.10 280), oklch(0.78 0.12 230))',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(result.capitalUsagePercent, 100)}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
          {result.capitalUsagePercent > 80 && (
            <p className="text-[11px] text-rose font-medium">
              ⚠️ ใช้เงินทุนมากกว่า 80% — พิจารณาลดขนาดไม้
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/** Sub-component: Detail Item ในตาราง 2×2 */
function DetailItem({
  label,
  value,
  sublabel,
  color,
}: {
  label: string;
  value: string;
  sublabel: string;
  color: string;
}) {
  return (
    <div className="bg-ghost rounded-xl p-3 space-y-1">
      <p className="text-[11px] text-slate-text font-medium">{label}</p>
      <p
        className={`text-base font-bold ${color}`}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <AnimatedValue value={value} />
      </p>
      <p className="text-[10px] text-slate-text">{sublabel}</p>
    </div>
  );
}
