'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ArrowRight, Brain, Newspaper, LineChart } from 'lucide-react';

export default function HomePage() {
  return (
    <PageWrapper className="flex flex-col items-center justify-center min-h-[85vh] relative overflow-hidden">
      {/* Background Cyber Glow Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,86,151,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,86,151,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10" />
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-blue/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[200px] h-[200px] bg-brand-yellow/5 rounded-full blur-[80px] -z-10" />

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl px-4 mt-8"
      >
        {/* Floating Brain Chip Badge */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold mb-8 backdrop-blur-md"
        >
          <Brain className="w-4 h-4 text-brand-yellow animate-pulse" />
          <span>Next-Gen AI Analysis Engine</span>
        </motion.div>

        <h1
          className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          วิเคราะห์เจาะลึกหุ้นด้วย <br />
          <span className="gradient-text">Atlas Trade Planner</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-text max-w-2xl mx-auto mb-10 leading-relaxed">
          ขับเคลื่อนการวิเคราะห์ด้วยระบบ AI Multi-Agent ประเมินสภาวะเศรษฐกิจมหภาค มิติอุตสาหกรรม โครงสร้างปัจจัยพื้นฐาน และทิศทางกราฟเทคนิค เพื่อช่วยค้นหาจุดตัดสินใจเทรดที่มีประสิทธิภาพสูงสุด
        </p>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/trade-planner"
            className="
              btn-primary text-white inline-flex items-center gap-2.5 px-8 py-4 rounded-xl
              text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer
            "
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            📊 เริ่มต้นวิเคราะห์หุ้น <ArrowRight className="w-4 h-4 text-brand-yellow" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Cyber Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 w-full max-w-4xl px-4"
      >
        <FeatureCard
          icon={<Brain className="w-6 h-6 text-brand-yellow" />}
          title="Top-Down Analysis"
          desc="ประเมินสภาพเศรษฐกิจ (Macro) รายกลุ่มอุตสาหกรรม (Sector) จนถึงโครงสร้างเชิงลึกรายตัวหุ้นเพื่อหาจุดเข้าซื้อ"
        />
        <FeatureCard
          icon={<LineChart className="w-6 h-6 text-brand-blue" />}
          title="Technical Signal"
          desc="คำนวณสัญญาณ RSI, MACD, EMA และหารูปแบบโครงสร้างกราฟ (Chart Patterns) พร้อมแนวรับ-แนวต้านที่ชัดเจน"
        />
        <FeatureCard
          icon={<Newspaper className="w-6 h-6 text-emerald-400" />}
          title="AI Catalyst Translation"
          desc="รวบรวมข่าวสารล่าสุดที่ส่งผลกระทบต่อราคา แปลและสรุป Sentiment แรงกระทบโดยใช้พลังปัญญาประดิษฐ์"
        />
      </motion.div>
    </PageWrapper>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="
        glass-card-static p-6 space-y-4 text-left border border-white/5 backdrop-blur-lg
        relative overflow-hidden group hover:border-brand-blue/30 transition-all duration-300
      "
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-all duration-300" />
      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <div>
        <h3
          className="text-base font-bold text-charcoal mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h3>
        <p className="text-xs text-slate-text leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
