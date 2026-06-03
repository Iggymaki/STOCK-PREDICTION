import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    // ใช้ Yahoo Finance API แบบฟรี สำหรับ Autocomplete
    const response = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Yahoo Finance');
    }

    const data = await response.json();
    const quotes = data.quotes || [];

    // กรองเอาเฉพาะข้อมูลที่จำเป็น
    const results = quotes
      .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'CRYPTOCURRENCY' || q.quoteType === 'ETF')
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
        type: q.quoteType,
      }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
