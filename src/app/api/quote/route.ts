import { NextResponse } from 'next/server';

/**
 * GET /api/quote?symbol=AAPL
 * 
 * ดึงราคาเรียลไทม์จาก Yahoo Finance
 * ใช้หลาย endpoint เป็น fallback chain:
 * 1. Yahoo v8 chart API (มี CORS friendly มากสุด)
 * 2. Yahoo quoteSummary modules=price
 * 3. Yahoo search API (สุดท้าย ได้แค่ชื่อ)
 */

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  // ===== Strategy 1: Yahoo v8 chart API (1 day, 1 interval) =====
  try {
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d&includePrePost=true`;
    const chartRes = await fetch(chartUrl, { headers: HEADERS });
    
    if (chartRes.ok) {
      const chartData = await chartRes.json();
      const result = chartData?.chart?.result?.[0];
      if (result) {
        const meta = result.meta || {};
        const price = meta.regularMarketPrice || 0;
        const prevClose = meta.chartPreviousClose || meta.previousClose || price;
        const changePercent = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;

        if (price > 0) {
          return NextResponse.json({
            symbol: meta.symbol || symbol.toUpperCase(),
            price,
            changePercent: Number(changePercent.toFixed(2)),
            name: meta.shortName || meta.longName || symbol.toUpperCase(),
            high52w: meta.fiftyTwoWeekHigh || 0,
            low52w: meta.fiftyTwoWeekLow || 0,
            source: 'yahoo-chart',
          });
        }
      }
    }
  } catch (e) {
    console.warn('[Quote] v8 chart failed:', (e as Error).message);
  }

  // ===== Strategy 2: Yahoo quoteSummary =====
  try {
    const summaryUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price,financialData`;
    const summaryRes = await fetch(summaryUrl, { headers: HEADERS });

    if (summaryRes.ok) {
      const summaryData = await summaryRes.json();
      const result = summaryData?.quoteSummary?.result?.[0] || {};
      const priceModule = result.price || {};
      const fdModule = result.financialData || {};

      const price = priceModule.regularMarketPrice?.raw || fdModule.currentPrice?.raw || 0;
      const prevClose = priceModule.regularMarketPreviousClose?.raw || 0;
      const changePercent = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;

      if (price > 0) {
        return NextResponse.json({
          symbol: priceModule.symbol || symbol.toUpperCase(),
          price,
          changePercent: Number(changePercent.toFixed(2)),
          name: priceModule.shortName || priceModule.longName || symbol.toUpperCase(),
          high52w: priceModule.fiftyTwoWeekHigh?.raw || 0,
          low52w: priceModule.fiftyTwoWeekLow?.raw || 0,
          source: 'yahoo-summary',
        });
      }
    }
  } catch (e) {
    console.warn('[Quote] quoteSummary failed:', (e as Error).message);
  }

  // ===== Strategy 3: Yahoo v6 quote (legacy) =====
  try {
    const v6Url = `https://query1.finance.yahoo.com/v6/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    const v6Res = await fetch(v6Url, { headers: HEADERS });
    
    if (v6Res.ok) {
      const v6Data = await v6Res.json();
      const quote = v6Data?.quoteResponse?.result?.[0];
      if (quote && quote.regularMarketPrice) {
        return NextResponse.json({
          symbol: quote.symbol,
          price: quote.regularMarketPrice,
          changePercent: quote.regularMarketChangePercent || 0,
          name: quote.shortName || quote.longName || symbol.toUpperCase(),
          high52w: quote.fiftyTwoWeekHigh || 0,
          low52w: quote.fiftyTwoWeekLow || 0,
          source: 'yahoo-v6',
        });
      }
    }
  } catch (e) {
    console.warn('[Quote] v6 failed:', (e as Error).message);
  }

  // ===== Strategy 4: Fallback — search API เพื่อได้ชื่ออย่างน้อย =====
  try {
    const searchRes = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=1&newsCount=0`,
      { headers: HEADERS }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const quote = searchData.quotes?.[0];
      if (quote) {
        return NextResponse.json({
          symbol: quote.symbol || symbol.toUpperCase(),
          price: 0,
          changePercent: 0,
          name: quote.shortname || quote.longname || symbol.toUpperCase(),
          high52w: 0,
          low52w: 0,
          source: 'yahoo-search-fallback',
          error: 'Price data unavailable — all Yahoo Finance endpoints blocked',
        });
      }
    }
  } catch (e) {
    console.warn('[Quote] search fallback failed:', (e as Error).message);
  }

  // ===== ทุก endpoint ล้มหมด =====
  console.error(`[Quote] All strategies failed for symbol: ${symbol}`);
  return NextResponse.json({
    symbol: symbol.toUpperCase(),
    price: 0,
    changePercent: 0,
    name: symbol.toUpperCase(),
    high52w: 0,
    low52w: 0,
    source: 'none',
    error: 'All price sources unavailable',
  });
}
