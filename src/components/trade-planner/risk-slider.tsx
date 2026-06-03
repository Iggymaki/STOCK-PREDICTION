'use client';

import { motion } from 'framer-motion';
import { RISK_LEVELS } from '@/lib/constants';
import type { RiskLevel } from '@/types/calculator';

interface RiskSliderProps {
  value: number;              // current risk %
  onChange: (percent: number) => void;
}

/**
 * ★ Risk Slider — Antigravity 3-level slider
 * แถบสไลเดอร์เลือกระดับความสบายใจ
 * Track ไล่สีจาก mint (เซฟ) → peach (ปานกลาง) → rose (เสี่ยง)
 */
export function RiskSlider({ value, onChange }: RiskSliderProps) {
  const activeLevel = RISK_LEVELS.reduce((closest, level) =>
    Math.abs(level.percent - value) < Math.abs(closest.percent - value) ? level : closest
  , RISK_LEVELS[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <label
          className="text-sm font-semibold text-charcoal"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          ระดับความสบายใจ
        </label>
        <motion.span
          key={activeLevel.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`
            text-xs font-semibold px-3 py-1 rounded-full
            ${activeLevel.bgColor} ${activeLevel.color}
          `}
        >
          {activeLevel.emoji} {activeLevel.label} ({activeLevel.percent}%)
        </motion.span>
      </div>

      {/* Slider Track */}
      <div className="relative pt-2 pb-1">
        <div className="relative h-3 rounded-full slider-track-gradient overflow-hidden">
          {/* Fill */}
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              background: 'rgba(255,255,255,0.45)',
              backdropFilter: 'blur(4px)',
            }}
            animate={{ width: `${((value - 1) / 4) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>

        {/* Range Input (invisible, on top) */}
        <input
          type="range"
          min={1}
          max={5}
          step={0.5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute top-2 left-0 w-full h-3 opacity-0 cursor-pointer z-10"
          aria-label="ระดับความเสี่ยง"
        />

        {/* Thumb Indicator */}
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white border-2 border-lavender shadow-float-lg pointer-events-none"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(140,120,200,0.3))' }}
          animate={{
            left: `calc(${((value - 1) / 4) * 100}% - 10px)`,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />
      </div>

      {/* Level Labels */}
      <div className="flex justify-between px-0.5">
        {RISK_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() => onChange(level.percent)}
            className={`
              flex flex-col items-center gap-1 px-3 py-2 rounded-xl
              transition-all duration-300 cursor-pointer
              ${activeLevel.id === level.id
                ? `${level.bgColor} scale-105`
                : 'hover:bg-white/50 opacity-60 hover:opacity-100'
              }
            `}
          >
            <span className="text-lg">{level.emoji}</span>
            <span className={`text-xs font-semibold ${activeLevel.id === level.id ? level.color : 'text-slate-text'}`}>
              {level.label}
            </span>
            <span className="text-[10px] text-slate-text leading-tight text-center">
              {level.description}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
