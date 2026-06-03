'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function HomePage() {
  return (
    <PageWrapper className="flex flex-col items-center justify-center min-h-[80vh]">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-2xl"
      >
        {/* Floating Planet */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl mb-6"
        >
          🪐
        </motion.div>

        <h1
          className="text-4xl sm:text-5xl font-bold gradient-text mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Portfolio Planner
        </h1>

        <p className="text-base sm:text-lg text-slate-text mb-3 leading-relaxed">
          AI วิเคราะห์จุดเข้าซื้ออัจฉริยะ สำหรับนักลงทุนทุกระดับ
        </p>
        <p className="text-sm text-slate-text/70 mb-8">
          AI แนะนำจุดเข้าซื้อ · ดูราคาเรียลไทม์ · สรุปข่าวด้วย AI · คำนวณไม้
        </p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link
            href="/trade-planner"
            className="
              inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl
              text-base font-semibold text-charcoal
              bg-gradient-to-r from-lavender to-sky
              shadow-float hover:shadow-float-lg
              transition-all duration-300
              hover:scale-105 active:scale-95
            "
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            📊 เริ่มวางแผนเทรด
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-3xl"
      >
        <FeatureCard
          emoji="🤖"
          title="AI จุดเข้าซื้อ"
          desc="AI วิเคราะห์จุดเข้า + SL + TP ให้"
          active
        />
        <FeatureCard
          emoji="📰"
          title="ข่าว & วิเคราะห์"
          desc="สรุปข่าวตลาดเป็นภาษาไทย"
          active
        />
        <FeatureCard
          emoji="🧮"
          title="คำนวณไม้"
          desc="คำนวณ Position Sizing อัตโนมัติ"
          active
        />
      </motion.div>
    </PageWrapper>
  );
}

function FeatureCard({
  emoji,
  title,
  desc,
  active = false,
  soon = false,
}: {
  emoji: string;
  title: string;
  desc: string;
  active?: boolean;
  soon?: boolean;
}) {
  return (
    <div
      className={`
        glass-card-static p-5 text-center space-y-2
        ${active ? 'ring-2 ring-lavender/30' : 'opacity-60'}
      `}
    >
      <span className="text-2xl block">{emoji}</span>
      <h3
        className="text-sm font-semibold text-charcoal"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h3>
      <p className="text-xs text-slate-text">{desc}</p>
      {soon && (
        <span className="inline-block text-[10px] font-semibold text-slate-text bg-mist px-2 py-0.5 rounded-full">
          เร็วๆ นี้
        </span>
      )}
      {active && (
        <span className="inline-block text-[10px] font-semibold text-emerald-600 bg-mint-light px-2 py-0.5 rounded-full">
          ✓ พร้อมใช้งาน
        </span>
      )}
    </div>
  );
}
