'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AssetSearchBar } from '@/components/trade-planner/asset-search-bar';
import { NewsCards } from '@/components/trade-planner/news-cards';
import { AnalystTargets } from '@/components/trade-planner/analyst-targets';
import { FamousInvestors } from '@/components/trade-planner/famous-investors';
import { StockDetailCard } from '@/components/trade-planner/stock-detail-card';
import { AboutCompany } from '@/components/trade-planner/about-company';
import { FinancialDashboard } from '@/components/trade-planner/financial-dashboard';
import { TopDownAnalysisCard } from '@/components/trade-planner/top-down-analysis';
import { useCurrency } from '@/context/currency-context';
import { DEFAULT_CALCULATOR_INPUT, RATING_CONFIG } from '@/lib/constants';
import type { CalculatorInput, AssetInsight, TopDownAnalysis } from '@/types/calculator';
import {
  Sparkles, Newspaper, Calculator, MapPin, Wallet,
  SlidersHorizontal, TrendingUp, TrendingDown,
  Users, AlertTriangle, FileSpreadsheet, Search,
  Globe, BarChart3,
} from 'lucide-react';

type TabId = 'top-down' | 'overview';

const TABS = [
  { id: 'top-down' as TabId, label: 'Top-Down Analysis', Icon: Globe, desc: 'เศรษฐกิจ → อุตสาหกรรม → หุ้น → กราฟ' },
  { id: 'overview' as TabId, label: 'ภาพรวม & ข่าว', Icon: Newspaper, desc: 'ข้อมูลเชิงลึก' },
];

