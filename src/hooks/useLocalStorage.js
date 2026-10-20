import { useCallback, useRef, useState } from 'react';

function read(key, initialValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : initialValue;
  } catch {
    return initialValue;
  }
}

// State that persists to localStorage under the given key.
// Writes happen synchronously in the setter so they survive an immediate unmount
// (e.g. saving and then navigating away in the same handler).
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => read(key, initialValue));
  const valueRef = useRef(value);

  const setStored = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(valueRef.current) : next;
      valueRef.current = resolved;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Storage unavailable (private mode, quota); keep in-memory state.
      }
      setValue(resolved);
    },
    [key]
  );

  return [value, setStored];
}
