import { useState, useEffect } from 'react';

/**
 * Hook สำหรับหน่วงเวลาการอัปเดตค่า (ใช้สำหรับพิมพ์ค้นหาเพื่อไม่ให้ยิง API ถี่เกินไป)
 * @param value ค่าที่ต้องการ debounce
 * @param delay เวลาที่หน่วง (milliseconds)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // ตั้ง timer ใหม่ทุกครั้งที่ value เปลี่ยน
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // clear timer เก่าถ้า value เปลี่ยนก่อนถึงเวลา
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
