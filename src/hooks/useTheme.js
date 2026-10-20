import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage.js';

const systemTheme = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// Follows the system theme until the user picks one; index.html applies it before first paint.
export default function useTheme() {
  const [theme, setTheme] = useLocalStorage('theme', systemTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return [theme, () => setTheme(theme === 'dark' ? 'light' : 'dark')];
}
