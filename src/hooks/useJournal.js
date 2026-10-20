import { useMemo } from 'react';
import useLocalStorage from './useLocalStorage.js';
import { compareEntries, normalizeEntry } from '../lib/journal.js';

export default function useJournal() {
  const [raw, setRaw] = useLocalStorage('journal-entries', []);

  const entries = useMemo(() => raw.map(normalizeEntry).sort(compareEntries), [raw]);

  function saveEntry(entry) {
    setRaw((prev) => {
      const exists = prev.some((e) => e.id === entry.id);
      return exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [...prev, entry];
    });
  }

  function deleteEntry(id) {
    setRaw((prev) => prev.filter((e) => e.id !== id));
  }

  function getEntry(id) {
    return entries.find((e) => e.id === id) ?? null;
  }

  return { entries, saveEntry, deleteEntry, getEntry };
}
