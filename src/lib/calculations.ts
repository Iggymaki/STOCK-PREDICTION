// =============================================
// Pure Calculation Functions — Risk Calculator
// ไม่มี side effects, ไม่ import React
// =============================================

import type { CalculatorInput, CalculatorResult } from '@/types/calculator';

/**
 * คำนวณ Position Size (จำนวนหุ้น/เหรียญที่ควรซื้อ)
 * สูตร: (เงินทุน × %ความเสี่ยง) / |ราคาเข้า − จุดตัดขาดทุน|
 */
export function calculatePositionSize(
  totalCapital: number,
  riskPercent: number,
  entryPrice: number,
  stopLossPrice: number
): number {
  const riskAmount = totalCapital * (riskPercent / 100);
  const riskPerShare = Math.abs(entryPrice - stopLossPrice);
  if (riskPerShare === 0) return 0;
  return Math.floor(riskAmount / riskPerShare);
}

/**
 * คำนวณ Risk-to-Reward Ratio
 * เปรียบเทียบระยะทำกำไรกับระยะตัดขาดทุน
 */
export function calculateRiskRewardRatio(
  entryPrice: number,
  stopLossPrice: number,
  takeProfitPrice: number
): number {
  const risk = Math.abs(entryPrice - stopLossPrice);
  const reward = Math.abs(takeProfitPrice - entryPrice);
  if (risk === 0) return 0;
  return parseFloat((reward / risk).toFixed(2));
}

/**
 * คำนวณเงินขาดทุนสูงสุด
 */
export function calculateMaxLoss(
  totalCapital: number,
  riskPercent: number
): number {
  return totalCapital * (riskPercent / 100);
}

/**
 * คำนวณต้นทุนรวม
 */
export function calculateTotalCost(
  positionSize: number,
  entryPrice: number
): number {
  return positionSize * entryPrice;
}

/**
 * คำนวณกำไรสูงสุด
 */
export function calculateMaxProfit(
  positionSize: number,
  entryPrice: number,
  takeProfitPrice: number
): number {
  return positionSize * Math.abs(takeProfitPrice - entryPrice);
}

/**
 * คำนวณทุกอย่างรวมกัน — ใช้ใน hook
 * Return CalculatorResult พร้อม validation
 */
export function computeFullResult(input: CalculatorInput): CalculatorResult {
  const {
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    totalCapital,
    riskPercent,
  } = input;

  // Validation
  if (totalCapital <= 0) {
    return emptyResult('กรุณากรอกเงินทุนรวม');
  }
  if (entryPrice <= 0) {
    return emptyResult('กรุณากรอกราคาเข้าซื้อ');
  }
  if (stopLossPrice <= 0) {
    return emptyResult('กรุณากรอกจุดตัดขาดทุน');
  }
  if (stopLossPrice >= entryPrice) {
    return emptyResult('จุดตัดขาดทุนต้องต่ำกว่าราคาเข้าซื้อ (สำหรับ Long)');
  }
  if (takeProfitPrice <= entryPrice) {
    return emptyResult('จุดทำกำไรต้องสูงกว่าราคาเข้าซื้อ (สำหรับ Long)');
  }

  const positionSize = calculatePositionSize(
    totalCapital, riskPercent, entryPrice, stopLossPrice
  );
  const totalCost = calculateTotalCost(positionSize, entryPrice);
  const maxLoss = calculateMaxLoss(totalCapital, riskPercent);
  const maxProfit = calculateMaxProfit(positionSize, entryPrice, takeProfitPrice);
  const riskRewardRatio = calculateRiskRewardRatio(
    entryPrice, stopLossPrice, takeProfitPrice
  );
  const riskPerShare = Math.abs(entryPrice - stopLossPrice);
  const rewardPerShare = Math.abs(takeProfitPrice - entryPrice);
  const capitalUsagePercent = totalCapital > 0
    ? parseFloat(((totalCost / totalCapital) * 100).toFixed(1))
    : 0;

  return {
    positionSize,
    totalCost,
    maxLoss,
    maxProfit,
    riskRewardRatio,
    riskPerShare,
    rewardPerShare,
    capitalUsagePercent,
    isValid: true,
  };
}

/** ผลลัพธ์เปล่าสำหรับกรณี validation ไม่ผ่าน */
function emptyResult(error?: string): CalculatorResult {
  return {
    positionSize: 0,
    totalCost: 0,
    maxLoss: 0,
    maxProfit: 0,
    riskRewardRatio: 0,
    riskPerShare: 0,
    rewardPerShare: 0,
    capitalUsagePercent: 0,
    isValid: false,
    validationError: error,
  };
}
