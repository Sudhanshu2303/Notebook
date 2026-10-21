import { useEffect, useSyncExternalStore } from 'react';
import useJournal from './useJournal.js';
import useLocalStorage from './useLocalStorage.js';
import { toDateKey } from '../lib/journal.js';

// A mood being picked in the editor, previewed before it's saved. Not persisted.
let preview = null;
const listeners = new Set();

export function setMoodPreview(mood) {
  if (preview === mood) return;
  preview = mood;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Today's latest entry with a mood decides it (index.html applies the same rule before first paint).
export function todayMood(entries) {
  const today = toDateKey(new Date());
  const logged = entries.filter((e) => e.date === today && e.mood);
  if (logged.length === 0) return null;
  return logged.reduce((a, b) => (b.updatedAt > a.updatedAt ? b : a)).mood;
}

// Tints the whole app with the colour of today's mood via <html data-mood>; see "Mood colours" in styles.css.
export default function useMoodTheme(theme) {
  const [enabled, setEnabled] = useLocalStorage('mood-colors', true);
  const { entries } = useJournal();
  const previewMood = useSyncExternalStore(subscribe, () => preview);
  const mood = enabled ? previewMood ?? todayMood(entries) : null;

  useEffect(() => {
    const root = document.documentElement;
    if (mood) root.dataset.mood = mood;
    else delete root.dataset.mood;
    const accent = getComputedStyle(root).getPropertyValue('--accent').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', accent);
  }, [mood, theme]);

  return [enabled, setEnabled];
}
