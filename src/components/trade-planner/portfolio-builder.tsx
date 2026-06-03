'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Rocket, Zap, PieChart, ArrowRight, DollarSign, Info } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCurrency } from '@/context/currency-context';

type RiskProfile = 'safe' | 'balanced' | 'aggressive';
type Preference = 'tech' | 'dividend' | 'crypto' | 'mixed';

interface AllocationResult {
  title: string;
  desc: string;
  reasoning: string;
  data: { name: string; value: number; color: string; ticker: string; type: string }[];
}

const RISK_PROFILES: { id: RiskProfile; label: string; desc: string; icon: any; color: string }[] = [
  { id: 'safe', label: 'เน้นปลอดภัย (Safe)', desc: 'เงินต้นอยู่ครบ เน้นปันผลและความผันผวนต่ำ', icon: ShieldCheck, color: 'text-emerald-600' },
  { id: 'balanced', label: 'สมดุล (Balanced)', desc: 'รับความเสี่ยงได้ปานกลาง เน้นเติบโตระยะยาว', icon: PieChart, color: 'text-blue-500' },
  { id: 'aggressive', label: 'ซิ่ง! (Aggressive)', desc: 'หวังผลตอบแทนสูง รับความเหวี่ยงได้มาก', icon: Rocket, color: 'text-rose-500' },
];

const PREFERENCES: { id: Preference; label: string; icon: any }[] = [
  { id: 'tech', label: 'เทคโนโลยี (Tech & AI)', icon: Zap },
  { id: 'dividend', label: 'หุ้นปันผล (Dividend)', icon: DollarSign },
  { id: 'crypto', label: 'คริปโต (Crypto/Web3)', icon: Rocket },
  { id: 'mixed', label: 'ผสมผสาน (Diversified)', icon: PieChart },
];

