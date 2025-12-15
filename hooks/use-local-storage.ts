import { useCallback, useEffect, useState } from "react";

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): readonly [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Ignore write errors (quota, privacy mode, etc.)
    }
  }, [key, storedValue]);

  const setValue = useCallback<SetValue<T>>((value) => {
    setStoredValue((prev) => (typeof value === "function" ? (value as (p: T) => T)(prev) : value));
  }, []);

  return [storedValue, setValue] as const;
}

