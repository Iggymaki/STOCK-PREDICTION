// =============================================
// Type Definitions — Risk Calculator
// =============================================

/** ระดับความเสี่ยง 3 ระดับ สำหรับ Risk Slider */
export interface RiskLevel {
  id: string;
  label: string;
  emoji: string;
  percent: number;
  description: string;
  color: string;         // Tailwind color class
  bgColor: string;       // Background color class
  glowColor: string;     // Glow ring color for result card
}

/** Input ที่ user กรอกเข้ามา */
export interface CalculatorInput {
  assetSymbol: string;
  assetName: string;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  totalCapital: number;
  riskPercent: number;
  changePercent?: number;
}

/** ผลลัพธ์ที่คำนวณออกมา */
export interface CalculatorResult {
  positionSize: number;       // จำนวนหุ้น/เหรียญ
  totalCost: number;          // เงินที่ใช้ซื้อ
  maxLoss: number;            // ขาดทุนสูงสุด (บาท)
  maxProfit: number;          // กำไรสูงสุด (บาท)
  riskRewardRatio: number;    // R:R ratio
  riskPerShare: number;       // ความเสี่ยงต่อหุ้น
  rewardPerShare: number;     // กำไรต่อหุ้น
  capitalUsagePercent: number; // % เงินทุนที่ใช้
  isValid: boolean;           // ผลคำนวณถูกต้องหรือไม่
  validationError?: string;   // ข้อความ error ถ้ามี
}

/** ข้อมูลสินทรัพย์จำลอง */
export interface MockAsset {
  symbol: string;
  name: string;
  nameTh: string;
  price: number;       // USD
  change24h: number;   // % เปลี่ยนแปลง
  category: 'stock' | 'crypto' | 'forex' | 'commodity';
}

// =============================================
// Decision Helper Types — ข่าว, ราคาเป้าหมาย, คนดัง
// =============================================

/** ข่าวสินทรัพย์ */
export interface AssetNews {
  id: string;
  title: string;
  titleTh: string;
  summary: string;          // สรุปภาษาไทย 1 ประโยค
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: string;           // ผลกระทบต่อราคาเป็นภาษาไทย
  source: string;
  timeAgo: string;          // เช่น "2 ชม. ที่แล้ว"
  url?: string;             // ลิงก์ไปยังข่าวต้นฉบับ
}

/** ราคาเป้าหมายจากนักวิเคราะห์ */
export interface AnalystTarget {
  firm: string;
  analyst: string;
  targetPrice: number;
  rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  ratingTh: string;
  date: string;
}

/** คนดัง / กูรู ที่ถือหุ้นตัวนี้ */
export interface FamousInvestor {
  name: string;
  nameTh: string;
  title: string;             // ตำแหน่ง เช่น "CEO Berkshire Hathaway"
  avatar: string;            // Emoji avatar
  action: 'buy' | 'hold' | 'sell';
  actionTh: string;
  shares: string;            // จำนวนหุ้น เช่น "915M shares"
  comment: string;           // ความเห็นสั้นๆ ภาษาไทย
}

/** ผลประกอบการรายไตรมาส */
export interface QuarterlyResult {
  quarter: string;         // เช่น "Q1 2026"
  revenue: number;         // รายได้ (ล้านดอลลาร์)
  revenueGrowth: number;   // % เติบโต YoY
  eps: number;             // กำไรต่อหุ้น
  epsGrowth: number;       // % เติบโต YoY
  surprise: number;        // % ที่ดีกว่า/แย่กว่าคาด
}

/** ภาพรวมทางการเงิน */
export interface FinancialOverview {
  marketCap: string;       // เช่น "$3.2T"
  peRatio: number;         // P/E Ratio
  forwardPE: number;       // Forward P/E
  dividendYield: number;   // % ปันผล
  beta: number;            // ความผันผวนเทียบตลาด
  high52w: number;         // ราคาสูงสุด 52 สัปดาห์
  low52w: number;          // ราคาต่ำสุด 52 สัปดาห์
  avgVolume: string;       // ปริมาณซื้อขายเฉลี่ย
  sector: string;          // เซกเตอร์
  industry: string;        // อุตสาหกรรม
  description: string;     // คำอธิบายบริษัทสั้นๆ เป็นไทย
  overallSignal: 'bullish' | 'bearish' | 'neutral'; // ภาพรวมเชิงบวก/ลบ
  overallSignalTh: string;
}

