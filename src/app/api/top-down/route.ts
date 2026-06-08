import { NextResponse } from 'next/server';
import { callGroqAI, TOPDOWN_SYSTEM_PROMPT } from '@/lib/ai-client';
import type { TopDownAnalysis } from '@/types/calculator';
import { calculateRSI, calculateEMA } from '@/lib/technical-analysis';

/**
 * GET /api/top-down?symbol=AAPL&price=195.27
 * 
 * Top-Down Analysis: เศรษฐกิจ → อุตสาหกรรม → รายหุ้น → จุดเข้าซื้อ
 * ใช้ Groq (Llama 3.3 70B) + Top-Down system prompt
 */

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const currentPriceParam = parseFloat(searchParams.get('price') || '0');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    // ===== 1. ดึงข้อมูลจาก Yahoo Finance =====
    let price = currentPriceParam;
    let high52w = 0, low52w = 0;
    let targetHigh = 0, targetLow = 0, targetMean = 0;
    let pe = 0, forwardPE = 0, trailingPE = 0, beta = 1, divYield = 0;
    let sector = 'Unknown', industry = 'Unknown', recommendation = 'none';
    let revG = 0, earnG = 0, instHold = 0, profitMargin = 0;
    let marketCap = 0, totalRevenue = 0;
    let companyDescription = '';
    let newsTitles: string[] = [];
    let newsPublishers: string[] = [];

    // ดึง financial data + profile
    try {
      const summaryRes = await fetch(
        `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=financialData,defaultKeyStatistics,assetProfile`,
        { headers: YAHOO_HEADERS }
      );

      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        const result = summaryJson?.quoteSummary?.result?.[0] || {};
        const fd = result.financialData || {};
        const ks = result.defaultKeyStatistics || {};
        const ap = result.assetProfile || {};

        if (price <= 0) {
          price = fd.currentPrice?.raw || 0;
        }

        high52w = ks.fiftyTwoWeekHigh?.raw || 0;
        low52w = ks.fiftyTwoWeekLow?.raw || 0;
        targetHigh = fd.targetHighPrice?.raw || 0;
        targetLow = fd.targetLowPrice?.raw || 0;
        targetMean = fd.targetMeanPrice?.raw || 0;
        pe = fd.forwardPE?.raw || ks.forwardPE?.raw || 0;
        forwardPE = ks.forwardPE?.raw || fd.forwardPE?.raw || 0;
        trailingPE = ks.trailingPE?.raw || 0;
        beta = ks.beta?.raw || 1;
        divYield = (fd.dividendYield?.raw || 0) * 100;
        sector = ap.sector || 'Unknown';
        industry = ap.industry || 'Unknown';
        recommendation = fd.recommendationKey || 'none';
        
        revG = fd.revenueGrowth?.raw || 0;
        earnG = fd.earningsGrowth?.raw || 0;
        instHold = ks.heldPercentInstitutions?.raw || 0;
        profitMargin = fd.profitMargins?.raw || 0;
        marketCap = ks.marketCap?.raw || 0;
        totalRevenue = fd.totalRevenue?.raw || 0;
        companyDescription = (ap.longBusinessSummary || '').substring(0, 300);
      }
    } catch (e) {
      console.warn('[Top-Down] Summary fetch failed:', (e as Error).message);
    }

    // ดึงข่าว
    try {
      const newsRes = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=0&newsCount=5`,
        { headers: YAHOO_HEADERS }
      );
      if (newsRes.ok) {
        const newsJson = await newsRes.json();
        const newsItems = (newsJson.news || []).slice(0, 5);
        newsTitles = newsItems.map((n: any) => n.title);
        newsPublishers = newsItems.map((n: any) => n.publisher || 'Unknown');
      }
    } catch (e) {
      console.warn('[Top-Down] News fetch failed');
    }

    // ถ้าราคายังเป็น 0 ลอง v8 chart
    if (price <= 0) {
      try {
        const chartRes = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
          { headers: YAHOO_HEADERS }
        );
        if (chartRes.ok) {
          const chartData = await chartRes.json();
          const meta = chartData?.chart?.result?.[0]?.meta;
          if (meta) {
            price = meta.regularMarketPrice || 0;
            high52w = high52w || meta.fiftyTwoWeekHigh || 0;
            low52w = low52w || meta.fiftyTwoWeekLow || 0;
          }
        }
      } catch (e) {
        console.warn('[Top-Down] Chart fetch failed');
      }
    }

    // ===== 2. Technical Indicators =====
    let rsi14 = 50, ema20 = 0, ema50 = 0, macdLine = 0;
    let history14d: number[] = [];
    let avgVolume = 0, latestVolume = 0;
    try {
      const histRes = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`,
        { headers: YAHOO_HEADERS }
      );
      if (histRes.ok) {
        const histData = await histRes.json();
        const result = histData.chart?.result?.[0];
        const closes = result?.indicators?.quote?.[0]?.close?.filter((c: number | null) => c !== null) || [];
        const volumes = result?.indicators?.quote?.[0]?.volume?.filter((v: number | null) => v !== null) || [];
        
        if (closes.length >= 14) {
          rsi14 = calculateRSI(closes, 14);
          ema20 = calculateEMA(closes, 20);
          ema50 = calculateEMA(closes, 50);
          macdLine = calculateEMA(closes, 12) - calculateEMA(closes, 26);
          history14d = closes.slice(-14).map((p: number) => Number(p.toFixed(2)));
        }
        
        if (volumes.length >= 20) {
          const recentVolumes = volumes.slice(-20);
          avgVolume = recentVolumes.reduce((a: number, b: number) => a + b, 0) / recentVolumes.length;
          latestVolume = volumes[volumes.length - 1] || 0;
        }
      }
    } catch (e) {
      console.warn('[Top-Down] Historical chart fetch failed:', (e as Error).message);
    }

    // ===== Guard: ถ้าราคายังเป็น 0 =====
    if (price <= 0) {
      return NextResponse.json(
        { error: 'Cannot analyze — price data unavailable' },
        { status: 400 }
      );
    }

    // ===== 3. สร้าง fallback values =====
    if (high52w <= 0) high52w = price * 1.25;
    if (low52w <= 0) low52w = price * 0.65;
    if (targetMean <= 0) targetMean = price * 1.1;
    if (targetHigh <= 0) targetHigh = price * 1.3;
    if (targetLow <= 0) targetLow = price * 0.85;

    const formatMarketCap = (mc: number) => {
      if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`;
      if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`;
      if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}M`;
      return `$${mc.toLocaleString()}`;
    };

    const volumeChangePercent = avgVolume > 0 
      ? ((latestVolume - avgVolume) / avgVolume * 100).toFixed(1) 
      : '0';

    // ===== 4. เรียก AI Top-Down Analysis =====
    const userPrompt = `[TARGET ASSET] ${symbol}
