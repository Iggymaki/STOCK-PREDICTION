'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity } from 'lucide-react';

interface QuotaData {
  remainingRequests: string | null;
  remainingTokens: string | null;
  resetRequests: string | null;
  resetTokens: string | null;
  error?: string;
}

export function AIQuota() {
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuota = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quota');
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
      }
    } catch (e) {
      console.error('Failed to fetch quota', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
    // Refresh every 5 minutes
    const interval = setInterval(fetchQuota, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format wait time safely
  const formatWaitTime = (timeStr: string | null) => {
    if (!timeStr || timeStr === 'Unknown') return 'ไม่ทราบ';
    // Often format is e.g. "5.14s" or "12m30s"
    const parsed = parseFloat(timeStr);
    if (!isNaN(parsed) && timeStr.endsWith('s')) {
      if (parsed < 60) return `${Math.ceil(parsed)} วินาที`;
      return `${Math.ceil(parsed / 60)} นาที`;
    }
    return timeStr.replace('s', 'วิ').replace('m', 'นาที');
  };

  // Convert string to number safely
  const requestsNum = parseInt(quota?.remainingRequests || '0', 10);
  
  if (loading && !quota) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mist/50 animate-pulse border border-slate-200">
        <div className="w-3 h-3 rounded-full bg-slate-300" />
        <div className="w-16 h-4 bg-slate-300 rounded" />
      </div>
    );
  }

  if (!quota || quota.error || isNaN(requestsNum)) {
    return null; // Hide if no valid data
  }

  // Calculate approximate analyses left
  // One stock analysis takes about 2 API requests (analyze + entry-analysis)
  const analysesLeft = Math.floor(requestsNum / 2);
  const isLow = analysesLeft < 10;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-colors cursor-help group relative ${
        isLow ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-lavender-light border-lavender/30 text-charcoal'
      }`}
      title="คลิกเพื่อรีเฟรชโควตา"
      onClick={fetchQuota}
    >
      <Sparkles className={`w-3.5 h-3.5 ${isLow ? 'text-rose-500' : 'text-lavender'}`} />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold leading-none mb-0.5">
          AI วิเคราะห์ได้อีก {analysesLeft.toLocaleString()} ครั้ง
        </span>
        <span className={`text-[9px] font-medium leading-none ${isLow ? 'text-rose-600/80' : 'text-slate-text'}`}>
          (รีเซ็ตใน {formatWaitTime(quota.resetRequests)})
        </span>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute top-full right-0 mt-2 w-48 p-3 rounded-xl bg-white shadow-float-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-left">
        <p className="text-[11px] font-bold text-charcoal mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-lavender" /> โควตา Groq API ปัจจุบัน
        </p>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex justify-between">
            <span className="text-slate-text">คำขอคงเหลือ:</span>
            <span className="font-semibold text-charcoal">{requestsNum.toLocaleString()} / 14,400</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-text">เวลารีเซ็ตคำขอ:</span>
            <span className="font-semibold text-charcoal">{formatWaitTime(quota.resetRequests)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-text">Tokens คงเหลือ:</span>
            <span className="font-semibold text-charcoal">{parseInt(quota.remainingTokens || '0', 10).toLocaleString()}</span>
          </div>
          <p className="pt-2 mt-2 border-t border-slate-100 text-slate-text/70 leading-tight">
            โควตานี้เป็นของ API Key ส่วนตัวที่คุณตั้งค่าไว้
          </p>
        </div>
      </div>
    </motion.div>
  );
}