export function PortfolioBuilder() {
  const [capital, setCapital] = useState<number>(1000);
  const [risk, setRisk] = useState<RiskProfile | null>(null);
  const [pref, setPref] = useState<Preference | null>(null);
  const [result, setResult] = useState<AllocationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { formatCurrency, currency } = useCurrency();

  const handleGenerate = () => {
    if (!risk || !pref || capital <= 0) return;
    setIsGenerating(true);

    setTimeout(() => {
      let data: any[] = [];
      let title = '';
      let desc = '';
      let reasoning = '';

      if (risk === 'safe') {
        title = 'พอร์ตป้อมปราการ (Defensive Portfolio)';
        desc = 'เน้นรักษามูลค่าเงินทุน และรับปันผลสม่ำเสมอ';
        reasoning = 'หลักการจัดพอร์ตนี้คือการปกป้องเงินต้นของคุณให้อยู่รอดในทุกสภาวะตลาด โดยแบ่งน้ำหนักไปที่หุ้น Defensive (เช่น KO) ที่ไม่ค่อยผันผวนตามเศรษฐกิจ และกระจายเงินเข้าพันธบัตรรัฐบาล (TLT) เพื่อเป็นหลักประกันความเสี่ยง';
        data = [
          { name: 'S&P 500 ETF', value: 50, color: '#34d399', ticker: 'VOO', type: 'ETF' },
          { name: 'หุ้นปันผล (เช่น KO)', value: 30, color: '#60a5fa', ticker: 'KO', type: 'Stock' },
          { name: 'พันธบัตรรัฐบาล', value: 15, color: '#a78bfa', ticker: 'TLT', type: 'Bond' },
          { name: 'เงินสด', value: 5, color: '#94a3b8', ticker: 'CASH', type: 'Cash' },
        ];
      } else if (risk === 'aggressive' && pref === 'crypto') {
        title = 'พอร์ตซิ่งทะลุโลก (High Alpha)';
        desc = 'ความผันผวนสูงมาก เหมาะกับคนที่รับการ Drawdown หนักๆ ได้';
        reasoning = 'เน้นสินทรัพย์ที่มีโอกาสเติบโตแบบก้าวกระโดด (Exponential Growth) โดยให้คริปโตเป็นแกนหลักเพื่อเก็งกำไรในรอบวัฏจักร (Cycle) ถัดไป และเสริมด้วยหุ้นเทคที่มีนวัตกรรม AI';
        data = [
          { name: 'Bitcoin (BTC)', value: 40, color: '#fbbf24', ticker: 'BTC-USD', type: 'Crypto' },
          { name: 'Tech Growth (เช่น NVDA)', value: 40, color: '#f43f5e', ticker: 'NVDA', type: 'Stock' },
          { name: 'Altcoins', value: 15, color: '#c084fc', ticker: 'ETH-USD', type: 'Crypto' },
          { name: 'เงินสด (ไว้ถัว)', value: 5, color: '#94a3b8', ticker: 'CASH', type: 'Cash' },
        ];
      } else if (pref === 'tech') {
        title = 'พอร์ตผู้นำเทคโนโลยี (Tech Leaders)';
        desc = 'เกาะเทรนด์ AI และนวัตกรรมใหม่ๆ ของโลก';
        reasoning = 'พอร์ตนี้เชื่อมั่นใน Megatrend ของโลกเทคโนโลยี โดยลงทุนในบริษัทที่เป็นผู้สร้างโครงสร้างพื้นฐาน AI (NVDA) และผู้ใช้ AI ทำเงินได้จริง (MSFT, AAPL)';
        data = [
          { name: 'Big Tech (AAPL, MSFT)', value: 45, color: '#38bdf8', ticker: 'MSFT', type: 'Stock' },
          { name: 'Semiconductor (NVDA, TSM)', value: 30, color: '#f472b6', ticker: 'NVDA', type: 'Stock' },
          { name: 'Nasdaq 100 ETF', value: 20, color: '#a78bfa', ticker: 'QQQ', type: 'ETF' },
          { name: 'เงินสด', value: 5, color: '#94a3b8', ticker: 'CASH', type: 'Cash' },
        ];
      } else {
        title = 'พอร์ตสมดุลแบบ All-Weather (Balanced)';
        desc = 'จัดสรรแบบกระจายความเสี่ยงให้พร้อมรับทุกสภาวะเศรษฐกิจ';
        reasoning = 'ใช้โมเดลคล้าย All-Weather Portfolio ที่มีการถือสินทรัพย์ที่ตอบสนองต่อสภาวะเศรษฐกิจต่างกัน (หุ้นโตตอนเศรษฐกิจดี ทองโตตอนเงินเฟ้อ) ทำให้พอร์ตมีความเหวี่ยงน้อยลง';
        data = [
          { name: 'S&P 500 ETF', value: 40, color: '#3b82f6', ticker: 'SPY', type: 'ETF' },
          { name: 'หุ้นเติบโต (Growth)', value: 30, color: '#f43f5e', ticker: 'QQQ', type: 'ETF' },
          { name: 'ทองคำ / สินทรัพย์ป้องกัน', value: 20, color: '#fbbf24', ticker: 'GLD', type: 'Commodity' },
          { name: 'เงินสด', value: 10, color: '#94a3b8', ticker: 'CASH', type: 'Cash' },
        ];
      }

      setResult({ title, desc, reasoning, data });
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ═══ Left: Quiz Form ═══ */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="glass-card-static p-6 space-y-5">
          <h2 className="text-lg font-bold text-charcoal flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <PieChart className="w-5 h-5 text-lavender" />
            AI จัดพอร์ตลงทุนส่วนตัว
          </h2>
          <p className="text-sm text-slate-text leading-relaxed">
            ระบุเงินทุนและความชอบของคุณ เพื่อให้ AI แนะนำสัดส่วนพอร์ตที่เหมาะสมที่สุด (Asset Allocation)
          </p>

          {/* Capital */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-charcoal flex justify-between">
              <span>1. คุณมีเงินทุนสำหรับพอร์ตนี้เท่าไหร่?</span>
              <span className="text-lavender">({currency})</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text font-semibold">
                {currency === 'THB' ? '฿' : '$'}
              </span>
              <input
                type="number"
                value={capital || ''}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="antigravity-input w-full pl-8"
                style={{ fontFamily: 'var(--font-mono)' }}
                placeholder="1000"
              />
            </div>
          </div>

          {/* Risk */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-charcoal">2. ระดับความเสี่ยงที่คุณรับได้?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RISK_PROFILES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRisk(r.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    risk === r.id
                      ? 'border-lavender bg-mist shadow-sm scale-[1.02]'
                      : 'border-slate-200 bg-white/50 hover:bg-mist/50'
                  }`}
                >
                  <r.icon className={`w-5 h-5 mb-2 ${r.color}`} />
                  <p className="text-xs font-bold text-charcoal">{r.label}</p>
                  <p className="text-[10px] text-slate-text mt-1">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preference */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-charcoal">3. กลุ่มสินทรัพย์ที่คุณสนใจเป็นพิเศษ?</label>
            <div className="grid grid-cols-2 gap-3">
              {PREFERENCES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPref(p.id)}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                    pref === p.id
                      ? 'border-lavender bg-mist'
                      : 'border-slate-200 bg-white/50 hover:bg-mist/50'
                  }`}
                >
                  <p.icon className="w-4 h-4 text-lavender" />
                  <span className="text-xs font-semibold text-charcoal">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!risk || !pref || capital <= 0 || isGenerating}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                กำลังวิเคราะห์พอร์ตที่ใช่...
              </>
            ) : (
              <>
                วิเคราะห์การจัดพอร์ต <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* ═══ Right: Result ═══ */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card-static overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-r from-lavender/10 to-mist p-6 border-b border-white/50">
              <h3 className="text-xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
                {result.title}
              </h3>
              <p className="text-xs text-slate-text mt-1">{result.desc}</p>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={result.data}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {result.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'สัดส่วน']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
                {/* Center text in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-text font-medium">รวมเงินลงทุน</span>
                  <span className="text-lg font-bold text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(capital)}
                  </span>
                </div>
              </div>

              {/* Allocation List */}
              <div className="mt-6 space-y-3">
                {result.data.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-slate-100 hover:bg-white/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-xs font-bold text-charcoal">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] px-1.5 py-0.5 bg-mist text-slate-text rounded font-semibold">{item.type}</span>
                          <span className="text-[10px] text-slate-text font-mono">{item.ticker}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency((item.value / 100) * capital)}
                      </p>
                      <p className="text-[10px] text-slate-text font-semibold">{item.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Reasoning Section */}
              <div className="mt-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-charcoal">ทำไมถึงแนะนำพอร์ตนี้?</h4>
                  <p className="text-xs text-slate-text leading-relaxed mt-1">{result.reasoning}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:flex flex-col items-center justify-center h-full text-slate-text/50 space-y-4 min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl"
          >
            <PieChart className="w-12 h-12" />
            <p className="text-sm font-semibold">รอการจัดพอร์ต...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