/** ข้อมูลเชิงลึกทั้งหมดของสินทรัพย์ */
export interface AssetInsight {
  symbol: string;
  news: AssetNews[];
  analysts: AnalystTarget[];
  investors: FamousInvestor[];
  consensusRating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  consensusRatingTh: string;
  averageTarget: number;
  upsidePercent: number;
  // ข้อมูลเพิ่มเติมสำหรับนักเทรด
  quarterlyResults?: QuarterlyResult[];
  financials?: FinancialOverview;
}

// =============================================
// AI Entry Analysis Types — จุดราคาเข้าซื้อ
// =============================================

/** แนว Support/Resistance */
export interface TechnicalLevels {
  support: number[];     // แนวรับ (จากต่ำไปสูง)
  resistance: number[];  // แนวต้าน (จากต่ำไปสูง)
}

/** ผลวิเคราะห์จุดเข้าซื้อจาก AI */
export interface AIEntryAnalysis {
  entryPrice: number;          // จุดราคาที่ AI แนะนำให้เข้าซื้อ
  stopLoss: number;            // จุดตัดขาดทุนที่ AI แนะนำ
  takeProfit: number;          // จุดทำกำไรที่ AI แนะนำ
  confidence: 'high' | 'medium' | 'low';  // ระดับความมั่นใจ
  confidenceTh: string;        // ระดับความมั่นใจ ภาษาไทย
  signal: 'strong_buy' | 'buy' | 'wait' | 'sell';  // สัญญาณ
  signalTh: string;            // สัญญาณ ภาษาไทย
  reasoning: string;           // เหตุผลจาก AI เป็นภาษาไทย
  technicalLevels: TechnicalLevels;
  riskReward?: number;         // Risk:Reward ratio (optional)
  timeframe: string;           // เช่น "Swing Trade (1-4 สัปดาห์)"
  keyFactors: string[];        // ปัจจัยหลักที่ AI ใช้วิเคราะห์ (ภาษาไทย)
}

// =============================================
// Top-Down Analysis Types — วิเคราะห์แบบ Top-Down
// =============================================

/** ภาคเศรษฐกิจ (Macro) */
export interface MacroEconomyAnalysis {
  outlook: 'bullish' | 'bearish' | 'neutral';
  outlookTh: string;
  keyFactors: string[];
  analysis: string;
  fedPolicy: string;
  inflationTrend: string;
  gdpOutlook: string;
  riskLevel: 'low' | 'medium' | 'high';
}

/** อุตสาหกรรม (Industry/Sector) */
export interface IndustryAnalysis {
  name: string;
  nameTh: string;
  outlook: 'bullish' | 'bearish' | 'neutral';
  outlookTh: string;
  analysis: string;
  growthDrivers: string[];
  risks: string[];
  competitorComparison: string;
  sectorRotation: string;
}

/** รายหุ้น (Individual Stock) */
export interface StockFundamentalAnalysis {
  fundamentalScore: number;
  fundamentalSummary: string;
  valuationAssessment: string;
  earningsOutlook: string;
  competitiveAdvantage: string;
  catalysts: string[];
  risks: string[];
}

/** จุดเข้าซื้อทางเทคนิค */
export interface TechnicalEntryAnalysis {
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskReward: string;
  timeHorizon: string;
  chartPattern: string;
  keyIndicators: string[];
  entryReasoning: string;
  invalidation: string;
}

/** ผลวิเคราะห์ Top-Down แบบครบวงจร */
export interface TopDownAnalysis {
  executiveSummary: string;
  overallSignal: 'strong_buy' | 'buy' | 'wait' | 'sell';
  overallConfidence: number;
  macroEconomy: MacroEconomyAnalysis;
  industry: IndustryAnalysis;
  stockAnalysis: StockFundamentalAnalysis;
  technicalEntry: TechnicalEntryAnalysis;
  analyzedAt: string;
  symbol: string;
}
