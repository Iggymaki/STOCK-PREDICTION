'use client';

import { useMemo } from 'react';
import { MOCK_THB_RATE } from '@/lib/constants';

/**
 * Hook แปลงค่าเงิน USD → THB
 * Phase 1: ใช้ mock rate
 * Phase 2: จะเชื่อม API จริง
 */
export function useCurrencyConvert() {
  const rate = MOCK_THB_RATE;
  const isLoading = false; // Phase 2: จะ fetch rate จริง

  const convertToTHB = useMemo(
    () => (usdAmount: number) => usdAmount * rate,
    [rate]
  );

  const convertToUSD = useMemo(
    () => (thbAmount: number) => thbAmount / rate,
    [rate]
  );

  return {
    rate,
    isLoading,
    convertToTHB,
    convertToUSD,
  };
}
