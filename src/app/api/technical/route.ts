import { NextResponse } from 'next/server';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
};

// --- Math Utilities for Technical Indicators ---
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period; // SMA as initial EMA
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * k + ema;
  }
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    let gain = 0, loss = 0;
    if (diff >= 0) gain = diff;
    else loss = -diff;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 });

  try {
    // Fetch 3 months of historical data to have enough data points for EMA 50
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`;
    const res = await fetch(url, { headers: HEADERS });
    
    if (!res.ok) throw new Error('Yahoo chart API failed');
    const data = await res.json();
    const result = data.chart?.result?.[0];
    
    if (!result || !result.indicators?.quote?.[0]?.close) {
       return NextResponse.json({ error: 'No data available' }, { status: 404 });
    }

    // Filter out nulls
    const closes = result.indicators.quote[0].close.filter((c: number | null) => c !== null);
    
    if (closes.length < 2) return NextResponse.json({ error: 'Not enough data points' }, { status: 400 });

    const currentPrice = closes[closes.length - 1];
    const rsi14 = calculateRSI(closes, 14);
    const ema20 = calculateEMA(closes, 20);
    const ema50 = calculateEMA(closes, 50);

    // MACD (12, 26, 9) - returning MACD Line
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);
    const macdLine = ema12 - ema26;
    
    // Historical Price Action (Last 14 days)
    const history14d = closes.slice(-14);

    return NextResponse.json({
      symbol,
      currentPrice,
      indicators: {
        rsi14: Number(rsi14.toFixed(2)),
        ema20: Number(ema20.toFixed(2)),
        ema50: Number(ema50.toFixed(2)),
        macdLine: Number(macdLine.toFixed(2))
      },
      history14d: history14d.map((p: number) => Number(p.toFixed(2)))
    });

  } catch (error) {
    console.error('Technical API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
