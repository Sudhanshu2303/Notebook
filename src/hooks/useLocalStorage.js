import { useCallback, useRef, useSyncExternalStore } from 'react';

// A tiny shared store over localStorage: every component using the same key sees
// the same value and re-renders when any of them writes it. Writes are synchronous,
// so they survive an immediate unmount (e.g. save, then navigate away).
const cache = new Map();
const listeners = new Map();

function read(key, initialValue) {
  if (!cache.has(key)) {
    let value = initialValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) value = JSON.parse(stored);
    } catch {
      // Unreadable or unavailable storage: fall back to the initial value.
    }
    cache.set(key, value);
  }
  return cache.get(key);
}

function notify(key) {
  listeners.get(key)?.forEach((listener) => listener());
}

function write(key, value) {
  cache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota); keep the in-memory value.
  }
  notify(key);
}

// Keep other open tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && listeners.has(e.key)) {
      cache.delete(e.key);
      notify(e.key);
    }
  });
}

export default function useLocalStorage(key, initialValue) {
  const initialRef = useRef(initialValue);

  const subscribe = useCallback(
    (listener) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(listener);
      return () => listeners.get(key).delete(listener);
    },
    [key]
  );

  const value = useSyncExternalStore(subscribe, () => read(key, initialRef.current));

  const setValue = useCallback(
    (next) => {
      const prev = read(key, initialRef.current);
      write(key, typeof next === 'function' ? next(prev) : next);
    },
    [key]
  );

  return [value, setValue];
}
