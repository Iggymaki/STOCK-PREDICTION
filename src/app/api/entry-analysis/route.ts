import { NextResponse } from 'next/server';
import { callGroqAI, ALPHACORE_SYSTEM_PROMPT } from '@/lib/ai-client';
import type { AIEntryAnalysis } from '@/types/calculator';

/**
 * GET /api/entry-analysis?symbol=AAPL&price=195.27
 * 
 * AlphaCore Multi-Agent AI วิเคราะห์จุดราคาเข้าซื้อ
 * ใช้ Groq (Llama 3.3 70B) + debate pattern จาก training prompt
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
    let pe = 0, beta = 1, divYield = '0';
    let sector = 'Unknown', recommendation = 'none';
    let newsTitles: string[] = [];

    // ดึง financial data
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

        // ถ้า price ที่ส่งมา = 0 ให้ใช้จาก API
        if (price <= 0) {
          price = fd.currentPrice?.raw || 0;
        }

        high52w = ks.fiftyTwoWeekHigh?.raw || 0;
        low52w = ks.fiftyTwoWeekLow?.raw || 0;
        targetHigh = fd.targetHighPrice?.raw || 0;
        targetLow = fd.targetLowPrice?.raw || 0;
        targetMean = fd.targetMeanPrice?.raw || 0;
        pe = fd.forwardPE?.raw || ks.forwardPE?.raw || 0;
        beta = ks.beta?.raw || 1;
        divYield = ((fd.dividendYield?.raw || 0) * 100).toFixed(2);
        sector = ap.sector || 'Unknown';
        recommendation = fd.recommendationKey || 'none';
      }
    } catch (e) {
      console.warn('[Entry Analysis] Summary fetch failed:', (e as Error).message);
    }

    // ดึงข่าว
    try {
      const newsRes = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=0&newsCount=5`,
        { headers: YAHOO_HEADERS }
      );
      if (newsRes.ok) {
        const newsJson = await newsRes.json();
        newsTitles = (newsJson.news || []).slice(0, 5).map((n: any) => n.title);
      }
    } catch (e) {
      console.warn('[Entry Analysis] News fetch failed');
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
        console.warn('[Entry Analysis] Chart fetch failed');
      }
    }

    // ===== Guard: ถ้าราคายังเป็น 0 ส่ง error กลับ =====
    if (price <= 0) {
      return NextResponse.json({
        error: 'Cannot analyze — price data unavailable',
        entryPrice: 0,
        stopLoss: 0,
        takeProfit: 0,
        confidence: 'low' as const,
        confidenceTh: 'ไม่สามารถวิเคราะห์ได้ — ข้อมูลราคาไม่พร้อม',
        signal: 'wait' as const,
        signalTh: 'ไม่สามารถดึงราคาจากตลาดได้',
        reasoning: `ระบบไม่สามารถดึงราคาปัจจุบันของ ${symbol} จาก Yahoo Finance ได้ กรุณาลองค้นหาหุ้นอื่น หรือลองใหม่อีกครั้งในภายหลัง`,
        technicalLevels: { support: [], resistance: [] },
        riskReward: 0,
        timeframe: '-',
        keyFactors: ['ข้อมูลราคาไม่พร้อมใช้งาน'],
      });
    }

    // ===== 2. เตรียม fallback values ถ้า Yahoo data ไม่ครบ =====
    if (high52w <= 0) high52w = price * 1.25;
    if (low52w <= 0) low52w = price * 0.65;
    if (targetMean <= 0) targetMean = price * 1.1;
    if (targetHigh <= 0) targetHigh = price * 1.3;
    if (targetLow <= 0) targetLow = price * 0.85;

    // ===== 3. เรียก AlphaCore AI =====
    const userPrompt = `วิเคราะห์จุดเข้าซื้อ ${symbol} ราคาปัจจุบัน $${price.toFixed(2)}

สถานการณ์:
- 52-Week High: $${high52w.toFixed(2)} | 52-Week Low: $${low52w.toFixed(2)}
- ตำแหน่งใน 52W Range: ${((price - low52w) / (high52w - low52w) * 100).toFixed(0)}%
- Forward P/E: ${pe > 0 ? pe.toFixed(1) : 'N/A'}
- Beta: ${beta.toFixed(2)}
- Dividend Yield: ${divYield}%
- Sector: ${sector}
- เป้าหมายนักวิเคราะห์เฉลี่ย: $${targetMean.toFixed(2)} (สูงสุด: $${targetHigh.toFixed(2)}, ต่ำสุด: $${targetLow.toFixed(2)})
- คำแนะนำ consensus: ${recommendation}

ข่าวล่าสุด:
${newsTitles.length > 0 ? newsTitles.map((t, i) => `${i + 1}. ${t}`).join('\n') : 'ไม่มีข่าวล่าสุด'}

ให้ทำ Multi-Agent Debate (Krit, Nisa, Tan) แล้วให้ Atlas สรุป
ตอบเป็น JSON format ดังนี้:
{
  "entryPrice": (ราคาจุดเข้าซื้อที่แนะนำ, ตัวเลข),
  "stopLoss": (จุดตัดขาดทุน, ตัวเลข),
  "takeProfit": (จุดทำกำไร, ตัวเลข),
  "confidence": "high" | "medium" | "low",
  "confidenceTh": (อธิบายระดับความมั่นใจ 1 ประโยค ภาษาไทย),
  "signal": "strong_buy" | "buy" | "wait" | "sell",
  "signalTh": (สรุปสัญญาณ 1 ประโยค ภาษาไทย),
  "reasoning": (สรุปผลการ debate ของ 3 analysts + คำตัดสินของ Atlas 3-5 ประโยค ภาษาไทย),
  "technicalLevels": {
    "support": [แนวรับ 2-3 จุด ตัวเลข เรียงจากต่ำไปสูง],
    "resistance": [แนวต้าน 2-3 จุด ตัวเลข เรียงจากต่ำไปสูง]
  },
  "riskReward": (Risk:Reward ratio ตัวเลข),
  "timeframe": (กรอบเวลา เช่น "Swing Trade (1-4 สัปดาห์)"),
  "keyFactors": [(ปัจจัยหลัก 3-4 ข้อสั้นๆ ภาษาไทย)]
}`;

    const aiResult = await callGroqAI<AIEntryAnalysis>(
      [
        { role: 'system', content: ALPHACORE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.25, maxTokens: 1500 }
    );

    if (aiResult && aiResult.entryPrice && aiResult.entryPrice > 0) {
      // Validate and sanitize
      const analysis: AIEntryAnalysis = {
        entryPrice: Number(aiResult.entryPrice),
        stopLoss: Number(aiResult.stopLoss) || Number((price * 0.95).toFixed(2)),
        takeProfit: Number(aiResult.takeProfit) || Number((price * 1.10).toFixed(2)),
        confidence: (['high', 'medium', 'low'].includes(aiResult.confidence) ? aiResult.confidence : 'medium') as 'high' | 'medium' | 'low',
        confidenceTh: aiResult.confidenceTh || 'ระดับปานกลาง',
        signal: (['strong_buy', 'buy', 'wait', 'sell'].includes(aiResult.signal) ? aiResult.signal : 'wait') as 'strong_buy' | 'buy' | 'wait' | 'sell',
        signalTh: aiResult.signalTh || 'รอจังหวะ',
        reasoning: aiResult.reasoning || 'ระบบวิเคราะห์ด้วย AlphaCore Multi-Agent System',
        technicalLevels: {
          support: Array.isArray(aiResult.technicalLevels?.support)
            ? aiResult.technicalLevels.support.map(Number).filter(n => n > 0)
            : [Number((price * 0.95).toFixed(2)), Number((price * 0.90).toFixed(2))],
          resistance: Array.isArray(aiResult.technicalLevels?.resistance)
            ? aiResult.technicalLevels.resistance.map(Number).filter(n => n > 0)
            : [Number((price * 1.05).toFixed(2)), Number((price * 1.10).toFixed(2))],
        },
        riskReward: Number(aiResult.riskReward) || 0,
        timeframe: aiResult.timeframe || 'Swing Trade (1-4 สัปดาห์)',
        keyFactors: Array.isArray(aiResult.keyFactors) ? aiResult.keyFactors : [],
      };
      return NextResponse.json(analysis);
    }

    // ===== 4. Fallback: สร้างผลวิเคราะห์จากข้อมูลที่มี =====
    const positionInRange = high52w !== low52w ? (price - low52w) / (high52w - low52w) : 0.5;

    let fbSignal: 'strong_buy' | 'buy' | 'wait' | 'sell' = 'wait';
    let fbSignalTh = 'รอจังหวะที่เหมาะสม';
    let fbConfidence: 'high' | 'medium' | 'low' = 'low';

    if (positionInRange < 0.3) {
      fbSignal = 'buy'; fbSignalTh = 'น่าสนใจ — ราคาอยู่ใกล้แนวรับ 52W Low';
      fbConfidence = 'medium';
    } else if (positionInRange > 0.85) {
      fbSignal = 'wait'; fbSignalTh = 'ราคาใกล้ 52W High — รอ Pullback ก่อน';
      fbConfidence = 'medium';
    } else {
      fbSignalTh = 'ราคาอยู่กลาง Range — รอสัญญาณที่ชัดเจนกว่านี้';
    }

    // คำนวณ entry/sl/tp ที่สมเหตุสมผล
    const entryFb = Number((price * 0.98).toFixed(2));
    const slFb = Number((price * 0.93).toFixed(2));
    const tpFb = Number((price * 1.12).toFixed(2));
    const rrFb = (tpFb - entryFb) / (entryFb - slFb);

    const fallback: AIEntryAnalysis = {
      entryPrice: entryFb,
      stopLoss: slFb,
      takeProfit: tpFb,
      confidence: fbConfidence,
      confidenceTh: 'ข้อมูลจำกัด — ใช้ข้อมูลพื้นฐานเท่านั้น (AI ไม่พร้อมขณะนี้)',
      signal: fbSignal,
      signalTh: fbSignalTh,
      reasoning: `ระบบ AlphaCore วิเคราะห์จากข้อมูลพื้นฐานเท่านั้น (AI ไม่พร้อมใช้งานขณะนี้) ราคาปัจจุบัน $${price.toFixed(2)} อยู่ที่ ${(positionInRange * 100).toFixed(0)}% ของ 52-Week Range ($${low52w.toFixed(2)} - $${high52w.toFixed(2)}) เป้าหมายนักวิเคราะห์เฉลี่ยอยู่ที่ $${targetMean.toFixed(2)}`,
      technicalLevels: {
        support: [Number(low52w.toFixed(2)), Number((price * 0.95).toFixed(2))],
        resistance: [Number((price * 1.05).toFixed(2)), Number(high52w.toFixed(2))],
      },
      riskReward: Number(rrFb.toFixed(1)),
      timeframe: 'Swing Trade (1-4 สัปดาห์)',
      keyFactors: [
        `ราคาอยู่ที่ ${(positionInRange * 100).toFixed(0)}% ของ 52W Range`,
        pe > 0 ? `Forward P/E: ${pe.toFixed(1)}` : 'P/E ไม่มีข้อมูล',
        `เป้าหมายนักวิเคราะห์: $${targetMean.toFixed(2)}`,
      ],
    };

    return NextResponse.json(fallback);
  } catch (error) {
    console.error('Entry Analysis API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze entry point' }, { status: 500 });
  }
}
