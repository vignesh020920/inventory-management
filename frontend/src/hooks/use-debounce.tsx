import { useEffect, useRef, useState } from "react";

type Timeout = ReturnType<typeof setTimeout>;

/**
 * A custom hook that debounces a value with optimal performance
 * @param value The value to debounce
 * @param delay The debounce delay in milliseconds (default: 300ms)
 * @param options Optional configuration
 * @param options.equalityFn Function to determine if value changed (default: shallow compare)
 * @param options.maxWait Maximum wait time before forcing update (similar to lodash's debounce)
 */

export function useDebounce<T>(
  value: T,
  delay: number = 300,
  options: {
    equalityFn?: (a: T, b: T) => boolean;
    maxWait?: number;
  } = {}
): T {
  const { equalityFn = (a, b) => a === b, maxWait } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<Timeout | null>(null);
  const maxTimeoutRef = useRef<Timeout | null>(null);
  const valueRef = useRef<T>(value);
  const firstRender = useRef(true);

  const clearAllTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (equalityFn(valueRef.current, value)) {
      return;
    }

    valueRef.current = value;
    clearAllTimeouts();

    // Set maxWait timeout if specified
    if (maxWait !== undefined) {
      maxTimeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        maxTimeoutRef.current = null;
      }, maxWait);
    }

    // Set regular debounce timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
        maxTimeoutRef.current = null;
      }
    }, delay);

    return clearAllTimeouts;
  }, [value, delay, equalityFn, maxWait]);

  return debouncedValue;
}
