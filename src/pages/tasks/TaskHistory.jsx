import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Segmented from '../../components/todo/Segmented.jsx';
import useLocalStorage from '../../hooks/useLocalStorage.js';
import useTodos from '../../hooks/useTodos.js';
import {
  EVENT_TYPES,
  RANGES,
  RECORD_STATUS,
  buildRecords,
  dayLabel,
  formatDate,
  formatDateTime,
  formatDuration,
  formatTime,
  rangeStart,
  recordsToCSV,
  timeToComplete,
} from '../../lib/history.js';

const VIEWS = [
  { value: 'timeline', label: 'Timeline' },
  { value: 'tasks', label: 'By task' },
];

export default function TaskHistory() {
  const { tasks, events, clearHistory, deleteEvent, deleteTaskHistory, restoreEvents } = useTodos();
  const [undo, setUndo] = useState(null);

  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(timer);
  }, [undo]);

  function removeEvent(event) {
    const removed = deleteEvent(event.id);
    if (removed.length) setUndo({ events: removed, text: 'Event removed', key: Date.now() });
  }

  function removeTaskHistory(record) {
    const removed = deleteTaskHistory(record.taskId);
    if (removed.length) setUndo({ events: removed, text: `History for "${record.title}" removed`, key: Date.now() });
  }

  function undoRemove() {
    restoreEvents(undo.events);
    setUndo(null);
  }
  const [range, setRange] = useLocalStorage('history-range', '30');
  const [view, setView] = useLocalStorage('history-view', 'timeline');
  const [query, setQuery] = useState('');

  const records = useMemo(() => buildRecords(events, tasks), [events, tasks]);
  const recordById = useMemo(() => new Map(records.map((r) => [r.taskId, r])), [records]);

  const since = rangeStart(range);
  const q = query.trim().toLowerCase();
  const matches = (title) => !q || title.toLowerCase().includes(q);

  const visibleEvents = events
    .filter((e) => e.at >= since && matches(recordById.get(e.taskId)?.title ?? e.title))
    .sort((a, b) => b.at - a.at);
  const visibleRecords = records.filter(
    (r) => ((r.createdAt ?? 0) >= since || (r.completedAt ?? 0) >= since || (r.deletedAt ?? 0) >= since) && matches(r.title)
  );

  // Summary for the selected range.
  const createdInRange = records.filter((r) => r.createdAt && r.createdAt >= since);
  const completedInRange = records.filter((r) => r.completedAt && r.completedAt >= since);
  const durations = completedInRange.map(timeToComplete).filter((d) => d !== null);
  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
  const completionRate = createdInRange.length
    ? Math.round((createdInRange.filter((r) => r.completedAt).length / createdInRange.length) * 100)
    : null;

  function exportCSV() {
    const blob = new Blob([recordsToCSV(visibleRecords)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function confirmClear() {
    if (window.confirm('Clear all task history? Your current tasks stay, but the log of past activity is removed.')) {
      clearHistory();
    }
  }

  if (events.length === 0 && tasks.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><Icon name="clock" size={22} /></span>
        <p className="empty-title">No history yet</p>
        <p>Every task you create, start, finish or delete will be logged here with its date and time.</p>
        <Link to="/tasks" className="btn btn-primary">Add a task</Link>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-label">Created</span>
          <span className="stat-value">{createdInRange.length}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{completedInRange.length}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Completion rate</span>
          <span className="stat-value">{completionRate === null ? '–' : `${completionRate}%`}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Avg. time to finish</span>
          <span className="stat-value stat-value-sm">{avgDuration === null ? '–' : formatDuration(avgDuration)}</span>
        </div>
      </div>

      <div className="history-toolbar">
        <div className="history-toolbar-left">
          <Segmented label="View" options={VIEWS} value={view} onChange={setView} />
          <Segmented label="Range" options={RANGES} value={range} onChange={setRange} />
        </div>
        <div className="history-toolbar-right">
          <label className="search">
            <Icon name="search" size={15} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search history" />
          </label>
          <button type="button" className="btn btn-secondary btn-sm" onClick={exportCSV} disabled={!visibleRecords.length}>
            <Icon name="download" size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {view === 'timeline' ? (
        <Timeline events={visibleEvents} recordById={recordById} onRemove={removeEvent} />
      ) : (
        <RecordTable records={visibleRecords} onRemove={removeTaskHistory} />
      )}

      {events.length > 0 && (
        <div className="history-foot">
          <span className="meta">
            Tracking since {formatDate(Math.min(...events.map((e) => e.at)))} · {events.length} events logged
          </span>
          <button type="button" className="link danger" onClick={confirmClear}>Clear history</button>
        </div>
      )}

      {undo && (
        <div className="flash flash-action" role="status" key={undo.key}>
          <span>{undo.text}</span>
          <button type="button" onClick={undoRemove}>Undo</button>
        </div>
      )}
    </div>
  );
}

function groupByDay(events) {
  const groups = [];
  for (const e of events) {
    const label = dayLabel(e.at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.events.push(e);
    else groups.push({ label, events: [e] });
  }
  return groups;
}

function Timeline({ events, recordById, onRemove }) {
  if (events.length === 0) return <p className="meta center">No activity in this range.</p>;

  return (
    <div className="timeline">
      {groupByDay(events).map((group) => (
        <section key={group.label} className="timeline-day">
          <h3 className="timeline-day-label">{group.label}</h3>
          <ol className="card timeline-list">
            {group.events.map((e) => {
              const type = EVENT_TYPES[e.type];
              const record = recordById.get(e.taskId);
              const title = record?.title ?? e.title;
              return (
                <li key={e.id} className={`event tone-${type.tone}`}>
                  <time className="event-time" dateTime={new Date(e.at).toISOString()}>
                    {formatTime(e.at)}
                  </time>
                  <span className="event-icon">
                    <Icon name={type.icon} size={14} />
                  </span>
                  <div className="event-body">
                    <p className="event-text">
                      <span className="event-type">{type.label}</span> <strong>{title}</strong>
                    </p>
                    <EventDetail event={e} record={record} />
                  </div>
                  <button
                    type="button"
                    className="icon-btn danger row-remove"
                    onClick={() => onRemove(e)}
                    aria-label={`Remove "${type.label} ${title}" from history`}
                    title="Remove from history"
                  >
                    <Icon name="x" size={15} />
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

function EventDetail({ event, record }) {
  if (!record) return null;
  if (event.type === 'completed' && record.createdAt) {
    return (
      <p className="event-sub">
        Created {formatDateTime(record.createdAt)} · took {formatDuration(event.at - record.createdAt)}
      </p>
    );
  }
  if (event.type === 'created' && record.completedAt) {
    return <p className="event-sub">Completed {formatDateTime(record.completedAt)}</p>;
  }
  if (event.type === 'deleted' && record.createdAt) {
    return <p className="event-sub">Created {formatDateTime(record.createdAt)}</p>;
  }
  return null;
}

function DateCell({ ts, empty = '—' }) {
  if (!ts) return <span className="muted">{empty}</span>;
  return (
    <span className="cell-datetime">
      <span>{formatDate(ts)}</span>
      <span className="muted">{formatTime(ts)}</span>
    </span>
  );
}

function RecordTable({ records, onRemove }) {
  if (records.length === 0) return <p className="meta center">No tasks in this range.</p>;

  return (
    <div className="card record-table-wrap">
      <table className="record-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Created</th>
            <th>Completed</th>
            <th>Time taken</th>
            <th>Status</th>
            <th className="cell-action"><span className="sr-only">Remove</span></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const duration = timeToComplete(r);
            return (
              <tr key={r.taskId}>
                <td data-label="Task" className="cell-title">{r.title}</td>
                <td data-label="Created"><DateCell ts={r.createdAt} empty="Unknown" /></td>
                <td data-label="Completed"><DateCell ts={r.completedAt} empty={r.status === 'deleted' ? 'Never' : 'Not yet'} /></td>
                <td data-label="Time taken">{duration === null ? <span className="muted">—</span> : formatDuration(duration)}</td>
                <td data-label="Status">
                  <span className="cell-status">
                    <span className={`status-pill status-${r.status}`}>{RECORD_STATUS[r.status]}</span>
                    {r.deletedAt && <span className="cell-note muted">on {formatDate(r.deletedAt)}</span>}
                  </span>
                </td>
                <td className="cell-action">
                  <button
                    type="button"
                    className="icon-btn danger row-remove"
                    onClick={() => onRemove(r)}
                    aria-label={`Remove all history for "${r.title}"`}
                    title="Remove this task's history"
                  >
                    <Icon name="x" size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
