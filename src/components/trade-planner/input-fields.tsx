'use client';

import { motion } from 'framer-motion';
import { useCurrency } from '@/context/currency-context';

/* =============================================
   Antigravity Input Components
   สไตล์: ไร้ border แข็ง, soft bg, subtle focus ring
   ============================================= */

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  helperText?: string;
  icon?: string;
  suffix?: string;
  showCurrencyConversion?: boolean;
  min?: number;
  step?: number;
  delay?: number;
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder = '0',
  helperText,
  icon = '💰',
  suffix,
  showCurrencyConversion = false,
  min = 0,
  step = 1,
  delay = 0,
}: NumberInputProps) {
  const { formatCurrency, currency, rate } = useCurrency();
  
  // If currency is THB, we want to show the conversion for USD inputs, and vice versa.
  const convertedValue = currency === 'THB' ? value * rate : value / rate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="space-y-2"
    >
      <label
        className="text-sm font-semibold text-charcoal flex items-center gap-1.5"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        <span>{icon}</span>
        {label}
      </label>

      <div className="relative">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          min={min}
          step={step}
          className="antigravity-input w-full pr-16"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-text font-medium">
            {suffix}
          </span>
        )}
      </div>

      {/* Currency Conversion */}
      {showCurrencyConversion && value > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-slate-text pl-1"
        >
          ≈ {currency === 'THB' ? `$${(value / rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `฿${(value * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        </motion.p>
      )}

      {/* Helper Text */}
      {helperText && (
        <p className="text-[11px] text-slate-text pl-1">{helperText}</p>
      )}
    </motion.div>
  );
}

/* ── Exported Specialized Inputs ── */

interface CapitalInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function CapitalInput({ value, onChange }: CapitalInputProps) {
  const { currency } = useCurrency();
  return (
    <NumberInput
      label="เงินทุนรวม"
      icon="💰"
      value={value}
      onChange={onChange}
      placeholder={currency === 'THB' ? "100000" : "3000"}
      suffix={currency === 'THB' ? "฿ บาท" : "$ USD"}
      helperText="เงินทุนทั้งหมดที่คุณพร้อมใช้ในการลงทุน"
      step={currency === 'THB' ? 10000 : 500}
      delay={0.05}
    />
  );
}

interface StopLossInputProps {
  value: number;
  onChange: (value: number) => void;
  entryPrice: number;
}

export function StopLossInput({ value, onChange, entryPrice }: StopLossInputProps) {
  const diff = entryPrice > 0 && value > 0 ? ((entryPrice - value) / entryPrice * 100).toFixed(1) : '0';

  return (
    <div className="space-y-2">
      <NumberInput
        label="จุดตัดขาดทุน (Stop Loss)"
        icon="🛑"
        value={value}
        onChange={onChange}
        placeholder="190.00"
        suffix="USD"
        showCurrencyConversion
        step={0.01}
        delay={0.1}
      />
      {value > 0 && entryPrice > 0 && value < entryPrice && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-rose font-medium pl-1"
        >
          📉 ห่างจากราคาเข้า {diff}%
        </motion.p>
      )}
    </div>
  );
}

interface TakeProfitInputProps {
  value: number;
  onChange: (value: number) => void;
  entryPrice: number;
}

export function TakeProfitInput({ value, onChange, entryPrice }: TakeProfitInputProps) {
  const diff = entryPrice > 0 && value > 0 ? ((value - entryPrice) / entryPrice * 100).toFixed(1) : '0';

  return (
    <div className="space-y-2">
      <NumberInput
        label="เป้าทำกำไร (Take Profit)"
        icon="🎯"
        value={value}
        onChange={onChange}
        placeholder="210.00"
        suffix="USD"
        showCurrencyConversion
        step={0.01}
        delay={0.15}
      />
      {value > 0 && entryPrice > 0 && value > entryPrice && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-mint font-medium pl-1"
        >
          📈 ห่างจากราคาเข้า +{diff}%
        </motion.p>
      )}
    </div>
  );
}
