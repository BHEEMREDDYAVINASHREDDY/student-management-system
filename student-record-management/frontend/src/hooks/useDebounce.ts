import { useEffect, useState } from 'react';

// Delays updating the returned value until the input has stopped changing for `delay` ms.
// Used to avoid firing a network request on every keystroke in search boxes.
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
