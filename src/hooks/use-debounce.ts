import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout để update giá trị sau khoảng delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout nếu value thay đổi trước khi hết thời gian (người dùng gõ tiếp)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}