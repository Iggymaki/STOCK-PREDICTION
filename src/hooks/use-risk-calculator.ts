'use client';

import { useMemo } from 'react';
import { computeFullResult } from '@/lib/calculations';
import { formatTHB, formatNumber, formatRatio } from '@/lib/formatters';
import { MOCK_THB_RATE } from '@/lib/constants';
import type { CalculatorInput, CalculatorResult } from '@/types/calculator';

interface UseRiskCalculatorReturn {
  result: CalculatorResult;
  thaiSummary: string;
  thaiMaxLoss: string;
  thaiMaxProfit: string;
  thaiTotalCost: string;
}

/**
 * Hook ที่รวมทุกสูตรคำนวณ Risk Calculator
 * คำนวณ real-time ทุกครั้งที่ input เปลี่ยน
 */
export function useRiskCalculator(input: CalculatorInput): UseRiskCalculatorReturn {
  const result = useMemo(() => computeFullResult(input), [
    input.entryPrice,
    input.stopLossPrice,
    input.takeProfitPrice,
    input.totalCapital,
    input.riskPercent,
  ]);

  // แปลงเงินเป็นบาท
  const maxLossThb = result.maxLoss * MOCK_THB_RATE;
  const maxProfitThb = result.maxProfit * MOCK_THB_RATE;
  const totalCostThb = result.totalCost * MOCK_THB_RATE;

  const thaiMaxLoss = formatTHB(maxLossThb);
  const thaiMaxProfit = formatTHB(maxProfitThb);
  const thaiTotalCost = formatTHB(totalCostThb);

  // สร้างประโยคสรุปภาษาไทย
  const thaiSummary = useMemo(() => {
    if (!result.isValid) {
      return result.validationError || 'กรุณากรอกข้อมูลให้ครบถ้วน';
    }

    const shares = formatNumber(result.positionSize);
    const loss = formatTHB(maxLossThb);
    const ratio = formatRatio(result.riskRewardRatio);

    if (result.riskRewardRatio >= 2) {
      return `ไม้นี้ระบบแนะนำให้ซื้อ ${shares} หุ้น หากชน Stop Loss จะเสียเงินสูงสุดเพียง ${loss} — อัตราส่วนกำไร:ขาดทุน ${ratio} คุ้มค่ามาก! 🚀`;
    } else if (result.riskRewardRatio >= 1) {
      return `ไม้นี้ระบบแนะนำให้ซื้อ ${shares} หุ้น หากชน Stop Loss จะเสียเงินสูงสุดเพียง ${loss} — อัตราส่วน ${ratio} พอไหว แต่ระวังด้วยนะ 🤔`;
    } else {
      return `ไม้นี้ซื้อได้ ${shares} หุ้น แต่อัตราส่วนกำไร:ขาดทุน ${ratio} ต่ำไป ลองปรับจุดทำกำไรให้สูงขึ้นนะ ⚠️`;
    }
  }, [result, maxLossThb]);

  return {
    result,
    thaiSummary,
    thaiMaxLoss,
    thaiMaxProfit,
    thaiTotalCost,
  };
}
