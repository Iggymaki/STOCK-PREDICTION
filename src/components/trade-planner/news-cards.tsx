'use client';

import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { SENTIMENT_CONFIG } from '@/lib/constants';
import type { AssetNews } from '@/types/calculator';

interface NewsCardsProps {
  news: AssetNews[];
  symbol: string;
}

const SENTIMENT_ICON = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  neutral: Minus,
} as const;

export function NewsCards({ news, symbol }: NewsCardsProps) {
  if (!news || news.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-lavender" />
        <h3
          className="text-base font-semibold text-charcoal"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          ข่าวล่าสุดของ {symbol}
        </h3>
      </div>

      <div className="space-y-3">
        {news.map((item, index) => {
          const sentimentCfg = SENTIMENT_CONFIG[item.sentiment];
          const SentIcon = SENTIMENT_ICON[item.sentiment];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="glass-card-static p-4 space-y-2.5 hover:bg-white/70 transition-colors duration-300"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${sentimentCfg.bgColor} ${sentimentCfg.color}`}>
                  <SentIcon className="w-3 h-3" />
                  {sentimentCfg.label}
                </span>
                <span className="text-[11px] text-slate-text">{item.source}</span>
                <span className="text-[10px] text-slate-text/60">· {item.timeAgo}</span>
              </div>

              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:underline hover:text-lavender transition-colors"
                >
                  <h4
                    className="text-sm font-semibold text-charcoal leading-snug"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {item.titleTh}
                  </h4>
                </a>
              ) : (
                <h4
                  className="text-sm font-semibold text-charcoal leading-snug"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {item.titleTh}
                </h4>
              )}

              <p className="text-xs text-slate-text leading-relaxed">{item.summary}</p>

              <div className="text-xs font-medium text-charcoal/80 bg-ghost rounded-lg p-2.5 leading-relaxed flex items-start gap-1.5">
                <Zap className="w-3.5 h-3.5 text-lavender shrink-0 mt-0.5" />
                <span><strong>ผลกระทบ:</strong> {item.impact}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