[SECTOR] ${sector}
[INDUSTRY] ${industry}

═══ MARKET DATA ═══
Current_Price: $${price.toFixed(2)}
Market_Cap: ${formatMarketCap(marketCap)}
52W_High: $${high52w.toFixed(2)} | 52W_Low: $${low52w.toFixed(2)}
Position_in_52W_Range: ${((price - low52w) / (high52w - low52w) * 100).toFixed(1)}%

═══ FUNDAMENTAL DATA ═══
Forward_P/E: ${forwardPE > 0 ? forwardPE.toFixed(1) : 'N/A'}
Trailing_P/E: ${trailingPE > 0 ? trailingPE.toFixed(1) : 'N/A'}
Revenue_Growth: ${(revG * 100).toFixed(2)}%
Earnings_Growth: ${(earnG * 100).toFixed(2)}%
Profit_Margin: ${(profitMargin * 100).toFixed(2)}%
Dividend_Yield: ${divYield.toFixed(2)}%
Beta: ${beta.toFixed(2)}
Institutional_Ownership: ${(instHold * 100).toFixed(2)}%
Analyst_Recommendation: ${recommendation}
Analyst_Target: Mean $${targetMean.toFixed(2)} | High $${targetHigh.toFixed(2)} | Low $${targetLow.toFixed(2)}
Company_Summary: ${companyDescription || 'N/A'}

═══ TECHNICAL INDICATORS ═══
RSI_14D: ${rsi14.toFixed(2)}
MACD_Line: ${macdLine.toFixed(4)}
EMA_20: $${ema20.toFixed(2)}
EMA_50: $${ema50.toFixed(2)}
Price_vs_EMA20: ${price > ema20 ? 'ABOVE' : 'BELOW'} (${((price - ema20) / ema20 * 100).toFixed(2)}%)
Price_vs_EMA50: ${price > ema50 ? 'ABOVE' : 'BELOW'} (${((price - ema50) / ema50 * 100).toFixed(2)}%)
Volume_Change_vs_Avg: ${volumeChangePercent}%
Last_14_Closes: [${history14d.join(', ')}]

