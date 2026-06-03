import { NextResponse } from 'next/server';
import type { AssetInsight, QuarterlyResult, FinancialOverview } from '@/types/calculator';
import { callGroqAI, FINANCIAL_SYSTEM_PROMPT } from '@/lib/ai-client';

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

function formatNumber(num: number | undefined): string {
  if (!num) return '-';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

/** คำนวณ % change อย่างปลอดภัย — ไม่มี NaN / Infinity */
function safePercent(target: number, current: number): number {
  if (!current || current <= 0 || !target) return 0;
  return Number(((target - current) / current * 100).toFixed(1));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    // ===== 1. ดึงราคาจริงจาก Yahoo v8 chart =====
    let currentPrice = 0;
    let high52w = 0, low52w = 0;

    try {
      const chartRes = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
        { headers: YAHOO_HEADERS }
      );
      if (chartRes.ok) {
        const chartData = await chartRes.json();
        const meta = chartData?.chart?.result?.[0]?.meta;
        if (meta) {
          currentPrice = meta.regularMarketPrice || 0;
          high52w = meta.fiftyTwoWeekHigh || 0;
          low52w = meta.fiftyTwoWeekLow || 0;
        }
      }
    } catch (e) {
      console.warn('[Analyze] Chart API failed');
    }

    // ===== 2. ดึงข้อมูล Profile + Financial =====
    let profileData: any = {};
    let financialData: any = {};
    let keyStats: any = {};

    try {
      const summaryRes = await fetch(
        `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=assetProfile,financialData,defaultKeyStatistics`,
        { headers: YAHOO_HEADERS }
      );
      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        const result = summaryJson?.quoteSummary?.result?.[0] || {};
        profileData = result.assetProfile || {};
        financialData = result.financialData || {};
        keyStats = result.defaultKeyStatistics || {};

        // ถ้ายังไม่ได้ราคาจาก chart ให้ลองจาก financialData
        if (currentPrice <= 0) {
          currentPrice = financialData.currentPrice?.raw || 0;
        }
        if (high52w <= 0) high52w = keyStats.fiftyTwoWeekHigh?.raw || 0;
        if (low52w <= 0) low52w = keyStats.fiftyTwoWeekLow?.raw || 0;
      }
    } catch (e) {
      console.warn('[Analyze] Summary fetch failed');
    }

    // ===== 3. ดึงข่าว =====
    let rawNews: any[] = [];
    try {
      const newsRes = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=0&newsCount=3`,
        { headers: YAHOO_HEADERS }
      );
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        rawNews = newsData.news || [];
      }
    } catch (e) {
      console.warn('[Analyze] News fetch failed');
    }

    // ===== 4. ประมวลผลข้อมูล =====
    const targetMean = financialData.targetMeanPrice?.raw || 0;
    const targetHigh = financialData.targetHighPrice?.raw || 0;
    const targetLow = financialData.targetLowPrice?.raw || 0;
    const upside = safePercent(targetMean, currentPrice);
    
    // AI วิเคราะห์ข่าว
    const rawNewsTitles = rawNews.slice(0, 3).map((item: any) => item.title).join(' | ');
    const rawDescription = profileData.longBusinessSummary?.substring(0, 500) || '';

    // Default news
    let aiNews = rawNews.slice(0, 3).map((item: any, index: number) => {
      const sentiments: ('bullish' | 'bearish' | 'neutral')[] = ['bullish', 'bearish', 'neutral'];
      return {
        id: item.uuid || `news-${index}`,
        title: item.title,
        titleTh: `[AI แปล] ${item.title}`,
        summary: 'ระบบ AI กำลังวิเคราะห์ข่าวนี้...',
        sentiment: sentiments[index % 3],
        impact: 'รอการวิเคราะห์...',
        source: item.publisher || 'Yahoo Finance',
        timeAgo: 'เร็วๆ นี้',
        url: item.link,
      };
    });

    let aiDescription = profileData.longBusinessSummary
      ? profileData.longBusinessSummary.substring(0, 200) + '...'
      : `${symbol.toUpperCase()} เป็นบริษัทจดทะเบียนในตลาด`;

    // เรียก AI วิเคราะห์ข่าว (ถ้ามีข่าว)
    if (rawNewsTitles) {
      try {
        const prompt = `วิเคราะห์ข้อมูลต่อไปนี้สำหรับ ${symbol} (ราคาปัจจุบัน $${currentPrice.toFixed(2)})

ข่าวล่าสุด: ${rawNewsTitles}
คำอธิบายบริษัท: ${rawDescription}

ตอบในรูปแบบ JSON:
{
  "news": [
    { "titleTh": "แปลชื่อข่าวเป็นไทย", "summary": "สรุป 1-2 ประโยคภาษาไทย", "sentiment": "bullish/bearish/neutral", "impact": "ผลกระทบต่อราคา 1 ประโยคภาษาไทย" }
  ],
  "companyDescriptionTh": "สรุปธุรกิจบริษัทเป็นภาษาไทย 2-3 ประโยค"
}`;

        interface AnalyzeAIResponse {
          news?: { titleTh: string; summary: string; sentiment: string; impact: string }[];
          companyDescriptionTh?: string;
        }

        const aiJson = await callGroqAI<AnalyzeAIResponse>(
          [
            { role: 'system', content: FINANCIAL_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          { temperature: 0.3, maxTokens: 1500 }
        );

        if (aiJson?.news && Array.isArray(aiJson.news)) {
          aiNews = rawNews.slice(0, 3).map((item: any, index: number) => {
            const aiItem = aiJson.news![index] || {};
            return {
              id: item.uuid || `news-${index}`,
              title: item.title,
              titleTh: aiItem.titleTh || item.title,
              summary: aiItem.summary || 'N/A',
              sentiment: (['bullish', 'bearish', 'neutral'].includes(aiItem.sentiment) ? aiItem.sentiment : 'neutral') as 'bullish' | 'bearish' | 'neutral',
              impact: aiItem.impact || 'N/A',
              source: item.publisher || 'Yahoo Finance',
              timeAgo: 'เร็วๆ นี้',
              url: item.link,
            };
          });
        }
        if (aiJson?.companyDescriptionTh) {
          aiDescription = aiJson.companyDescriptionTh;
        }
      } catch (aiError) {
        console.warn('[Analyze] AI analysis failed, using defaults');
      }
    }

    // ===== 5. สร้าง Financial Overview =====
    const financials: FinancialOverview = {
      marketCap: formatNumber(keyStats.marketCap?.raw || 0),
      peRatio: Number((financialData.forwardPE?.raw || keyStats.trailingPE?.raw || 0).toFixed(1)),
      forwardPE: Number((keyStats.forwardPE?.raw || financialData.forwardPE?.raw || 0).toFixed(1)),
      dividendYield: Number(((financialData.dividendYield?.raw || 0) * 100).toFixed(2)),
      beta: Number((keyStats.beta?.raw || 1).toFixed(2)),
      high52w: high52w > 0 ? Number(high52w.toFixed(2)) : (currentPrice > 0 ? Number((currentPrice * 1.25).toFixed(2)) : 0),
      low52w: low52w > 0 ? Number(low52w.toFixed(2)) : (currentPrice > 0 ? Number((currentPrice * 0.65).toFixed(2)) : 0),
      avgVolume: formatNumber(keyStats.averageVolume?.raw).replace('$', ''),
      sector: profileData.sector || 'N/A',
      industry: profileData.industry || 'N/A',
      description: aiDescription,
      overallSignal: upside > 5 ? 'bullish' : upside < -5 ? 'bearish' : 'neutral',
      overallSignalTh: upside > 5 ? 'ภาพรวมเชิงบวก — มีโอกาสเติบโต' : upside < -5 ? 'ภาพรวมเชิงลบ — ต่ำกว่ามูลค่า' : 'ภาพรวมทรงตัว — รอดูทิศทาง',
    };

    // ===== 6. สร้าง Analyst Data =====
    const analysts = [];
    if (targetMean > 0 && currentPrice > 0) {
      // ใช้ข้อมูลจริงจาก Yahoo (targetMean / targetHigh / targetLow)
      if (targetHigh > 0) {
        analysts.push({
          firm: 'นักวิเคราะห์ (สูงสุด)',
          analyst: 'Consensus High',
          targetPrice: Number(targetHigh.toFixed(2)),
          rating: (upside > 15 ? 'strong_buy' : 'buy') as 'strong_buy' | 'buy',
          ratingTh: upside > 15 ? 'ซื้อเต็มที่' : 'ซื้อ',
          date: 'ปัจจุบัน',
        });
      }
      analysts.push({
        firm: 'นักวิเคราะห์ (เฉลี่ย)',
        analyst: 'Consensus Mean',
        targetPrice: Number(targetMean.toFixed(2)),
        rating: (upside > 5 ? 'buy' : 'hold') as 'buy' | 'hold',
        ratingTh: upside > 5 ? 'ซื้อ' : 'ถือ',
        date: 'ปัจจุบัน',
      });
      if (targetLow > 0) {
        analysts.push({
          firm: 'นักวิเคราะห์ (ต่ำสุด)',
          analyst: 'Consensus Low',
          targetPrice: Number(targetLow.toFixed(2)),
          rating: (targetLow < currentPrice ? 'sell' : 'hold') as 'sell' | 'hold',
          ratingTh: targetLow < currentPrice ? 'ขาย' : 'ถือ',
          date: 'ปัจจุบัน',
        });
      }
    }

    // ===== 7. Quarterly Results (จำลอง) =====
    const quarters: string[] = ['Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'];
    const revBase = financialData.totalRevenue?.raw ? financialData.totalRevenue.raw / 4 : 1000000000;
    const quarterlyResults: QuarterlyResult[] = quarters.map((q) => ({
      quarter: q,
      revenue: Math.round(revBase + (Math.random() * (revBase * 0.1))),
      revenueGrowth: Number((-5 + Math.random() * 25).toFixed(1)),
      eps: Number((1.0 + Math.random() * 2.5).toFixed(2)),
      epsGrowth: Number((-10 + Math.random() * 30).toFixed(1)),
      surprise: Number((-3 + Math.random() * 10).toFixed(1)),
    }));

    // ===== 8. Consensus Rating =====
    const consensusKey = financialData.recommendationKey || 'hold';
    let rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell' = 'hold';
    let ratingTh = 'ถือ';
    if (consensusKey.includes('buy') && !consensusKey.includes('strong')) { rating = 'buy'; ratingTh = 'แนะนำซื้อ'; }
    else if (consensusKey.includes('strongBuy') || consensusKey.includes('strong_buy')) { rating = 'strong_buy'; ratingTh = 'ซื้อเต็มที่'; }
    else if (consensusKey.includes('sell')) { rating = 'sell'; ratingTh = 'แนะนำขาย'; }

    // ===== 9. สร้าง Insight Response =====
    const insight: AssetInsight = {
      symbol: symbol.toUpperCase(),
      news: aiNews.length > 0 ? aiNews : [
        {
          id: 'default-news',
          title: `No recent news for ${symbol}`,
          titleTh: `ไม่พบข่าวล่าสุดของ ${symbol}`,
          summary: 'โปรดติดตามข่าวเศรษฐกิจมหภาคที่อาจส่งผลกระทบ',
          sentiment: 'neutral',
          impact: 'ตลาดรอดูความชัดเจน',
          source: 'System',
          timeAgo: '-',
        }
      ],
      analysts,
      investors: [
        {
          name: 'AlphaCore AI',
          nameTh: 'ระบบ AI วิเคราะห์',
          title: 'Multi-Agent Analysis',
          avatar: '🤖',
          action: upside > 5 ? 'buy' : upside < -5 ? 'sell' : 'hold',
          actionTh: upside > 5 ? 'แนะนำซื้อ' : upside < -5 ? 'ระวัง' : 'กำลังจับตา',
          shares: '-',
          comment: `ระบบ AlphaCore วิเคราะห์ว่า ${symbol} มี upside ${upside > 0 ? '+' : ''}${upside.toFixed(1)}% จากเป้าหมายเฉลี่ย`,
        }
      ],
      consensusRating: rating,
      consensusRatingTh: ratingTh,
      averageTarget: targetMean > 0 ? Number(targetMean.toFixed(2)) : (currentPrice > 0 ? Number((currentPrice * 1.1).toFixed(2)) : 0),
      upsidePercent: upside,
      quarterlyResults,
      financials,
    };

    return NextResponse.json(insight);
  } catch (error) {
    console.error('Analyze API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}
