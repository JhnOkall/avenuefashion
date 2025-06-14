import { useState, useEffect } from 'react';

/**
 * A custom React hook that debounces a value.
 *
 * This hook delays updating its output value until a specified amount of time
 * has passed without the input value changing. It's particularly useful for
 * performance-intensive operations that shouldn't be triggered on every render,
 * such as API calls from a search input.
 *
 * @template T The type of the value to be debounced.
 * @param {T} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {T} The debounced value, which will only update after the specified delay.
 */
// TODO: For more complex scenarios, consider using a well-established library like `use-debounce`,
// which offers additional features such as `leading` and `trailing` options.
export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value.
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Set a timer to update the debounced value after the specified delay.
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cleanup function: This will be called if the `value` or `delay` changes
      // before the timeout completes. It clears the previous timer, effectively
      // resetting the debounce period.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Re-run the effect only if the value or delay changes.
  );

  return debouncedValue;
}