'use client';

import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper ที่ให้ float-in animation สำหรับทุกหน้า
 */
export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`pt-20 pb-12 px-4 sm:px-6 mx-auto max-w-6xl ${className}`}
    >
      {children}
    </motion.main>
  );
}
