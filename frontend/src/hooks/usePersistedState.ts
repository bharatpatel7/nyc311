import { useState, useEffect } from "react";

/**
 * A useState wrapper that syncs the value to localStorage under key
 * - Initialises from localStorage so the value survives page refreshes
 * - Setting the value to undefined removes the key from localStorage
 *
 * Generic T is constrained to string because localStorage only stores strings
 */
export const usePersistedState = <T extends string = string>(key: string) => {
  const [value, setValueState] = useState<T | undefined>(() => {
    // read the initial value from localStorage on first render
    return (localStorage.getItem(key) as T) ?? undefined;
  });

  // keep localStorage in sync whenever the value changes
  useEffect(() => {
    if (value !== undefined) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }, [key, value]);

  const setValue = (next: T | undefined) => setValueState(next);

  return { value, setValue };
};
