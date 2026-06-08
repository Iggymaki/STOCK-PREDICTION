'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Factory, BarChart3, TrendingUp, TrendingDown,
  Target, ShieldCheck, ArrowRight, ChevronDown, ChevronUp,
  Zap, AlertTriangle, Sparkles, Brain, Clock, Crosshair,
  Shield, Flame, Activity, Minus
} from 'lucide-react';
import type { TopDownAnalysis } from '@/types/calculator';
import { useCurrency } from '@/context/currency-context';

interface TopDownAnalysisCardProps {
  analysis: TopDownAnalysis | null;
  currentPrice: number;
  symbol: string;
  isLoading: boolean;
}

/* ═══ Outlook badge config ═══ */
const OUTLOOK_CONFIG = {
  bullish: { emoji: '🟢', label: 'เชิงบวก', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  bearish: { emoji: '🔴', label: 'เชิงลบ', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
  neutral: { emoji: '🟡', label: 'ทรงตัว', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
} as const;

const SIGNAL_CONFIG = {
  strong_buy: { emoji: '🚀', label: 'ซื้อเลย!', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  buy: { emoji: '📈', label: 'น่าซื้อ', color: 'text-emerald-500', bg: 'bg-emerald-50/70', border: 'border-emerald-200' },
  wait: { emoji: '✋', label: 'รอจังหวะ', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  sell: { emoji: '📉', label: 'ขาย / หลีกเลี่ยง', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
} as const;

const RISK_CONFIG = {
  low: { label: 'ต่ำ', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  medium: { label: 'ปานกลาง', color: 'text-amber-600', bg: 'bg-amber-100' },
  high: { label: 'สูง', color: 'text-rose-500', bg: 'bg-rose-100' },
} as const;

export function TopDownAnalysisCard({
  analysis,
  currentPrice,
  symbol,
  isLoading,
}: TopDownAnalysisCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('macro');
  const { formatCurrency } = useCurrency();

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // ═══ Loading State ═══
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Loading Summary Box */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-teal-50/30 border border-emerald-200/50 shadow-float">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
                AI กำลังวิเคราะห์ Top-Down {symbol}...
              </h3>
              <p className="text-xs text-slate-text">กำลังวิเคราะห์ เศรษฐกิจ → อุตสาหกรรม → รายหุ้น → กราฟ</p>
            </div>
          </div>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-emerald-100 rounded w-full" />
            <div className="h-4 bg-emerald-100 rounded w-3/4" />
            <div className="h-4 bg-emerald-100 rounded w-5/6" />
          </div>
        </div>

        {/* Loading Sections */}
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card-static p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-mist" />
                <div className="h-5 bg-mist rounded w-40" />
              </div>
              <div className="h-16 bg-mist rounded-xl" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (!analysis) return null;

  const signalCfg = SIGNAL_CONFIG[analysis.overallSignal];
  const macroOutlook = OUTLOOK_CONFIG[analysis.macroEconomy.outlook];
  const industryOutlook = OUTLOOK_CONFIG[analysis.industry.outlook];
  const riskCfg = RISK_CONFIG[analysis.macroEconomy.riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* ════════════════════════════════════════════════════
          ═══ 1. EXECUTIVE SUMMARY — กรอบสีเขียว ═══
          ════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{ boxShadow: '0 8px 32px oklch(0.70 0.12 160 / 0.15)' }}
      >
        {/* Green gradient header */}
        <div className="bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  สรุปวิเคราะห์ Top-Down · {analysis.symbol}
                </h3>
                <p className="text-[11px] text-white/70">
                  วิเคราะห์โดย Atlas Top-Down Engine · Llama 3.3
                </p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white border border-white/30`}>
              {signalCfg.emoji} {signalCfg.label}
            </span>
          </div>
        </div>

        {/* Summary content */}
        <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-teal-50/30 p-5 border border-t-0 border-emerald-200/50">
          <p className="text-sm text-charcoal leading-relaxed mb-4">
            {analysis.executiveSummary}
          </p>

          {/* Confidence bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-text whitespace-nowrap">ความมั่นใจ</span>
            <div className="flex-1 h-2.5 rounded-full bg-emerald-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysis.overallConfidence}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
              />
            </div>
            <span className="text-sm font-bold text-emerald-600" style={{ fontFamily: 'var(--font-mono)' }}>
              {analysis.overallConfidence}%
            </span>
          </div>

          {/* Mini overview badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <OutlookMiniPill icon={<Globe className="w-3 h-3" />} label="เศรษฐกิจ" outlook={analysis.macroEconomy.outlook} />
            <OutlookMiniPill icon={<Factory className="w-3 h-3" />} label="อุตสาหกรรม" outlook={analysis.industry.outlook} />
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-lavender/10 text-lavender border border-lavender/20 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              คะแนนพื้นฐาน: {analysis.stockAnalysis.fundamentalScore}/10
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-sky/20 text-sky border border-sky/30 flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)' }}>
              <Target className="w-3 h-3" />
              R:R {analysis.technicalEntry.riskReward}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════
          ═══ 2. ภาคเศรษฐกิจ ═══
          ════════════════════════════════════════════════════ */}
      <SectionAccordion
        id="macro"
        isExpanded={expandedSection === 'macro'}
        onToggle={() => toggleSection('macro')}
        icon={<Globe className="w-4 h-4" />}
        iconBg="bg-gradient-to-br from-blue-400 to-indigo-500"
        title="ภาคเศรษฐกิจ (Macro Economy)"
        subtitle={analysis.macroEconomy.outlookTh}
        outlook={analysis.macroEconomy.outlook}
        delay={0.15}
      >
        <div className="space-y-4">
          {/* Analysis paragraph */}
          <p className="text-sm text-charcoal/80 leading-relaxed">
            {analysis.macroEconomy.analysis}
          </p>

          {/* Key macro indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MacroIndicator
              icon={<Activity className="w-3.5 h-3.5 text-blue-500" />}
              label="นโยบาย Fed"
              value={analysis.macroEconomy.fedPolicy}
            />
            <MacroIndicator
              icon={<Flame className="w-3.5 h-3.5 text-orange-500" />}
              label="เงินเฟ้อ"
              value={analysis.macroEconomy.inflationTrend}
            />
            <MacroIndicator
              icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
              label="แนวโน้ม GDP"
              value={analysis.macroEconomy.gdpOutlook}
            />
          </div>

          {/* Key factors tags */}
          <div>
            <p className="text-[10px] font-semibold text-slate-text uppercase tracking-wider mb-2">ปัจจัยสำคัญ</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.macroEconomy.keyFactors.map((factor, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium text-charcoal/70 bg-mist px-2.5 py-1 rounded-full flex items-center gap-1"
                >
                  <Zap className="w-2.5 h-2.5 text-blue-400" />
                  {factor}
                </span>
              ))}
            </div>
          </div>

          {/* Risk level */}
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-text" />
            <span className="text-[11px] text-slate-text">ระดับความเสี่ยงเศรษฐกิจ:</span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${riskCfg.bg} ${riskCfg.color}`}>
              {riskCfg.label}
            </span>
          </div>
        </div>
      </SectionAccordion>

      {/* ════════════════════════════════════════════════════
          ═══ 3. อุตสาหกรรม ═══
          ════════════════════════════════════════════════════ */}
      <SectionAccordion
        id="industry"
        isExpanded={expandedSection === 'industry'}
        onToggle={() => toggleSection('industry')}
        icon={<Factory className="w-4 h-4" />}
        iconBg="bg-gradient-to-br from-violet-400 to-purple-500"
        title={`อุตสาหกรรม — ${analysis.industry.nameTh}`}
        subtitle={analysis.industry.outlookTh}
        outlook={analysis.industry.outlook}
        delay={0.2}
      >
        <div className="space-y-4">
          <p className="text-sm text-charcoal/80 leading-relaxed">
            {analysis.industry.analysis}
          </p>

          {/* Growth Drivers vs Risks — 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> ตัวขับเคลื่อนการเติบโต
              </p>
              <ul className="space-y-1.5">
                {analysis.industry.growthDrivers.map((driver, idx) => (
                  <li key={idx} className="text-xs text-charcoal/70 flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">✦</span> {driver}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-rose-50/50 rounded-xl p-3.5 border border-rose-100">
              <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> ความเสี่ยง
              </p>
              <ul className="space-y-1.5">
                {analysis.industry.risks.map((risk, idx) => (
                  <li key={idx} className="text-xs text-charcoal/70 flex items-start gap-1.5">
                    <span className="text-rose-400 mt-0.5">⚠</span> {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Competitor & Sector Rotation */}
          <div className="space-y-2">
            <div className="bg-ghost rounded-lg px-3 py-2">
              <p className="text-[10px] font-semibold text-slate-text uppercase tracking-wider mb-1">เปรียบเทียบคู่แข่ง</p>
              <p className="text-xs text-charcoal/70">{analysis.industry.competitorComparison}</p>
            </div>
            <div className="bg-ghost rounded-lg px-3 py-2">
              <p className="text-[10px] font-semibold text-slate-text uppercase tracking-wider mb-1">Sector Rotation</p>
              <p className="text-xs text-charcoal/70">{analysis.industry.sectorRotation}</p>
            </div>
          </div>
        </div>
      </SectionAccordion>

      {/* ════════════════════════════════════════════════════
          ═══ 4. รายหุ้น ═══
          ════════════════════════════════════════════════════ */}
      <SectionAccordion
        id="stock"
        isExpanded={expandedSection === 'stock'}
        onToggle={() => toggleSection('stock')}
        icon={<BarChart3 className="w-4 h-4" />}
        iconBg="bg-gradient-to-br from-amber-400 to-orange-500"
        title={`รายหุ้น — ${analysis.symbol}`}
        subtitle={analysis.stockAnalysis.valuationAssessment}
        scoreValue={analysis.stockAnalysis.fundamentalScore}
        delay={0.25}
      >
        <div className="space-y-4">
          {/* Fundamental score gauge */}
          <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/30 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-text uppercase tracking-wider">คะแนนปัจจัยพื้นฐาน</span>
              <span className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'var(--font-mono)' }}>
                {analysis.stockAnalysis.fundamentalScore}<span className="text-sm text-slate-text font-normal">/10</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-amber-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysis.stockAnalysis.fundamentalScore * 10}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className={`h-full rounded-full ${
                  analysis.stockAnalysis.fundamentalScore >= 7 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                  analysis.stockAnalysis.fundamentalScore >= 4 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                  'bg-gradient-to-r from-rose-400 to-rose-500'
                }`}
              />
            </div>
          </div>

          <p className="text-sm text-charcoal/80 leading-relaxed">
            {analysis.stockAnalysis.fundamentalSummary}
          </p>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-ghost rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-slate-text uppercase tracking-wider mb-1">ประเมินมูลค่า</p>
              <p className="text-xs text-charcoal/80">{analysis.stockAnalysis.valuationAssessment}</p>
            </div>
            <div className="bg-ghost rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-slate-text uppercase tracking-wider mb-1">แนวโน้มกำไร</p>
              <p className="text-xs text-charcoal/80">{analysis.stockAnalysis.earningsOutlook}</p>
            </div>
          </div>

          <div className="bg-ghost rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-semibold text-slate-text uppercase tracking-wider mb-1">ความได้เปรียบทางการแข่งขัน (Economic Moat)</p>
            <p className="text-xs text-charcoal/80">{analysis.stockAnalysis.competitiveAdvantage}</p>
          </div>

          {/* Catalysts & Risks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.stockAnalysis.catalysts.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> ตัวเร่ง (Catalysts)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.stockAnalysis.catalysts.map((c, idx) => (
                    <span key={idx} className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analysis.stockAnalysis.risks.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> ความเสี่ยง
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.stockAnalysis.risks.map((r, idx) => (
                    <span key={idx} className="text-[10px] font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionAccordion>

      {/* ════════════════════════════════════════════════════
          ═══ 5. จุดเข้าซื้อทางเทคนิค ═══
          ════════════════════════════════════════════════════ */}
      <SectionAccordion
        id="technical"
        isExpanded={expandedSection === 'technical'}
        onToggle={() => toggleSection('technical')}
        icon={<Crosshair className="w-4 h-4" />}
        iconBg="bg-gradient-to-br from-sky to-blue-500"
        title="จุดเข้าซื้อจากกราฟ (Technical Entry)"
        subtitle={analysis.technicalEntry.chartPattern}
        delay={0.3}
      >
        <div className="space-y-4">
          {/* 4 Price Points Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PriceBox
              label="จุดเข้า"
              price={analysis.technicalEntry.entryPrice}
              icon={<Crosshair className="w-3 h-3 text-lavender" />}
              bgColor="bg-gradient-to-b from-lavender/10 to-transparent"
              borderColor="border-lavender/20"
              textColor="text-charcoal"
              formatCurrency={formatCurrency}
            />
            <PriceBox
              label="Stop Loss"
              price={analysis.technicalEntry.stopLoss}
              icon={<ShieldCheck className="w-3 h-3 text-rose-400" />}
              bgColor="bg-gradient-to-b from-rose-50 to-transparent"
              borderColor="border-rose-100"
              textColor="text-rose-500"
              formatCurrency={formatCurrency}
            />
            <PriceBox
              label="Take Profit 1"
              price={analysis.technicalEntry.takeProfit1}
              icon={<Target className="w-3 h-3 text-emerald-400" />}
              bgColor="bg-gradient-to-b from-emerald-50 to-transparent"
              borderColor="border-emerald-100"
              textColor="text-emerald-600"
              formatCurrency={formatCurrency}
            />
            <PriceBox
              label="Take Profit 2"
              price={analysis.technicalEntry.takeProfit2}
              icon={<Target className="w-3 h-3 text-teal-400" />}
              bgColor="bg-gradient-to-b from-teal-50 to-transparent"
              borderColor="border-teal-100"
              textColor="text-teal-600"
              formatCurrency={formatCurrency}
            />
          </div>

          {/* R:R and Timeframe */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-ghost rounded-lg px-3 py-2 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-lavender" />
              <span className="text-[11px] text-slate-text">Risk:Reward</span>
              <span className="text-sm font-bold text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>
                {analysis.technicalEntry.riskReward}
              </span>
            </div>
            <div className="bg-ghost rounded-lg px-3 py-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-lavender" />
              <span className="text-[11px] text-slate-text">กรอบเวลา:</span>
              <span className="text-xs font-semibold text-charcoal">{analysis.technicalEntry.timeHorizon}</span>
            </div>
          </div>

          {/* Entry reasoning */}
          <div className="bg-lavender/5 rounded-xl p-4 border border-lavender/15">
            <p className="text-[10px] font-semibold text-lavender uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Brain className="w-3 h-3" /> เหตุผลจุดเข้า
            </p>
            <p className="text-xs text-charcoal/80 leading-relaxed">{analysis.technicalEntry.entryReasoning}</p>
          </div>

          {/* Chart Pattern & Key Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-ghost rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-slate-text uppercase tracking-wider mb-1">รูปแบบกราฟ</p>
              <p className="text-xs text-charcoal/80 font-medium">{analysis.technicalEntry.chartPattern}</p>
            </div>
            <div className="bg-ghost rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-slate-text uppercase tracking-wider mb-1.5">สัญญาณ Indicator</p>
              <div className="flex flex-wrap gap-1">
                {analysis.technicalEntry.keyIndicators.map((ind, idx) => (
                  <span key={idx} className="text-[9px] font-medium text-sky bg-sky/10 px-2 py-0.5 rounded-full">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Invalidation Warning */}
          <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">⚠ เงื่อนไข Invalidation</p>
              <p className="text-xs text-amber-700/80 leading-relaxed">{analysis.technicalEntry.invalidation}</p>
            </div>
          </div>
        </div>
      </SectionAccordion>



      {/* Disclaimer */}
      <div className="flex items-start gap-1.5 px-1">
        <AlertTriangle className="w-3 h-3 text-slate-text/40 shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-text/50 leading-relaxed">
          ผลวิเคราะห์จาก AI (Llama 3.3) เป็นเพียงข้อมูลประกอบการตัดสินใจ ไม่ใช่คำแนะนำการลงทุน
          การวิเคราะห์ Top-Down ใช้ข้อมูลจาก Yahoo Finance ณ เวลาที่วิเคราะห์
        </p>
      </div>
    </motion.div>
  );
}


// ═══════════════════════════════════════════════
//  Sub-Components
// ═══════════════════════════════════════════════

/** Mini outlook pill for executive summary */
function OutlookMiniPill({ icon, label, outlook }: { icon: React.ReactNode; label: string; outlook: 'bullish' | 'bearish' | 'neutral' }) {
  const cfg = OUTLOOK_CONFIG[outlook];
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border} flex items-center gap-1`}>
      {icon} {label}: {cfg.label}
    </span>
  );
}

/** Expandable section accordion */
function SectionAccordion({
  id,
  isExpanded,
  onToggle,
  icon,
  iconBg,
  title,
  subtitle,
  outlook,
  scoreValue,
  delay = 0,
  children,
}: {
  id: string;
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  outlook?: 'bullish' | 'bearish' | 'neutral';
  scoreValue?: number;
  delay?: number;
  children: React.ReactNode;
}) {
  const outlookCfg = outlook ? OUTLOOK_CONFIG[outlook] : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card-static overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-mist/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center text-white shrink-0`}>
            {icon}
          </div>
          <div className="text-left min-w-0">
            <h4 className="text-sm font-bold text-charcoal leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {title}
            </h4>
            <p className="text-[11px] text-slate-text truncate">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {outlookCfg && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${outlookCfg.bg} ${outlookCfg.color} border ${outlookCfg.border} hidden sm:flex items-center gap-1`}>
              {outlookCfg.emoji} {outlookCfg.label}
            </span>
          )}
          {scoreValue !== undefined && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 hidden sm:block" style={{ fontFamily: 'var(--font-mono)' }}>
              {scoreValue}/10
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-text" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-text" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-white/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Macro indicator mini card */
function MacroIndicator({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-ghost rounded-lg px-3 py-2.5 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-semibold text-slate-text uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-charcoal/80 font-medium leading-snug">{value}</p>
    </div>
  );
}

/** Price point box */
function PriceBox({
  label,
  price,
  icon,
  bgColor,
  borderColor,
  textColor,
  formatCurrency,
}: {
  label: string;
  price: number;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  textColor: string;
  formatCurrency: (n: number) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${bgColor} rounded-2xl p-3 text-center border ${borderColor}`}
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-[9px] font-semibold text-slate-text uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-base font-bold ${textColor}`} style={{ fontFamily: 'var(--font-mono)' }}>
        {formatCurrency(price)}
      </p>
    </motion.div>
  );
}