═══ NEWS CATALYSTS ═══
${newsTitles.length > 0 ? newsTitles.map((t, i) => `- [${newsPublishers[i]}] ${t}`).join('\n') : '- ไม่มีข่าวล่าสุด'}

[INSTRUCTION] วิเคราะห์ Top-Down ตาม 4 ขั้นตอนใน system prompt แล้วตอบเป็น JSON:
{
  "executiveSummary": "(สรุปภาพรวม 3-5 ประโยค รวมทั้งเศรษฐกิจ อุตสาหกรรม หุ้น จุดเข้า ภาษาไทย)",
  "overallSignal": "strong_buy | buy | wait | sell",
  "overallConfidence": (0-85 ตัวเลข),
  "macroEconomy": {
    "outlook": "bullish | bearish | neutral",
    "outlookTh": "(สรุปสั้น 1 ประโยค)",
    "keyFactors": ["(3-5 ปัจจัยเศรษฐกิจ)"],
    "analysis": "(วิเคราะห์ละเอียด 3-5 ประโยค)",
    "fedPolicy": "(นโยบาย Fed สั้นๆ)",
    "inflationTrend": "(แนวโน้มเงินเฟ้อ)",
    "gdpOutlook": "(แนวโน้ม GDP)",
    "riskLevel": "low | medium | high"
  },
  "industry": {
    "name": "${industry}",
    "nameTh": "(ชื่อไทย)",
    "outlook": "bullish | bearish | neutral",
    "outlookTh": "(สรุปสั้น 1 ประโยค)",
    "analysis": "(วิเคราะห์ละเอียด 3-5 ประโยค)",
    "growthDrivers": ["(ตัวขับเคลื่อน 3-4 ข้อ)"],
    "risks": ["(ความเสี่ยง 2-3 ข้อ)"],
    "competitorComparison": "(เปรียบเทียบคู่แข่ง 1-2 ประโยค)",
    "sectorRotation": "(Sector Rotation signal 1 ประโยค)"
  },
  "stockAnalysis": {
    "fundamentalScore": (0-10),
    "fundamentalSummary": "(สรุปปัจจัยพื้นฐาน 2-3 ประโยค)",
    "valuationAssessment": "(ถูก/แพง/เหมาะสม + เหตุผล)",
    "earningsOutlook": "(แนวโน้มกำไร 1-2 ประโยค)",
    "competitiveAdvantage": "(ความได้เปรียบ 1-2 ประโยค)",
    "catalysts": ["(ตัวเร่ง 2-3 ข้อ)"],
    "risks": ["(ความเสี่ยง 2-3 ข้อ)"]
  },
  "technicalEntry": {
    "entryPrice": (ตัวเลข),
    "stopLoss": (ตัวเลข),
    "takeProfit1": (ตัวเลข เป้าหมายใกล้),
    "takeProfit2": (ตัวเลข เป้าหมายไกล),
    "riskReward": "(เช่น 2.5:1)",
    "timeHorizon": "(Swing 1-4 สัปดาห์ / Position 1-3 เดือน)",
    "chartPattern": "(รูปแบบกราฟที่เห็น)",
    "keyIndicators": ["(สรุป Indicator สำคัญ 3-4 ข้อ)"],
    "entryReasoning": "(เหตุผลจุดเข้า 2-3 ประโยค)",
    "invalidation": "(เงื่อนไขที่ทำให้ call ผิด 1-2 ประโยค)"
  }
}`;

    const aiResult = await callGroqAI<any>(
      [
        { role: 'system', content: TOPDOWN_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.25, maxTokens: 3000 }
    );

    if (aiResult && aiResult.executiveSummary) {
      // Validate and sanitize the AI response
      const analysis: TopDownAnalysis = {
        executiveSummary: aiResult.executiveSummary || 'ระบบกำลังวิเคราะห์...',
        overallSignal: (['strong_buy', 'buy', 'wait', 'sell'].includes(aiResult.overallSignal) 
          ? aiResult.overallSignal : 'wait') as TopDownAnalysis['overallSignal'],
        overallConfidence: Math.min(85, Math.max(0, Number(aiResult.overallConfidence) || 50)),
        
        macroEconomy: {
          outlook: (['bullish', 'bearish', 'neutral'].includes(aiResult.macroEconomy?.outlook) 
            ? aiResult.macroEconomy.outlook : 'neutral') as 'bullish' | 'bearish' | 'neutral',
          outlookTh: aiResult.macroEconomy?.outlookTh || 'กำลังประเมินสถานการณ์เศรษฐกิจ',
          keyFactors: Array.isArray(aiResult.macroEconomy?.keyFactors) 
            ? aiResult.macroEconomy.keyFactors : ['กำลังวิเคราะห์'],
          analysis: aiResult.macroEconomy?.analysis || 'กำลังวิเคราะห์ภาพรวมเศรษฐกิจ',
          fedPolicy: aiResult.macroEconomy?.fedPolicy || 'N/A',
          inflationTrend: aiResult.macroEconomy?.inflationTrend || 'N/A',
          gdpOutlook: aiResult.macroEconomy?.gdpOutlook || 'N/A',
          riskLevel: (['low', 'medium', 'high'].includes(aiResult.macroEconomy?.riskLevel) 
            ? aiResult.macroEconomy.riskLevel : 'medium') as 'low' | 'medium' | 'high',
        },

        industry: {
          name: aiResult.industry?.name || industry,
          nameTh: aiResult.industry?.nameTh || industry,
          outlook: (['bullish', 'bearish', 'neutral'].includes(aiResult.industry?.outlook) 
            ? aiResult.industry.outlook : 'neutral') as 'bullish' | 'bearish' | 'neutral',
          outlookTh: aiResult.industry?.outlookTh || 'กำลังประเมินอุตสาหกรรม',
          analysis: aiResult.industry?.analysis || 'กำลังวิเคราะห์อุตสาหกรรม',
          growthDrivers: Array.isArray(aiResult.industry?.growthDrivers) 
            ? aiResult.industry.growthDrivers : ['กำลังวิเคราะห์'],
          risks: Array.isArray(aiResult.industry?.risks) 
            ? aiResult.industry.risks : ['กำลังวิเคราะห์'],
          competitorComparison: aiResult.industry?.competitorComparison || 'N/A',
          sectorRotation: aiResult.industry?.sectorRotation || 'N/A',
        },

        stockAnalysis: {
          fundamentalScore: Math.min(10, Math.max(0, Number(aiResult.stockAnalysis?.fundamentalScore) || 5)),
          fundamentalSummary: aiResult.stockAnalysis?.fundamentalSummary || 'กำลังวิเคราะห์ปัจจัยพื้นฐาน',
          valuationAssessment: aiResult.stockAnalysis?.valuationAssessment || 'กำลังประเมินมูลค่า',
          earningsOutlook: aiResult.stockAnalysis?.earningsOutlook || 'N/A',
          competitiveAdvantage: aiResult.stockAnalysis?.competitiveAdvantage || 'N/A',
          catalysts: Array.isArray(aiResult.stockAnalysis?.catalysts) 
            ? aiResult.stockAnalysis.catalysts : [],
          risks: Array.isArray(aiResult.stockAnalysis?.risks) 
            ? aiResult.stockAnalysis.risks : [],
        },

        technicalEntry: {
          entryPrice: Number(aiResult.technicalEntry?.entryPrice) || Number((price * 0.98).toFixed(2)),
          stopLoss: Number(aiResult.technicalEntry?.stopLoss) || Number((price * 0.93).toFixed(2)),
          takeProfit1: Number(aiResult.technicalEntry?.takeProfit1) || Number((price * 1.08).toFixed(2)),
          takeProfit2: Number(aiResult.technicalEntry?.takeProfit2) || Number((price * 1.15).toFixed(2)),
          riskReward: aiResult.technicalEntry?.riskReward || '2:1',
          timeHorizon: aiResult.technicalEntry?.timeHorizon || 'Swing Trade (1-4 สัปดาห์)',
          chartPattern: aiResult.technicalEntry?.chartPattern || 'กำลังวิเคราะห์รูปแบบกราฟ',
          keyIndicators: Array.isArray(aiResult.technicalEntry?.keyIndicators) 
            ? aiResult.technicalEntry.keyIndicators : [`RSI: ${rsi14.toFixed(1)}`],
          entryReasoning: aiResult.technicalEntry?.entryReasoning || 'กำลังวิเคราะห์จุดเข้า',
          invalidation: aiResult.technicalEntry?.invalidation || 'ราคาหลุดแนวรับสำคัญ',
        },

        analyzedAt: new Date().toISOString(),
        symbol: symbol.toUpperCase(),
      };

      return NextResponse.json(analysis);
    }

    // ===== 5. Fallback: สร้างผลวิเคราะห์จากข้อมูลที่มี =====
    const positionInRange = high52w !== low52w ? (price - low52w) / (high52w - low52w) : 0.5;
    
    const fallback: TopDownAnalysis = {
      executiveSummary: `ระบบวิเคราะห์ ${symbol} จากข้อมูลพื้นฐาน (AI ไม่พร้อมขณะนี้) ราคาปัจจุบัน $${price.toFixed(2)} อยู่ที่ ${(positionInRange * 100).toFixed(0)}% ของ 52-Week Range กรุณาลองใหม่อีกครั้งเพื่อรับผลวิเคราะห์ Top-Down จาก AI`,
      overallSignal: positionInRange < 0.3 ? 'buy' : positionInRange > 0.85 ? 'wait' : 'wait',
      overallConfidence: 30,
      
      macroEconomy: {
        outlook: 'neutral',
        outlookTh: 'ไม่สามารถวิเคราะห์ได้ — AI ไม่พร้อม กรุณาลองใหม่',
        keyFactors: ['ข้อมูลจำกัด'],
        analysis: 'ระบบ AI ไม่พร้อมให้บริการขณะนี้ ข้อมูลที่แสดงเป็นข้อมูลเบื้องต้นจาก Yahoo Finance เท่านั้น',
        fedPolicy: 'N/A',
        inflationTrend: 'N/A',
        gdpOutlook: 'N/A',
        riskLevel: 'medium',
      },
      
      industry: {
        name: industry,
        nameTh: industry,
        outlook: 'neutral',
        outlookTh: 'รอข้อมูลจาก AI',
        analysis: `${symbol} อยู่ในอุตสาหกรรม ${industry} ภายใต้เซกเตอร์ ${sector}`,
        growthDrivers: ['รอการวิเคราะห์จาก AI'],
        risks: ['รอการวิเคราะห์จาก AI'],
        competitorComparison: 'N/A',
        sectorRotation: 'N/A',
      },
      
      stockAnalysis: {
        fundamentalScore: 5,
        fundamentalSummary: `${symbol} มี Forward P/E ${forwardPE > 0 ? forwardPE.toFixed(1) : 'N/A'} และ Revenue Growth ${(revG * 100).toFixed(2)}%`,
        valuationAssessment: 'รอการวิเคราะห์จาก AI',
        earningsOutlook: `Earnings Growth: ${(earnG * 100).toFixed(2)}%`,
        competitiveAdvantage: 'N/A',
        catalysts: [],
        risks: [],
      },
      
      technicalEntry: {
        entryPrice: Number((price * 0.98).toFixed(2)),
        stopLoss: Number((price * 0.93).toFixed(2)),
        takeProfit1: Number((price * 1.08).toFixed(2)),
        takeProfit2: Number((price * 1.15).toFixed(2)),
        riskReward: '2:1',
        timeHorizon: 'Swing Trade (1-4 สัปดาห์)',
        chartPattern: 'N/A (AI ไม่พร้อม)',
        keyIndicators: [
          `RSI(14): ${rsi14.toFixed(1)}`,
          `MACD: ${macdLine.toFixed(4)}`,
          `EMA20: $${ema20.toFixed(2)}`,
        ],
        entryReasoning: 'ใช้ข้อมูลพื้นฐาน — รอ AI วิเคราะห์เพิ่มเติม',
        invalidation: `ราคาปิดต่ำกว่า $${(price * 0.90).toFixed(2)}`,
      },
      
      analyzedAt: new Date().toISOString(),
      symbol: symbol.toUpperCase(),
    };

    return NextResponse.json(fallback);
  } catch (error) {
    console.error('Top-Down Analysis API Error:', error);
    return NextResponse.json({ error: 'Failed to perform top-down analysis' }, { status: 500 });
  }
}
