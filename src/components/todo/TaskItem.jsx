import { useState } from 'react';
import Icon from '../Icon.jsx';
import DuePicker from './DuePicker.jsx';
import Segmented from './Segmented.jsx';
import { PRIORITIES, STATUSES, dueState, formatDue, subtaskProgress } from '../../lib/todos.js';
import { uid } from '../../lib/id.js';

export default function TaskItem({ task, expanded, onToggleExpand, onSetStatus, onUpdate, onDelete }) {
  const done = task.status === 'done';
  const sub = subtaskProgress(task);
  const due = dueState(task.due);
  const priority = PRIORITIES.find((p) => p.value === task.priority);

  return (
    <li className={`task priority-${task.priority} status-${task.status}${expanded ? ' expanded' : ''}`}>
      <div className="task-row">
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? `Mark "${task.title}" as not done` : `Complete "${task.title}"`}
          className="task-check"
          onClick={(e) => onSetStatus(done ? 'todo' : 'done', e.currentTarget)}
        />
        <button type="button" className="task-body" onClick={onToggleExpand} aria-expanded={expanded}>
          <span className="task-title">{task.title}</span>
          <span className="task-meta">
            {task.status === 'doing' && (
              <span className="pill pill-doing">
                <span className="pulse" />
                In progress
              </span>
            )}
            {!done && task.priority !== 'none' && (
              <span className={`flag flag-${task.priority}`}>
                <Icon name="flag" size={12} />
                {priority.label}
              </span>
            )}
            {!done && task.due && (
              <span className={`due due-${due}`}>
                <Icon name="calendar" size={12} />
                {due === 'overdue' ? `Overdue · ${formatDue(task.due)}` : formatDue(task.due)}
              </span>
            )}
            {sub.total > 0 && (
              <span className="sub-progress">
                <span className="mini-bar">
                  <span style={{ width: `${(sub.done / sub.total) * 100}%` }} />
                </span>
                {sub.done}/{sub.total}
              </span>
            )}
            {task.notes && (
              <span className="has-notes" title="Has notes">
                <Icon name="note" size={12} />
              </span>
            )}
            {done && (
              <span className="completed-at">
                Completed
                {task.completedAt &&
                  ` ${new Date(task.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
              </span>
            )}
          </span>
        </button>
        <span className="task-chevron" aria-hidden="true">
          <Icon name="chevron" size={16} />
        </span>
        <button type="button" className="icon-btn" onClick={onDelete} aria-label={`Delete "${task.title}"`}>
          <Icon name="trash" size={16} />
        </button>
      </div>
      {expanded && <TaskDetails task={task} onUpdate={onUpdate} onSetStatus={onSetStatus} />}
    </li>
  );
}

function TaskDetails({ task, onUpdate, onSetStatus }) {
  const [subText, setSubText] = useState('');
  const sub = subtaskProgress(task);

  function addSubtask(e) {
    e.preventDefault();
    if (!subText.trim()) return;
    onUpdate({ subtasks: [...task.subtasks, { id: uid(), title: subText.trim(), done: false }] });
    setSubText('');
  }

  const toggleSubtask = (id) =>
    onUpdate({ subtasks: task.subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)) });
  const removeSubtask = (id) => onUpdate({ subtasks: task.subtasks.filter((s) => s.id !== id) });

  return (
    <div className="task-details">
      <input
        className="task-edit-title"
        value={task.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        onBlur={(e) => !e.target.value.trim() && onUpdate({ title: 'Untitled task' })}
        aria-label="Task title"
      />

      <div className="detail-grid">
        <div className="field">
          <span className="field-label">Status</span>
          <Segmented label="Status" options={STATUSES} value={task.status} onChange={(s) => onSetStatus(s)} />
        </div>
        <div className="field">
          <span className="field-label">Priority</span>
          <Segmented label="Priority" options={PRIORITIES} value={task.priority} onChange={(priority) => onUpdate({ priority })} />
        </div>
        <div className="field field-wide">
          <span className="field-label">Due</span>
          <DuePicker value={task.due} onChange={(due) => onUpdate({ due })} />
        </div>
      </div>

      <div className="field">
        <span className="field-label">
          Subtasks{sub.total > 0 && ` · ${sub.done} of ${sub.total}`}
        </span>
        {sub.total > 0 && (
          <div className="progress-bar thin">
            <div className="progress-fill" style={{ width: `${(sub.done / sub.total) * 100}%` }} />
          </div>
        )}
        <ul className="subtasks">
          {task.subtasks.map((s) => (
            <li key={s.id} className={s.done ? 'done' : ''}>
              <button
                type="button"
                role="checkbox"
                aria-checked={s.done}
                className="sub-check"
                onClick={() => toggleSubtask(s.id)}
                aria-label={s.title}
              />
              <span>{s.title}</span>
              <button type="button" className="icon-btn" onClick={() => removeSubtask(s.id)} aria-label={`Remove ${s.title}`}>
                <Icon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addSubtask} className="subtask-add">
          <Icon name="plus" size={14} />
          <input value={subText} onChange={(e) => setSubText(e.target.value)} placeholder="Add a subtask" />
        </form>
      </div>

      <div className="field">
        <span className="field-label">Notes</span>
        <textarea
          className="task-notes"
          value={task.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Links, details, anything useful…"
          rows={3}
        />
      </div>
    </div>
  );
}
