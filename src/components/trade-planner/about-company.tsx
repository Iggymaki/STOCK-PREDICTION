'use client';

import { motion } from 'framer-motion';
import { Building2, Info, MapPin, Users, Activity } from 'lucide-react';
import type { AssetInsight } from '@/types/calculator';

interface AboutCompanyProps {
  insight: AssetInsight | null;
}

export function AboutCompany({ insight }: AboutCompanyProps) {
  if (!insight || !insight.financials) return null;

  return (
    <div className="space-y-6">
      {/* Description Card */}
      <div className="glass-card-static p-6 space-y-4">
        <h3 className="text-lg font-bold text-charcoal flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
          <Building2 className="w-5 h-5 text-lavender" />
          ประวัติและธุรกิจหลัก (About)
        </h3>
        <p className="text-sm text-slate-text leading-relaxed">
          {insight.financials.description || 'ไม่มีข้อมูลรายละเอียดบริษัท'}
        </p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white/50 text-center">
          <MapPin className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-text">กลุ่มอุตสาหกรรม</p>
          <p className="text-sm font-bold text-charcoal mt-1">{insight.financials.industry}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white/50 text-center">
          <Activity className="w-5 h-5 text-rose-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-text">หมวดหมู่</p>
          <p className="text-sm font-bold text-charcoal mt-1">{insight.financials.sector}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white/50 text-center">
          <Users className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-text">พนักงาน</p>
          <p className="text-sm font-bold text-charcoal mt-1">-</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white/50 text-center">
          <Info className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-text">ก่อตั้งเมื่อ</p>
          <p className="text-sm font-bold text-charcoal mt-1">-</p>
        </div>
      </div>
    </div>
  );
}
