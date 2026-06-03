'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ThaiSummaryProps {
  summary: string;
  isValid: boolean;
}

/**
 * ★ Thai Summary Card
 * แสดงผลลัพธ์เป็นประโยคภาษาไทยแบบเพื่อนคุยกัน
 * มี typing-like animation เมื่อข้อความเปลี่ยน
 */
export function ThaiSummary({ summary, isValid }: ThaiSummaryProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={summary}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`
          glass-card-static p-5
          ${isValid
            ? 'bg-gradient-to-br from-lavender-light/40 to-mint-light/30'
            : 'bg-ghost'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{isValid ? '💬' : '🤖'}</span>
          <span
            className="text-xs font-semibold text-slate-text uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            AI สรุปให้
          </span>
        </div>

        {/* Summary Text */}
        <p
          className={`
            text-sm leading-relaxed
            ${isValid ? 'text-charcoal' : 'text-slate-text'}
          `}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {summary}
        </p>

        {/* Decoration */}
        {isValid && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-4 h-0.5 rounded-full origin-left"
            style={{
              background: 'linear-gradient(to right, oklch(0.85 0.10 280 / 0.3), transparent)',
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
