export const MOODS = [
  { value: 1, label: 'Awful', emoji: '😞' },
  { value: 2, label: 'Low', emoji: '😕' },
  { value: 3, label: 'Okay', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '🙂' },
  { value: 5, label: 'Great', emoji: '😄' },
];

export const ENERGY_LEVELS = ['Drained', 'Low', 'Steady', 'Good', 'Energized'];

export const moodFor = (value) => MOODS.find((m) => m.value === value) ?? null;

// Local-time YYYY-MM-DD, so entries land on the day the user sees.
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function emptyEntry() {
  return { title: '', body: '', mood: null, energy: null, tags: [], date: toDateKey(new Date()) };
}

// Fills in fields missing from older entries (the first version stored only { id, text, createdAt }).
export function normalizeEntry(entry) {
  const createdAt = entry.createdAt ?? Date.now();
  return {
    id: entry.id,
    title: entry.title ?? '',
    body: entry.body ?? entry.text ?? '',
    mood: entry.mood ?? null,
    energy: entry.energy ?? null,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    date: entry.date ?? toDateKey(new Date(createdAt)),
    createdAt,
    updatedAt: entry.updatedAt ?? createdAt,
  };
}

export function compareEntries(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return b.createdAt - a.createdAt;
}

// Date keys for the last n days, oldest first, ending today.
export function lastNDays(n) {
  const days = [];
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  for (let i = 0; i < n; i++) {
    days.push(toDateKey(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// Consecutive days with at least one entry, ending today (or yesterday, so the streak
// doesn't read as broken before today's entry is written).
export function currentStreak(entries) {
  const days = new Set(entries.map((e) => e.date));
  const d = new Date();
  if (!days.has(toDateKey(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(toDateKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function averageMood(entries) {
  const moods = entries.map((e) => e.mood).filter(Boolean);
  if (moods.length === 0) return null;
  return moods.reduce((sum, m) => sum + m, 0) / moods.length;
}

export function wordCount(text) {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
