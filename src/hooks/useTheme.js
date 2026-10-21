import { useEffect, useState } from 'react';
import useLocalStorage from './useLocalStorage.js';

const darkQuery = () => window.matchMedia?.('(prefers-color-scheme: dark)');
const systemTheme = () => (darkQuery()?.matches ? 'dark' : 'light');

// The stored preference is 'system' (follow the device, live), 'light' or 'dark'.
// index.html applies the same rule before first paint.
export default function useTheme() {
  const [preference, setPreference] = useLocalStorage('theme', 'system');
  const [system, setSystem] = useState(systemTheme);

  useEffect(() => {
    const query = darkQuery();
    if (!query) return;
    const onChange = () => setSystem(systemTheme());
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const theme = preference === 'light' || preference === 'dark' ? preference : system;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Flips light/dark; landing back on the device's theme goes back to following it.
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setPreference(next === system ? 'system' : next);
  }

  return { theme, preference, setPreference, toggle };
}
