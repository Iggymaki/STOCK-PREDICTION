// =============================================
// Formatters — จัดรูปแบบตัวเลข / สกุลเงิน
// =============================================

/**
 * จัดรูปแบบเงินบาท เช่น ฿1,234,567.00
 */
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * จัดรูปแบบเงินดอลลาร์ เช่น $1,234.56
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * จัดรูปแบบตัวเลขพร้อม comma เช่น 1,234,567
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * จัดรูปแบบ % เช่น 2.5%
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * จัดรูปแบบ R:R ratio เช่น 1:2.5
 */
export function formatRatio(ratio: number): string {
  if (ratio === 0) return '—';
  return `1:${ratio.toFixed(1)}`;
}

/**
 * ย่อตัวเลขใหญ่ เช่น 1.2M, 500K
 */
export function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
