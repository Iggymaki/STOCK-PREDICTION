'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { PortfolioBuilder } from '@/components/trade-planner/portfolio-builder';

export default function PortfolioBuilderPage() {
  return (
    <PageWrapper>
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-3xl sm:text-4xl font-bold text-charcoal mb-3 tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          จัดพอร์ตการลงทุน <span className="text-lavender">ด้วย AI</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-text max-w-2xl leading-relaxed">
          ระบบจัดสรรเงินทุน (Asset Allocation) อัจฉริยะ 
          เพียงระบุความเสี่ยงและเงินทุนที่คุณมี AI จะคำนวณสัดส่วนการลงทุนที่เหมาะสมให้ทันที 
          พร้อมอธิบายเหตุผลประกอบ
        </p>
      </div>

      <PortfolioBuilder />
    </PageWrapper>
  );
}
