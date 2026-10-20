import { toDateKey } from './journal.js';

const DAY = 24 * 60 * 60 * 1000;

export const RANGES = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: 'all', label: 'All time' },
];

export const EVENT_TYPES = {
  created: { label: 'Created', icon: 'plus', tone: 'info' },
  started: { label: 'Started', icon: 'play', tone: 'warning' },
  paused: { label: 'Moved back to to do', icon: 'pause', tone: 'muted' },
  completed: { label: 'Completed', icon: 'checkCircle', tone: 'success' },
  reopened: { label: 'Reopened', icon: 'rotate', tone: 'warning' },
  deleted: { label: 'Deleted', icon: 'trash', tone: 'danger' },
};

export const RECORD_STATUS = {
  todo: 'To do',
  doing: 'In progress',
  done: 'Done',
  deleted: 'Deleted',
};

export function rangeStart(range) {
  return range === 'all' ? 0 : Date.now() - Number(range) * DAY;
}

export function makeEvent(type, task, at = Date.now()) {
  return { id: crypto.randomUUID(), taskId: task.id, title: task.title, type, at };
}

export function statusChangeType(from, to) {
  if (from === to) return null;
  if (to === 'done') return 'completed';
  if (from === 'done') return 'reopened';
  return to === 'doing' ? 'started' : 'paused';
}

// Builds a starting history from tasks that existed before history was tracked.
export function seedHistory(tasks) {
  const events = [];
  for (const task of tasks) {
    if (task.createdAt) events.push(makeEvent('created', task, task.createdAt));
    if (task.status === 'done' && task.completedAt) events.push(makeEvent('completed', task, task.completedAt));
  }
  return events.sort((a, b) => a.at - b.at);
}

// One record per task ever seen, including deleted ones, with its key timestamps.
export function buildRecords(events, tasks) {
  const records = new Map();
  const recordFor = (taskId, title) => {
    if (!records.has(taskId)) {
      records.set(taskId, { taskId, title, createdAt: null, startedAt: null, completedAt: null, deletedAt: null, status: null });
    }
    return records.get(taskId);
  };

  for (const e of [...events].sort((a, b) => a.at - b.at)) {
    const r = recordFor(e.taskId, e.title);
    r.title = e.title;
    if (e.type === 'created') r.createdAt = e.at;
    else if (e.type === 'started') r.startedAt ??= e.at;
    else if (e.type === 'completed') r.completedAt = e.at;
    else if (e.type === 'reopened') r.completedAt = null;
    else if (e.type === 'deleted') r.deletedAt = e.at;
  }

  for (const task of tasks) {
    const r = recordFor(task.id, task.title);
    r.title = task.title;
    r.status = task.status;
    r.createdAt ??= task.createdAt || null;
    if (task.status === 'done') r.completedAt ??= task.completedAt;
  }

  for (const r of records.values()) r.status ??= 'deleted';

  const sortKey = (r) => r.createdAt ?? r.completedAt ?? r.deletedAt ?? 0;
  return [...records.values()].sort((a, b) => sortKey(b) - sortKey(a));
}

export function timeToComplete(record) {
  return record.createdAt && record.completedAt ? record.completedAt - record.createdAt : null;
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(ts) {
  return `${formatDate(ts)} at ${formatTime(ts)}`;
}

export function formatDuration(ms) {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return 'under a minute';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const restMin = minutes % 60;
  if (hours < 24) return restMin ? `${hours}h ${restMin}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const restH = hours % 24;
  return restH ? `${days}d ${restH}h` : `${days}d`;
}

export function dayLabel(ts) {
  const key = toDateKey(new Date(ts));
  const today = new Date();
  if (key === toDateKey(today)) return 'Today';
  today.setDate(today.getDate() - 1);
  if (key === toDateKey(today)) return 'Yesterday';
  const date = new Date(ts);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

function csvTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${toDateKey(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function recordsToCSV(records) {
  const rows = [['Task', 'Status', 'Created', 'Started', 'Completed', 'Deleted', 'Minutes to complete']];
  for (const r of records) {
    const duration = timeToComplete(r);
    rows.push([
      r.title,
      RECORD_STATUS[r.status],
      csvTime(r.createdAt),
      csvTime(r.startedAt),
      csvTime(r.completedAt),
      csvTime(r.deletedAt),
      duration === null ? '' : Math.round(duration / 60000),
    ]);
  }
  return rows.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
}
