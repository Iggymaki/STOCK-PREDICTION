// =============================================
// Constants — Risk Levels, Mock Data, Config
// =============================================

import type { RiskLevel, MockAsset } from '@/types/calculator';

/** ระดับความเสี่ยง 3 ระดับ */
export const RISK_LEVELS: RiskLevel[] = [
  {
    id: 'safe',
    label: 'เซฟสุดๆ',
    emoji: '🟢',
    percent: 1,
    description: 'ผู้เริ่มต้น นอนหลับสบาย',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    glowColor: 'shadow-emerald-200/60',
  },
  {
    id: 'moderate',
    label: 'ปานกลาง',
    emoji: '🟡',
    percent: 2,
    description: 'มีประสบการณ์บ้างแล้ว',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    glowColor: 'shadow-amber-200/60',
  },
  {
    id: 'risky',
    label: 'เสี่ยงสูง',
    emoji: '🔴',
    percent: 5,
    description: 'นักลงทุนมีประสบการณ์',
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
    glowColor: 'shadow-rose-200/60',
  },
];

/** สินทรัพย์จำลองสำหรับ Phase 1 */
export const MOCK_ASSETS: MockAsset[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    nameTh: 'แอปเปิ้ล',
    price: 195.27,
    change24h: 1.24,
    category: 'stock',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    nameTh: 'เอ็นวิเดีย',
    price: 135.58,
    change24h: -0.85,
    category: 'stock',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    nameTh: 'เทสล่า',
    price: 285.65,
    change24h: 2.15,
    category: 'stock',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    nameTh: 'บิตคอยน์',
    price: 68420.50,
    change24h: 3.12,
    category: 'crypto',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    nameTh: 'อีเธอเรียม',
    price: 3845.20,
    change24h: -1.45,
    category: 'crypto',
  },
  {
    symbol: 'GOLD',
    name: 'Gold Spot',
    nameTh: 'ทองคำ',
    price: 2345.80,
    change24h: 0.42,
    category: 'commodity',
  },
];

/** อัตราแลกเปลี่ยน THB/USD จำลอง */
export const MOCK_THB_RATE = 35.45;

/** Default values สำหรับ calculator form */
export const DEFAULT_CALCULATOR_INPUT = {
  assetSymbol: '',
  assetName: '',
  entryPrice: 0,
  stopLossPrice: 0,
  takeProfitPrice: 0,
  totalCapital: 100000, // 100,000 บาท
  riskPercent: 1,
};

/** Navigation items */
export const NAV_ITEMS = [
  { href: '/', label: 'หน้าแรก', icon: '🏠' },
  { href: '/trade-planner', label: 'วิเคราะห์หุ้น', icon: '📊' },
];

// =============================================
// Mock Insight Data — ข่าว, นักวิเคราะห์, คนดัง
// =============================================

import type { AssetInsight } from '@/types/calculator';

