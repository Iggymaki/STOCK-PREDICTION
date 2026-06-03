'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';

import { useCurrency } from '@/context/currency-context';
import { AIQuota } from './ai-quota';

export function Navbar() {
  const pathname = usePathname();
  const { currency, toggleCurrency } = useCurrency();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-nav fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl">🪐</span>
          <span
            className="text-lg font-semibold tracking-tight gradient-text"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Portfolio Planner
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const isDisabled = item.disabled;

              return (
                <Link
                  key={item.href}
                  href={isDisabled ? '#' : item.href}
                  className={`
                    relative px-3.5 py-2 rounded-xl text-sm font-medium
                    transition-all duration-300
                    ${isDisabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isActive
                        ? 'text-charcoal bg-lavender-light'
                        : 'text-slate-text hover:text-charcoal hover:bg-white/50'
                    }
                  `}
                  onClick={(e) => isDisabled && e.preventDefault()}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                  {isDisabled && (
                    <span className="ml-1.5 text-[10px] opacity-60 bg-mist px-1.5 py-0.5 rounded-full">
                      เร็วๆ นี้
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-lavender-light rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="w-px h-6 bg-slate-200" />
          
          <AIQuota />

          {/* Currency Toggle */}
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 bg-white/60 hover:bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold text-charcoal transition-colors shadow-sm"
          >
            <span className={currency === 'THB' ? 'opacity-100' : 'opacity-40'}>฿</span>
            <span className="text-slate-200">/</span>
            <span className={currency === 'USD' ? 'opacity-100' : 'opacity-40'}>$</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
