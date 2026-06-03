'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';

import { Search, History, X } from 'lucide-react';

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface HistoryItem {
  symbol: string;
  name: string;
}

interface AssetSearchBarProps {
  selectedSymbol: string;
  onSelect: (symbol: string, name: string) => void;
}

export function AssetSearchBar({ selectedSymbol, onSelect }: AssetSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // โหลดประวัติการค้นหาเมื่อเริ่มต้น
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('tradePlannerSearchHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  // ปิด dropdown เมื่อคลิกที่อื่น
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ค้นหาหุ้นผ่าน API
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    async function searchAssets() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    searchAssets();
  }, [debouncedQuery]);

  const handleSelect = (symbol: string, name: string) => {
    setQuery('');
    setIsOpen(false);
    
    // บันทึกประวัติ
    const newHistoryItem = { symbol, name };
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.symbol !== symbol);
      const updated = [newHistoryItem, ...filtered].slice(0, 5); // เก็บสูงสุด 5 ตัวล่าสุด
      localStorage.setItem('tradePlannerSearchHistory', JSON.stringify(updated));
      return updated;
    });

    onSelect(symbol, name);
  };

  const removeHistoryItem = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item.symbol !== symbol);
      localStorage.setItem('tradePlannerSearchHistory', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="relative w-full z-50" ref={wrapperRef}>
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-5 h-5 text-lavender" />
        <h3
          className="text-base font-semibold text-charcoal"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          ค้นหาหุ้น US ทุกตัวในตลาด
        </h3>
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="เช่น AAPL, MSFT, TSLA..."
          className="antigravity-input w-full px-4 h-12 text-sm"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-lavender border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results & History */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/40 shadow-float-lg rounded-2xl overflow-hidden z-50"
          >
            {/* Show Results when searching */}
            {query.trim().length > 0 && results.length > 0 && (
              <div className="max-h-64 overflow-y-auto p-1">
                {results.map((result) => (
                  <button
                    key={`${result.exchange}-${result.symbol}`}
                    onClick={() => handleSelect(result.symbol, result.name)}
                    className="w-full flex items-center justify-between p-3 hover:bg-mist rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <div>
                      <p className="text-sm font-bold text-charcoal">{result.symbol}</p>
                      <p className="text-[11px] text-slate-text truncate max-w-[200px]">{result.name}</p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-1 bg-white rounded-md border border-slate-200">
                      {result.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Show History when not searching */}
            {!query.trim() && history.length > 0 && (
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-semibold text-slate-text/70 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                  <History className="w-3 h-3" /> ล่าสุด
                </p>
                {history.map((item) => (
                  <div
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol, item.name)}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-mist rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-lavender/10 flex items-center justify-center">
                        <History className="w-4 h-4 text-lavender" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-charcoal leading-tight">{item.symbol}</p>
                        <p className="text-[10px] text-slate-text max-w-[180px] truncate">{item.name}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => removeHistoryItem(e, item.symbol)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-text hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!query.trim() && history.length === 0 && (
              <div className="p-6 text-center text-slate-text text-xs">
                พิมพ์เพื่อค้นหาหุ้น
              </div>
            )}

            {query.trim().length > 0 && results.length === 0 && !isLoading && (
              <div className="p-6 text-center text-slate-text text-xs">
                ไม่พบข้อมูลหุ้นที่คุณค้นหา
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <p className="text-[11px] text-slate-text mt-2 pl-1">
        หุ้นปัจจุบันที่เลือก: <strong className="text-lavender font-bold">{selectedSymbol}</strong>
      </p>
    </div>
  );
}
