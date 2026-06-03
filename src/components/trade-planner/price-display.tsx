'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatUSD, formatTHB } from '@/lib/formatters';
import { MOCK_ASSETS, MOCK_THB_RATE } from '@/lib/constants';
import type { MockAsset } from '@/types/calculator';

interface PriceDisplayProps {
  selectedSymbol: string;
  onSelectAsset: (asset: MockAsset) => void;
}

/**
 * Price Display — แสดงราคาสินทรัพย์ mock + แปลงเงินบาท
 * มี simulated live price movement ±0.5% ทุก 3 วินาที
 */
import { useCurrency } from '@/context/currency-context';

export function PriceDisplay({ selectedSymbol, onSelectAsset }: PriceDisplayProps) {
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const selectedAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];
  const { formatCurrency } = useCurrency();

  // Simulate live price movement
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        const change = (Math.random() - 0.5) * 0.01; // ±0.5%
        const newPrice = parseFloat((asset.price * (1 + change)).toFixed(2));
        return {
          ...asset,
          price: newPrice,
          change24h: parseFloat((asset.change24h + change * 100).toFixed(2)),
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const priceTHB = selectedAsset.price * MOCK_THB_RATE;
  const isUp = selectedAsset.change24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Label */}
      <label
        className="text-sm font-semibold text-charcoal block"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        สินทรัพย์ & ราคาปัจจุบัน
      </label>

      {/* Asset Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {assets.map((asset) => (
          <button
            key={asset.symbol}
            type="button"
            onClick={() => onSelectAsset(asset)}
            className={`
              px-3 py-1.5 rounded-xl text-xs font-semibold
              transition-all duration-300 cursor-pointer
              ${selectedSymbol === asset.symbol
                ? 'bg-lavender text-charcoal shadow-sm scale-105'
                : 'bg-ghost text-slate-text hover:bg-mist hover:scale-102'
              }
            `}
          >
            {asset.symbol}
          </button>
        ))}
      </div>

      {/* Price Display Card */}
      <motion.div
        layout
        className={`
          glass-card-static p-4 flex items-center justify-between
          transition-all duration-500
          ${isUp ? 'bg-gradient-to-r from-mint-light/30 to-transparent' : 'bg-gradient-to-r from-rose-light/30 to-transparent'}
        `}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-charcoal">{selectedAsset.name}</span>
            <span className="text-xs text-slate-text">({selectedAsset.nameTh})</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span
              className="text-2xl font-bold text-charcoal"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {formatCurrency(selectedAsset.price)}
            </span>
          </div>
        </div>

        {/* Change Badge */}
        <div className="flex items-center gap-2">
          <div className="live-dot" />
          <motion.span
            key={selectedAsset.change24h.toFixed(2)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`
              text-sm font-bold px-2.5 py-1 rounded-lg
              ${isUp
                ? 'text-emerald-700 bg-mint-light'
                : 'text-rose-700 bg-rose-light'
              }
            `}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {isUp ? '+' : ''}{selectedAsset.change24h.toFixed(2)}%
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}
