'use client';

import { motion } from 'framer-motion';
import { FileSpreadsheet, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/context/currency-context';
import type { AssetInsight } from '@/types/calculator';

interface FinancialDashboardProps {
  insight: AssetInsight | null;
}

export function FinancialDashboard({ insight }: FinancialDashboardProps) {
  const { formatCurrency, currency } = useCurrency();
  if (!insight || !insight.financials || !insight.quarterlyResults) return null;

  // We mock the earnings chart data based on the quarterly results
  const chartData = insight.quarterlyResults.map(q => ({
    name: q.quarter,
    'รายได้': q.revenue,
    'กำไรสุทธิ': Math.round(q.revenue * (q.eps / 100)), // rough mock for visual
  }));

  const isHealthy = insight.financials.overallSignal === 'bullish';

  return (
    <div className="space-y-6">
      {/* Health Check Summary */}
      <div className={`p-6 rounded-2xl border ${isHealthy ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
        <div className="flex items-start gap-4">
          {isHealthy ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
          ) : (
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-1" />
          )}
          <div>
            <h3 className="text-lg font-bold text-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
              กระดานวิเคราะห์สรุป (Health Check)
            </h3>
            <p className="text-sm font-medium text-slate-text mt-1">{insight.financials.overallSignalTh}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-text">Market Cap</p>
                <p className="text-sm font-bold text-charcoal">{formatCurrency(insight.financials.marketCap)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-text">P/E Ratio</p>
                <p className="text-sm font-bold text-charcoal">{insight.financials.peRatio}x</p>
              </div>
              <div>
                <p className="text-xs text-slate-text">Dividend Yield</p>
                <p className="text-sm font-bold text-charcoal">{insight.financials.dividendYield}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-text">Beta (ความผันผวน)</p>
                <p className="text-sm font-bold text-charcoal">{insight.financials.beta}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Chart */}
      <div className="glass-card-static p-6">
        <h3 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
          <TrendingUp className="w-5 h-5 text-lavender" />
          แนวโน้มรายได้และกำไรย้อนหลัง
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(val) => currency === 'THB' ? `฿${(val/1000).toFixed(0)}k` : `$${(val/1000).toFixed(0)}k`}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar yAxisId="left" dataKey="รายได้" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar yAxisId="left" dataKey="กำไรสุทธิ" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