/** ข้อมูลเชิงลึกจำลองแยกตามสินทรัพย์ */
export const MOCK_INSIGHTS: Record<string, AssetInsight> = {
  AAPL: {
    symbol: 'AAPL',
    news: [
      {
        id: 'aapl-1',
        title: 'Apple announces AI-powered iPhone features at WWDC',
        titleTh: 'Apple เปิดตัวฟีเจอร์ AI ใหม่บน iPhone ในงาน WWDC',
        summary: 'Apple เปิดตัว Apple Intelligence ซึ่งเป็น AI ที่ทำงานบนอุปกรณ์โดยตรง นักวิเคราะห์มองว่าจะกระตุ้น Upgrade Cycle ครั้งใหญ่',
        sentiment: 'bullish',
        impact: '📈 เป็นบวกระยะกลาง — คาดว่ายอดขาย iPhone รุ่นใหม่จะเพิ่มขึ้น 15-20%',
        source: 'Bloomberg',
        timeAgo: '2 ชม. ที่แล้ว',
      },
      {
        id: 'aapl-2',
        title: 'EU fines Apple €1.8B over App Store practices',
        titleTh: 'EU ปรับ Apple 1.8 พันล้านยูโร จากกรณี App Store',
        summary: 'สหภาพยุโรปสั่งปรับ Apple จากการผูกขาดระบบชำระเงินบน App Store แต่ Apple ประกาศจะอุทธรณ์',
        sentiment: 'bearish',
        impact: '📉 กดดันระยะสั้น — แต่จำนวนค่าปรับคิดเป็นเพียง 0.5% ของรายได้ต่อปี',
        source: 'Reuters',
        timeAgo: '5 ชม. ที่แล้ว',
      },
      {
        id: 'aapl-3',
        title: 'Apple Services revenue hits all-time high',
        titleTh: 'รายได้ส่วน Services ของ Apple ทำสถิติใหม่',
        summary: 'รายได้จาก Apple Music, iCloud, App Store สูงสุดเป็นประวัติการณ์ สะท้อนการเปลี่ยนผ่านสู่ธุรกิจ Recurring Revenue',
        sentiment: 'bullish',
        impact: '📈 เป็นบวกระยะยาว — Margin ของ Services สูงกว่า Hardware มาก',
        source: 'CNBC',
        timeAgo: '1 วัน ที่แล้ว',
      },
    ],
    analysts: [
      { firm: 'Morgan Stanley', analyst: 'Erik Woodring', targetPrice: 220, rating: 'strong_buy', ratingTh: 'ซื้อเต็มที่', date: '28 พ.ค. 2026' },
      { firm: 'Goldman Sachs', analyst: 'Michael Ng', targetPrice: 210, rating: 'buy', ratingTh: 'ซื้อ', date: '25 พ.ค. 2026' },
      { firm: 'JP Morgan', analyst: 'Samik Chatterjee', targetPrice: 205, rating: 'buy', ratingTh: 'ซื้อ', date: '20 พ.ค. 2026' },
      { firm: 'Barclays', analyst: 'Tim Long', targetPrice: 186, rating: 'hold', ratingTh: 'ถือ', date: '18 พ.ค. 2026' },
    ],
    investors: [
      { name: 'Warren Buffett', nameTh: 'วอร์เรน บัฟเฟตต์', title: 'CEO Berkshire Hathaway', avatar: '🧓', action: 'hold', actionTh: 'ถือครอง', shares: '915M หุ้น', comment: 'Apple เป็นหุ้นที่ถือมากสุดในพอร์ต คิดเป็น ~40% ของ Berkshire' },
      { name: 'Tim Cook', nameTh: 'ทิม คุก', title: 'CEO Apple', avatar: '👨‍💼', action: 'buy', actionTh: 'ซื้อเพิ่ม', shares: '3.28M หุ้น', comment: 'CEO ซื้อหุ้นเพิ่มอย่างต่อเนื่อง สัญญาณความมั่นใจ' },
      { name: 'Cathie Wood', nameTh: 'คาธี่ วู้ด', title: 'CEO ARK Invest', avatar: '👩‍💼', action: 'sell', actionTh: 'ขายออก', shares: 'ขายหมดแล้ว', comment: 'มองว่า Apple Valuation สูงเกินไป เน้นหุ้น AI Disruption แทน' },
    ],
    consensusRating: 'buy',
    consensusRatingTh: 'แนะนำซื้อ',
    averageTarget: 205.25,
    upsidePercent: 5.1,
  },
  NVDA: {
    symbol: 'NVDA',
    news: [
      {
        id: 'nvda-1',
        title: 'NVIDIA ships first Blackwell Ultra GPUs to hyperscalers',
        titleTh: 'NVIDIA ส่งมอบ GPU Blackwell Ultra รุ่นใหม่ให้ลูกค้ารายใหญ่',
        summary: 'NVIDIA เริ่มส่งมอบ Blackwell Ultra ให้ Microsoft, Google, Amazon แล้ว — ดีมานด์ยังล้นเกินกำลังผลิต',
        sentiment: 'bullish',
        impact: '🚀 เป็นบวกอย่างมาก — Backlog เต็มไปจนถึง Q2/2027',
        source: 'The Verge',
        timeAgo: '3 ชม. ที่แล้ว',
      },
      {
        id: 'nvda-2',
        title: 'US considers tighter AI chip export restrictions to China',
        titleTh: 'สหรัฐฯ พิจารณาเข้มงวดการส่งออกชิป AI ไปจีน',
        summary: 'รัฐบาลสหรัฐฯ อาจจำกัดการส่งออกชิป AI ไปจีนเพิ่มเติม ซึ่งจะกระทบรายได้ของ NVIDIA ในตลาดจีน',
        sentiment: 'bearish',
        impact: '⚠️ กดดันระยะสั้น — รายได้จากจีนคิดเป็น ~15% ของรายได้รวม',
        source: 'Financial Times',
        timeAgo: '8 ชม. ที่แล้ว',
      },
    ],
    analysts: [
      { firm: 'Bank of America', analyst: 'Vivek Arya', targetPrice: 165, rating: 'strong_buy', ratingTh: 'ซื้อเต็มที่', date: '30 พ.ค. 2026' },
      { firm: 'Wedbush', analyst: 'Dan Ives', targetPrice: 160, rating: 'strong_buy', ratingTh: 'ซื้อเต็มที่', date: '27 พ.ค. 2026' },
      { firm: 'UBS', analyst: 'Timothy Arcuri', targetPrice: 150, rating: 'buy', ratingTh: 'ซื้อ', date: '22 พ.ค. 2026' },
    ],
    investors: [
      { name: 'Jensen Huang', nameTh: 'เจนเซ่น หวง', title: 'CEO NVIDIA', avatar: '👨‍💻', action: 'hold', actionTh: 'ถือครอง', shares: '86M หุ้น', comment: 'ผู้ก่อตั้งยังถือครองหุ้นจำนวนมาก แสดงความเชื่อมั่นระยะยาว' },
      { name: 'George Soros', nameTh: 'จอร์จ โซรอส', title: 'Founder Soros Fund', avatar: '🧓', action: 'buy', actionTh: 'เพิ่งซื้อเพิ่ม', shares: '1.2M หุ้น', comment: 'เพิ่มสัดส่วน NVDA ในพอร์ตอย่างมีนัยสำคัญในไตรมาสล่าสุด' },
    ],
    consensusRating: 'strong_buy',
    consensusRatingTh: 'ซื้อเต็มที่',
    averageTarget: 158.33,
    upsidePercent: 16.8,
  },
  TSLA: {
    symbol: 'TSLA',
    news: [
      {
        id: 'tsla-1',
        title: 'Tesla Robotaxi launch date confirmed for Austin',
        titleTh: 'Tesla ยืนยันวันเปิดตัว Robotaxi ที่ Austin',
        summary: 'Elon Musk ยืนยันว่า Tesla Robotaxi จะเริ่มให้บริการจริงที่ Austin, Texas ภายในสิ้นปีนี้',
        sentiment: 'bullish',
        impact: '🚀 เป็นบวกระยะยาว — ถ้าสำเร็จจะเปิดตลาด Autonomous ที่มีมูลค่ามหาศาล',
        source: 'TechCrunch',
        timeAgo: '4 ชม. ที่แล้ว',
      },
      {
        id: 'tsla-2',
        title: 'Tesla China sales decline 12% month-over-month',
        titleTh: 'ยอดขาย Tesla ในจีน ลดลง 12% จากเดือนก่อน',
        summary: 'การแข่งขันจาก BYD และค่ายรถจีน ทำให้ส่วนแบ่งตลาด Tesla ในจีนลดลงอย่างต่อเนื่อง',
        sentiment: 'bearish',
        impact: '📉 กดดันระยะสั้น — จีนเป็นตลาดใหญ่อันดับ 2 ของ Tesla',
        source: 'Bloomberg',
        timeAgo: '1 วัน ที่แล้ว',
      },
    ],
    analysts: [
      { firm: 'Wedbush', analyst: 'Dan Ives', targetPrice: 350, rating: 'strong_buy', ratingTh: 'ซื้อเต็มที่', date: '29 พ.ค. 2026' },
      { firm: 'Goldman Sachs', analyst: 'Mark Delaney', targetPrice: 275, rating: 'hold', ratingTh: 'ถือ', date: '25 พ.ค. 2026' },
      { firm: 'Bernstein', analyst: 'Toni Sacconaghi', targetPrice: 200, rating: 'sell', ratingTh: 'ขาย', date: '20 พ.ค. 2026' },
    ],
    investors: [
      { name: 'Elon Musk', nameTh: 'อีลอน มัสก์', title: 'CEO Tesla & SpaceX', avatar: '🚀', action: 'hold', actionTh: 'ถือครอง', shares: '411M หุ้น (~13%)', comment: 'ผู้ก่อตั้งถือหุ้นมากสุด เชื่อมั่นใน Full Self-Driving และ Robotaxi' },
      { name: 'Cathie Wood', nameTh: 'คาธี่ วู้ด', title: 'CEO ARK Invest', avatar: '👩‍💼', action: 'buy', actionTh: 'ซื้อเพิ่ม', shares: '5.8M หุ้น', comment: 'ตั้งราคาเป้าหมาย $2,000! มองว่า Robotaxi จะเปลี่ยนโลก' },
    ],
    consensusRating: 'hold',
    consensusRatingTh: 'ถือ / รอดู',
    averageTarget: 275.00,
    upsidePercent: -3.7,
  },
  BTC: {
    symbol: 'BTC',
    news: [
      {
        id: 'btc-1',
        title: 'Bitcoin ETF inflows hit record $2.4B in single week',
        titleTh: 'Bitcoin ETF มีเงินไหลเข้าสูงสุดเป็นประวัติการณ์ $2.4B ในสัปดาห์เดียว',
        summary: 'กองทุน Bitcoin ETF จาก BlackRock และ Fidelity ได้รับเงินลงทุนไหลเข้าอย่างต่อเนื่อง สะท้อนความเชื่อมั่นจากสถาบัน',
        sentiment: 'bullish',
        impact: '🚀 เป็นบวกมาก — สถาบันเข้ามาซื้อหนักเป็นสัญญาณแข็งแกร่ง',
        source: 'CoinDesk',
        timeAgo: '1 ชม. ที่แล้ว',
      },
    ],
    analysts: [
      { firm: 'Standard Chartered', analyst: 'Geoff Kendrick', targetPrice: 100000, rating: 'strong_buy', ratingTh: 'ซื้อเต็มที่', date: '1 มิ.ย. 2026' },
      { firm: 'JP Morgan', analyst: 'Nikolaos Panigirtzoglou', targetPrice: 75000, rating: 'buy', ratingTh: 'ซื้อ', date: '28 พ.ค. 2026' },
    ],
    investors: [
      { name: 'Michael Saylor', nameTh: 'ไมเคิล เซย์เลอร์', title: 'CEO MicroStrategy', avatar: '💎', action: 'buy', actionTh: 'ซื้อเพิ่มทุกสัปดาห์', shares: '214,400 BTC', comment: 'ซื้อ Bitcoin ไม่หยุด เชื่อว่า BTC คือทองคำดิจิทัล' },
      { name: 'Larry Fink', nameTh: 'แลร์รี่ ฟิงค์', title: 'CEO BlackRock', avatar: '🏦', action: 'buy', actionTh: 'สนับสนุน', shares: 'iShares Bitcoin ETF', comment: 'เปลี่ยนจากคนที่เคยต่อต้าน Bitcoin มาเป็นผู้สนับสนุนตัวยง' },
    ],
    consensusRating: 'buy',
    consensusRatingTh: 'แนะนำซื้อ',
    averageTarget: 87500,
    upsidePercent: 27.9,
  },
  ETH: {
    symbol: 'ETH',
    news: [
      {
        id: 'eth-1',
        title: 'Ethereum Pectra upgrade boosts staking efficiency',
        titleTh: 'Ethereum อัปเกรด Pectra เพิ่มประสิทธิภาพการ Staking',
        summary: 'อัปเกรด Pectra ช่วยให้ Validator ทำงานได้ดีขึ้น ลดต้นทุน Gas Fee และเพิ่มความเร็วในการ Finality',
        sentiment: 'bullish',
        impact: '📈 เป็นบวกระยะกลาง — เพิ่มความน่าสนใจในการ Stake ETH',
        source: 'The Block',
        timeAgo: '6 ชม. ที่แล้ว',
      },
    ],
    analysts: [
      { firm: 'Standard Chartered', analyst: 'Geoff Kendrick', targetPrice: 8000, rating: 'strong_buy', ratingTh: 'ซื้อเต็มที่', date: '1 มิ.ย. 2026' },
      { firm: 'VanEck', analyst: 'Matthew Sigel', targetPrice: 6000, rating: 'buy', ratingTh: 'ซื้อ', date: '25 พ.ค. 2026' },
    ],
    investors: [
      { name: 'Vitalik Buterin', nameTh: 'วิตาลิค บูเทอริน', title: 'ผู้ร่วมก่อตั้ง Ethereum', avatar: '🦄', action: 'hold', actionTh: 'ถือครอง', shares: 'ไม่เปิดเผยจำนวน', comment: 'ยังคงพัฒนา Ethereum อย่างต่อเนื่อง เชื่อมั่นในวิสัยทัศน์ระยะยาว' },
    ],
    consensusRating: 'buy',
    consensusRatingTh: 'แนะนำซื้อ',
    averageTarget: 7000,
    upsidePercent: 82.1,
  },
  GOLD: {
    symbol: 'GOLD',
    news: [
      {
        id: 'gold-1',
        title: 'Central banks continue gold buying spree in 2026',
        titleTh: 'ธนาคารกลางทั่วโลกยังคงเร่งซื้อทองคำในปี 2026',
        summary: 'ธนาคารกลางจีน อินเดีย และตุรกี ซื้อทองคำสำรองเพิ่มขึ้นอย่างต่อเนื่อง ท่ามกลางความไม่แน่นอนทางภูมิรัฐศาสตร์',
        sentiment: 'bullish',
        impact: '📈 เป็นบวก — Demand จากธนาคารกลางเป็นฐานรองรับราคาระยะยาว',
        source: 'World Gold Council',
        timeAgo: '12 ชม. ที่แล้ว',
      },
    ],
    analysts: [
      { firm: 'Goldman Sachs', analyst: 'Lina Thomas', targetPrice: 2700, rating: 'buy', ratingTh: 'ซื้อ', date: '30 พ.ค. 2026' },
      { firm: 'Citi', analyst: 'Aakash Doshi', targetPrice: 2500, rating: 'buy', ratingTh: 'ซื้อ', date: '25 พ.ค. 2026' },
    ],
    investors: [
      { name: 'Ray Dalio', nameTh: 'เรย์ ดาลิโอ', title: 'Founder Bridgewater', avatar: '🧘', action: 'buy', actionTh: 'ถือครอง + ซื้อเพิ่ม', shares: 'สัดส่วนใหญ่ในพอร์ต', comment: 'แนะนำให้มีทองคำ 5-10% ในพอร์ตเสมอ เป็น Hedge ความเสี่ยง' },
    ],
    consensusRating: 'buy',
    consensusRatingTh: 'แนะนำซื้อ',
    averageTarget: 2600,
    upsidePercent: 10.8,
  },
};

/** Sentiment color/emoji mapping */
export const SENTIMENT_CONFIG = {
  bullish: { emoji: '🟢', label: 'เชิงบวก', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  bearish: { emoji: '🩷', label: 'เชิงลบ', color: 'text-rose-500', bgColor: 'bg-rose-50' },
  neutral: { emoji: '🟡', label: 'กลางๆ', color: 'text-amber-600', bgColor: 'bg-amber-50' },
} as const;

/** Rating config */
export const RATING_CONFIG = {
  strong_buy: { emoji: '🚀', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  buy: { emoji: '📈', color: 'text-emerald-500', bgColor: 'bg-emerald-50/70' },
  hold: { emoji: '✋', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  sell: { emoji: '📉', color: 'text-rose-500', bgColor: 'bg-rose-50' },
  strong_sell: { emoji: '🔻', color: 'text-rose-600', bgColor: 'bg-rose-50' },
} as const;
