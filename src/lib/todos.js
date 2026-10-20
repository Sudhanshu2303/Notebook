import { parseDateKey, toDateKey } from './journal.js';

export const STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'doing', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export const PRIORITIES = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const DUE_FILTERS = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Next 7 days' },
  { value: 'none', label: 'No date' },
];

export const SORTS = [
  { value: 'smart', label: 'Smart' },
  { value: 'due', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'newest', label: 'Newest' },
];

const PRIORITY_RANK = { high: 0, medium: 1, low: 2, none: 3 };

export function dayKeyFromToday(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toDateKey(d);
}

export function newTask({ title, priority = 'none', due = null }) {
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    notes: '',
    status: 'todo',
    priority,
    due,
    subtasks: [],
    createdAt: Date.now(),
    completedAt: null,
  };
}

// Fills in fields missing from older tasks (the first version stored only { id, title, done }).
export function normalizeTask(task) {
  const status = task.status ?? (task.done ? 'done' : 'todo');
  return {
    id: task.id,
    title: task.title ?? '',
    notes: task.notes ?? '',
    status,
    priority: task.priority ?? 'none',
    due: task.due ?? null,
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
    createdAt: task.createdAt ?? 0,
    completedAt: status === 'done' ? task.completedAt ?? null : null,
  };
}

export function dueState(due) {
  if (!due) return null;
  const today = dayKeyFromToday(0);
  if (due < today) return 'overdue';
  if (due === today) return 'today';
  if (due <= dayKeyFromToday(7)) return 'soon';
  return 'later';
}

export function formatDue(due) {
  if (!due) return '';
  if (due === dayKeyFromToday(0)) return 'Today';
  if (due === dayKeyFromToday(1)) return 'Tomorrow';
  if (due === dayKeyFromToday(-1)) return 'Yesterday';
  const date = parseDateKey(due);
  const state = dueState(due);
  if (state === 'soon') return date.toLocaleDateString(undefined, { weekday: 'long' });
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}

export function matchesDue(task, filter) {
  if (!filter) return true;
  const state = dueState(task.due);
  if (filter === 'none') return !task.due;
  if (filter === 'overdue') return state === 'overdue';
  if (filter === 'today') return state === 'today';
  if (filter === 'week') return state === 'today' || state === 'soon';
  return true;
}

const byDue = (a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999');
const byPriority = (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
const byNewest = (a, b) => b.createdAt - a.createdAt;
const URGENCY_RANK = { overdue: 0, today: 1, soon: 2 };
const urgency = (t) => URGENCY_RANK[dueState(t.due)] ?? 3;
const byUrgency = (a, b) => urgency(a) - urgency(b);

const SORTERS = {
  // In-progress first, then anything overdue / due today / due this week, then by priority.
  smart: (a, b) =>
    (a.status === 'doing' ? 0 : 1) - (b.status === 'doing' ? 0 : 1) ||
    byUrgency(a, b) ||
    byPriority(a, b) ||
    byDue(a, b) ||
    byNewest(a, b),
  due: (a, b) => byDue(a, b) || byPriority(a, b),
  priority: (a, b) => byPriority(a, b) || byDue(a, b),
  newest: byNewest,
};

export function sortTasks(tasks, sort) {
  return [...tasks].sort(SORTERS[sort] ?? SORTERS.smart);
}

export function subtaskProgress(task) {
  const total = task.subtasks.length;
  const done = task.subtasks.filter((s) => s.done).length;
  return { done, total };
}
