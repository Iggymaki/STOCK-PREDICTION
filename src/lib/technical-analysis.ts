// Math Utilities for Technical Indicators

export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period; // SMA as initial EMA
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * k + ema;
  }
  return ema;
}

export function calculateRSI(prices: number[], period: number = 14): number {
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

export function calculateMACD(prices: number[]): { macdLine: number; signalLine: number; histogram: number } {
  // MACD is usually EMA(12) - EMA(26)
  if (prices.length < 26) return { macdLine: 0, signalLine: 0, histogram: 0 };
  
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  
  // We cannot easily compute the signal line without historical MACD values
  // A simplified approach: we just return the MACD line
  return { macdLine, signalLine: 0, histogram: 0 };
}