export default function TradePlannerPage() {
  const [input, setInput] = useState<CalculatorInput>(DEFAULT_CALCULATOR_INPUT);
  const [activeTab, setActiveTab] = useState<TabId>('top-down');

  // สถานะโหลดข้อมูล Real-time
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingTopDown, setIsAnalyzingTopDown] = useState(false);

  // ข้อมูลเชิงลึกแบบ Dynamic
  const [insight, setInsight] = useState<AssetInsight | null>(null);
  const [topDownAnalysis, setTopDownAnalysis] = useState<TopDownAnalysis | null>(null);

  const { formatCurrency } = useCurrency();

  // เมื่อเลือกหุ้นใหม่จาก Search Bar
  const handleSelectAsset = useCallback(async (symbol: string, name: string) => {
    setInput(prev => ({ ...prev, assetSymbol: symbol, assetName: name }));
    setIsFetchingPrice(true);
    setIsAnalyzing(true);
    setIsAnalyzingTopDown(true);
    setInsight(null);
    setTopDownAnalysis(null);

    try {
      // ดึงราคาปัจจุบัน
      let fetchedPrice = 0;
      const quoteRes = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
      if (quoteRes.ok) {
        const quoteData = await quoteRes.json();
        fetchedPrice = quoteData.price || 0;
        setInput(prev => ({
          ...prev,
          entryPrice: fetchedPrice,
          changePercent: quoteData.changePercent || 0,
          stopLossPrice: fetchedPrice ? Number((fetchedPrice * 0.95).toFixed(2)) : 0,
          takeProfitPrice: fetchedPrice ? Number((fetchedPrice * 1.05).toFixed(2)) : 0,
        }));
      }
      setIsFetchingPrice(false);

      // ดึงผลวิเคราะห์จาก AI (parallel): analyze + top-down
      const [analyzeRes, topDownRes] = await Promise.all([
        fetch(`/api/analyze?symbol=${encodeURIComponent(symbol)}`),
        fetch(`/api/top-down?symbol=${encodeURIComponent(symbol)}&price=${fetchedPrice}`),
      ]);

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        setInsight(analyzeData);
      }
      setIsAnalyzing(false);

      if (topDownRes.ok) {
        const topDownData = await topDownRes.json();
        setTopDownAnalysis(topDownData);
      }
      setIsAnalyzingTopDown(false);
    } catch (error) {
      console.error('Error fetching asset data:', error);
    } finally {
      setIsFetchingPrice(false);
      setIsAnalyzing(false);
      setIsAnalyzingTopDown(false);
    }
  }, [input.entryPrice]);

  // โหลดข้อมูลเริ่มต้น - ปิดการโหลดอัตโนมัติ เพื่อไม่ให้เปลือง Token AI
  useEffect(() => {
    // ให้ user พิมพ์ค้นหาเอง
  }, []);

  // Polling ราคา Real-time ทุก 10 วินาที
  useEffect(() => {
    if (!input.assetSymbol) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/quote?symbol=${encodeURIComponent(input.assetSymbol)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.price) {
            setInput(prev => {
              if (prev.entryPrice !== data.price || prev.changePercent !== data.changePercent) {
                return { 
                  ...prev, 
                  entryPrice: data.price,
                  changePercent: data.changePercent !== undefined ? data.changePercent : prev.changePercent
                };
              }
              return prev;
            });
          }
        }
      } catch (err) {
        // เงียบไว้ถ้า fetch พลาดบางจังหวะ
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [input.assetSymbol]);

  const updateField = useCallback(<K extends keyof CalculatorInput>(
    field: K,
    value: CalculatorInput[K]
  ) => {
    setInput(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <PageWrapper>
      {/* ════════════ Page Header ════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1
          className="text-2xl sm:text-3xl font-bold gradient-text mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          ผู้ช่วยวิเคราะห์และวางแผนเทรด
        </h1>
        <p className="text-sm text-slate-text max-w-2xl">
          AI วิเคราะห์ปัจจัยเชิงลึกและจุดเข้าซื้ออัตโนมัติ — พร้อมสรุปข่าวและข้อมูลทางเทคนิคในที่เดียว
        </p>
      </motion.div>

      {/* ════════════ Search + Hero Card ════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-static p-6 mb-6"
      >
        <AssetSearchBar
          selectedSymbol={input.assetSymbol}
          onSelect={handleSelectAsset}
        />

        {input.assetSymbol && (
          <motion.div
            key={input.assetSymbol}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-ghost to-mist border border-white/50"
          >
            {isAnalyzing && !insight ? (
              <div className="flex items-center gap-3 py-3">
                <div className="w-6 h-6 border-2 border-lavender border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-lavender" style={{ fontFamily: 'var(--font-heading)' }}>
                    AI กำลังวิเคราะห์ {input.assetSymbol}...
                  </p>
                  <p className="text-[11px] text-slate-text">กำลังดึงข่าว ราคา และงบการเงินล่าสุด</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2
                    className="text-3xl font-bold text-charcoal tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {input.assetSymbol}
                  </h2>
                  <p className="text-sm text-slate-text">{input.assetName}</p>
                </div>

                <div className="text-left sm:text-center space-y-0.5">
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-charcoal tracking-tighter">
                    {formatCurrency(input.entryPrice)}
                  </h1>
                  {input.changePercent !== undefined && (
                    <p className={`text-sm font-semibold ${input.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {input.changePercent >= 0 ? '+' : ''}{input.changePercent}% วันนี้
                    </p>
                  )}
                  {isFetchingPrice && (
                    <div className="w-4 h-4 border-2 border-lavender border-t-transparent rounded-full animate-spin inline-block mt-2" />
                  )}
                </div>

                {insight && (
                  <div className="flex flex-col items-start sm:items-end gap-1.5">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/50 text-charcoal">
                      {insight.consensusRatingTh}
                    </span>
                    <span className={`text-[11px] font-semibold ${insight.upsidePercent >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {insight.upsidePercent >= 0 ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> : <TrendingDown className="w-3 h-3 inline mr-0.5" />}
                      {insight.upsidePercent >= 0 ? '+' : ''}{insight.upsidePercent}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </motion.section>

      {!input.assetSymbol ? (
        <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-lavender/10 flex items-center justify-center">
            <Search className="w-8 h-8 text-lavender" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
            ค้นหาหุ้นเพื่อเริ่มต้นวิเคราะห์เทรด
          </h2>
          <p className="text-slate-text max-w-md">
            พิมพ์สัญลักษณ์หุ้น (เช่น AAPL, MSFT, TSLA) ในช่องค้นหาด้านบน เพื่อให้ AI ทำการวิเคราะห์ภาพรวม โครงสร้างการเงิน และมุมมองทางเทคนิคแบบเจาะลึก
          </p>
        </div>
      ) : (
        <>
          {/* ════════════ Tab Navigation ════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-1"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium
                  transition-all duration-300 whitespace-nowrap cursor-pointer
                  ${activeTab === tab.id
                    ? 'glass-card-static bg-white/80 text-charcoal shadow-float scale-[1.02]'
                    : 'text-slate-text hover:bg-white/40 hover:text-charcoal'
                  }
                `}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <tab.Icon className={`w-4 h-4 ${activeTab === tab.id && tab.id === 'top-down' ? 'text-emerald-500' : ''}`} />
                <div className="text-left">
                  <p className="leading-tight">{tab.label}</p>
                  <p className="text-[10px] font-normal opacity-60">{tab.desc}</p>
                </div>
              </button>
            ))}
          </motion.div>

          {/* ════════════ Tab Content ════════════ */}
          <AnimatePresence mode="wait">
            {/* ═══ Tab: Top-Down Analysis ═══ */}
            {activeTab === 'top-down' && (
              <motion.div
                key="top-down"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6"
              >
                {/* Left: Top-Down Analysis */}
                <TopDownAnalysisCard
                  analysis={topDownAnalysis}
                  currentPrice={input.entryPrice}
                  symbol={input.assetSymbol}
                  isLoading={isAnalyzingTopDown}
                />

                {/* Right: Sidebar */}
                <div className="space-y-5">
                  {/* ข่าวล่าสุด */}
                  {insight && !isAnalyzing && insight.news.length > 0 && (
                    <div className="glass-card-static p-5 space-y-3">
                      <p className="text-[11px] text-slate-text font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Newspaper className="w-3.5 h-3.5" /> ข่าวล่าสุดที่ AI ใช้วิเคราะห์
                      </p>
                      {insight.news.slice(0, 2).map((item) => (
                        <div key={item.id} className="space-y-1">
                          <p className="text-xs font-semibold text-charcoal leading-snug">{item.titleTh}</p>
                          <p className="text-[11px] text-charcoal/70">{item.impact}</p>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className="text-[11px] text-lavender font-semibold hover:underline cursor-pointer"
                      >
                        ดูข่าวทั้งหมด →
                      </button>
                    </div>
                  )}

                  {/* ผลประกอบการรายไตรมาส */}
                  {insight && !isAnalyzing && insight.quarterlyResults && (
                    <div className="glass-card-static p-5 space-y-3">
                      <p className="text-[11px] text-slate-text font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" /> ผลประกอบการรายไตรมาส
                      </p>
                      
                      {/* Table Header */}
                      <div className="grid grid-cols-5 gap-2 text-[9px] font-semibold text-slate-text uppercase tracking-wider px-1">
                        <span>ไตรมาส</span>
                        <span className="text-right">รายได้</span>
                        <span className="text-right">Growth</span>
                        <span className="text-right">EPS</span>
                        <span className="text-right">Surprise</span>
                      </div>

                      {/* Table Rows */}
                      <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                        {insight.quarterlyResults.map((q) => (
                          <div key={q.quarter} className="grid grid-cols-5 gap-2 items-center py-1 px-1 rounded hover:bg-mist/30 transition-colors text-[11px]">
                            <span className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>{q.quarter}</span>
                            <span className="text-right text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>${(q.revenue / 1000).toFixed(1)}B</span>
                            <span className={`text-right font-semibold ${q.revenueGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {q.revenueGrowth >= 0 ? '+' : ''}{q.revenueGrowth.toFixed(1)}%
                            </span>
                            <span className="text-right text-charcoal" style={{ fontFamily: 'var(--font-mono)' }}>${q.eps.toFixed(2)}</span>
                            <span className={`text-right font-semibold ${q.surprise >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {q.surprise >= 0 ? '+' : ''}{q.surprise.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading sidebar */}
                  {isAnalyzing && (
                    <div className="glass-card-static p-5 animate-pulse space-y-3">
                      <div className="h-4 bg-mist rounded w-1/2" />
                      <div className="h-20 bg-mist rounded-xl" />
                      <div className="h-20 bg-mist rounded-xl" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ Tab: ภาพรวม & ข่าว ═══ */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {isAnalyzing ? (
                  <div className="h-60 flex items-center justify-center text-slate-text/60 text-sm">
                    <div className="text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-lavender border-t-transparent rounded-full animate-spin mx-auto" />
                      <p>กำลังสร้างข้อมูลภาพรวม...</p>
                    </div>
                  </div>
                ) : insight ? (
                  <>
                    {/* Row 1: ข่าว (ซ้าย) + ราคาเป้าหมาย (ขวา) */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                      <div className="glass-card-static p-6">
                        <NewsCards news={insight.news} symbol={input.assetSymbol} />
                      </div>
                      <div className="glass-card-static p-6">
                        <AnalystTargets
                          analysts={insight.analysts}
                          currentPrice={input.entryPrice}
                          consensusRatingTh={insight.consensusRatingTh}
                          consensusRating={insight.consensusRating}
                          averageTarget={insight.averageTarget}
                          upsidePercent={insight.upsidePercent}
                          aiTarget={topDownAnalysis?.technicalEntry.takeProfit1}
                        />
                      </div>
                    </div>

                    {/* Row 2: รายละเอียดหุ้น */}
                    <StockDetailCard
                      symbol={input.assetSymbol}
                      name={input.assetName}
                      financials={insight.financials}
                      quarterlyResults={insight.quarterlyResults}
                      isLoading={isAnalyzing}
                    />

                    {/* Row 3: คนดังที่ถือ */}
                    {insight.investors && insight.investors.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-lavender" />
                          <h3
                            className="text-sm font-semibold text-charcoal"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            คนดังที่ถือ {input.assetSymbol}
                          </h3>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {insight.investors.map((investor) => {
                            const actionColor = investor.action === 'buy'
                              ? 'text-emerald-600 bg-emerald-50'
                              : investor.action === 'sell'
                              ? 'text-rose-500 bg-rose-50'
                              : 'text-amber-600 bg-amber-50';
                            return (
                              <motion.div
                                key={investor.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card-static p-3.5 min-w-[220px] max-w-[280px] shrink-0 space-y-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-lavender-light flex items-center justify-center text-lg shrink-0">
                                    {investor.avatar}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-charcoal truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                                      {investor.nameTh}
                                    </p>
                                    <p className="text-[10px] text-slate-text truncate">{investor.title}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${actionColor}`}>
                                    {investor.actionTh}
                                  </span>
                                  <span className="text-[10px] text-slate-text" style={{ fontFamily: 'var(--font-mono)' }}>
                                    {investor.shares}
                                  </span>
                                </div>
                                <p className="text-[11px] text-charcoal/70 leading-relaxed line-clamp-2">
                                  {investor.comment}
                                </p>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ════════════ Disclaimer ════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-start gap-2 mt-12 max-w-lg mx-auto p-3 rounded-xl bg-mist/50"
      >
        <AlertTriangle className="w-4 h-4 text-slate-text/60 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-text/60 leading-relaxed">
          ข้อมูลการวิเคราะห์สร้างขึ้นจาก AI (Llama 3.3) เพื่อแสดงเป็นข้อมูลประกอบการตัดสินใจ
          ไม่ใช่คำแนะนำในการลงทุนจริง
        </p>
      </motion.div>
    </PageWrapper>
  );
}
