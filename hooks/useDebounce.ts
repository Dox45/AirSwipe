import { useState, useEffect } from 'react';

/**
 * A hook that returns a debounced value that only updates after a specified delay
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns A tuple containing the debounced value
 */
export default function useDebounce<T>(value: T, delay: number): [T] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value changes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return [debouncedValue];
}
