import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Confetti from '../components/todo/Confetti.jsx';
import GifCard from '../components/todo/GifCard.jsx';
import ProgressCard from '../components/todo/ProgressCard.jsx';
import TaskComposer from '../components/todo/TaskComposer.jsx';
import TaskItem from '../components/todo/TaskItem.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import useTodos from '../hooks/useTodos.js';
import { CHEERS, pickGif } from '../lib/gifs.js';
import { DUE_FILTERS, PRIORITIES, SORTS, dueState, matchesDue, sortTasks } from '../lib/todos.js';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'doing', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export default function Todo() {
  const { tasks, addTask, updateTask, deleteTask, clearCompleted } = useTodos();
  const [tab, setTab] = useState('all');
  const [dueFilter, setDueFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useLocalStorage('todo-sort', 'smart');
  const [showCompleted, setShowCompleted] = useLocalStorage('todo-show-completed', true);
  const [gifsOn, setGifsOn] = useLocalStorage('todo-gifs', true);
  const [expandedId, setExpandedId] = useState(null);
  const [bursts, setBursts] = useState([]);
  const [toast, setToast] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [allDoneGif] = useState(() => pickGif('allDone'));
  const [emptyGif] = useState(() => pickGif('empty'));

  const counts = useMemo(() => {
    const c = { todo: 0, doing: 0, done: 0, today: 0, overdue: 0 };
    for (const t of tasks) {
      c[t.status]++;
      if (t.status === 'done') continue;
      const due = dueState(t.due);
      if (due === 'today') c.today++;
      if (due === 'overdue') c.overdue++;
    }
    return c;
  }, [tasks]);
  const total = tasks.length;
  const allDone = total > 0 && counts.done === total;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!milestone) return;
    const timer = setTimeout(() => setMilestone(null), 6000);
    return () => clearTimeout(timer);
  }, [milestone]);

  function burst(x, y, big = false) {
    const id = crypto.randomUUID();
    setBursts((b) => [...b, { id, x, y, big }]);
    setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), big ? 1600 : 900);
  }

  function setStatus(task, status, originEl) {
    const completing = status === 'done' && task.status !== 'done';
    updateTask(task.id, { status, completedAt: status === 'done' ? task.completedAt ?? Date.now() : null });
    if (!completing) return;

    if (originEl) {
      const r = originEl.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
    }
    const doneAfter = counts.done + 1;
    if (doneAfter === total) {
      burst(window.innerWidth / 2, window.innerHeight / 3, true);
      setToast({ text: 'Everything done! 🎉', key: Date.now() });
    } else if (gifsOn && total >= 4 && counts.done < total / 2 && doneAfter >= total / 2) {
      setMilestone({ gif: pickGif('halfway'), key: Date.now() });
    } else {
      setToast({ text: CHEERS[Math.floor(Math.random() * CHEERS.length)], key: Date.now() });
    }
  }

  function quickFilter(key) {
    clearFilters();
    if (key === 'todo' || key === 'doing') setTab(key);
    else setDueFilter(key);
  }

  function clearFilters() {
    setTab('all');
    setDueFilter(null);
    setPriorityFilter(null);
    setQuery('');
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        (tab === 'all' || t.status === tab) &&
        matchesDue(t, dueFilter) &&
        (!priorityFilter || t.priority === priorityFilter) &&
        (!q || `${t.title} ${t.notes} ${t.subtasks.map((s) => s.title).join(' ')}`.toLowerCase().includes(q))
    );
  }, [tasks, tab, dueFilter, priorityFilter, query]);

  const active = sortTasks(filtered.filter((t) => t.status !== 'done'), sort);
  const completed = filtered
    .filter((t) => t.status === 'done')
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  const filtering = tab !== 'all' || dueFilter || priorityFilter || query.trim();

  const renderTask = (task) => (
    <TaskItem
      key={task.id}
      task={task}
      expanded={expandedId === task.id}
      onToggleExpand={() => setExpandedId(expandedId === task.id ? null : task.id)}
      onSetStatus={(status, originEl) => setStatus(task, status, originEl)}
      onUpdate={(patch) => updateTask(task.id, patch)}
      onDelete={() => deleteTask(task.id)}
    />
  );

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="page-title">Tasks</h1>
        </div>
        <button
          type="button"
          className={`btn btn-ghost gif-toggle${gifsOn ? ' on' : ''}`}
          onClick={() => setGifsOn(!gifsOn)}
          aria-pressed={gifsOn}
          title="Celebration GIFs"
        >
          <Icon name="image" size={16} />
          GIFs {gifsOn ? 'on' : 'off'}
        </button>
      </header>

      {total > 0 && <ProgressCard counts={counts} total={total} onQuickFilter={quickFilter} />}

      {allDone && (
        <div className="celebrate card">
          {gifsOn && <GifCard gif={allDoneGif} />}
          <div className="celebrate-text">
            <p className="celebrate-title">You cleared your list 🎉</p>
            <p className="meta">Every task is done. Clear them out and plan what's next.</p>
            <button type="button" className="btn btn-primary" onClick={clearCompleted}>Clear completed</button>
          </div>
        </div>
      )}

      <TaskComposer onAdd={addTask} />

      {total === 0 ? (
        <div className="empty-state">
          {gifsOn && <GifCard gif={emptyGif} className="small" />}
          <p className="empty-title">Plan your day</p>
          <p>Add a task above. Set a priority and a due date to keep things moving.</p>
        </div>
      ) : (
        <>
          <div className="task-filters">
            <div className="task-filters-top">
              <div className="tabs" role="tablist">
                {TABS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.value}
                    className={tab === t.value ? 'active' : ''}
                    onClick={() => setTab(t.value)}
                  >
                    {t.label}
                    <span className="tab-count">{t.value === 'all' ? total : counts[t.value]}</span>
                  </button>
                ))}
              </div>
              <label className="sort">
                <span>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="task-filters-bottom">
              <label className="search small">
                <Icon name="search" size={15} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" />
              </label>
              <div className="chips">
                {DUE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`chip${dueFilter === f.value ? ' active' : ''}`}
                    onClick={() => setDueFilter(dueFilter === f.value ? null : f.value)}
                  >
                    {f.label}
                  </button>
                ))}
                <span className="chip-divider" />
                {PRIORITIES.filter((p) => p.value !== 'none')
                  .reverse()
                  .map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`chip flag-chip flag-${p.value}${priorityFilter === p.value ? ' active' : ''}`}
                      onClick={() => setPriorityFilter(priorityFilter === p.value ? null : p.value)}
                    >
                      <Icon name="flag" size={12} />
                      {p.label}
                    </button>
                  ))}
              </div>
            </div>
            {filtering && (
              <p className="meta">
                Showing {filtered.length} of {total} ·{' '}
                <button type="button" className="link" onClick={clearFilters}>clear filters</button>
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state compact">
              <p className="empty-title">No matching tasks</p>
              <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <>
              {active.length > 0 && <ul className="task-list">{active.map(renderTask)}</ul>}
              {active.length === 0 && tab === 'all' && !allDone && (
                <p className="meta center">Nothing active matches these filters.</p>
              )}

              {completed.length > 0 && (
                <div className="completed-section">
                  {tab === 'all' && (
                    <div className="completed-head">
                      <button type="button" className="completed-toggle" onClick={() => setShowCompleted(!showCompleted)} aria-expanded={showCompleted}>
                        <span className={`chev${showCompleted ? ' open' : ''}`}><Icon name="chevron" size={14} /></span>
                        Completed
                        <span className="tab-count">{completed.length}</span>
                      </button>
                      <button type="button" className="link" onClick={clearCompleted}>Clear completed</button>
                    </div>
                  )}
                  {(showCompleted || tab === 'done') && <ul className="task-list completed">{completed.map(renderTask)}</ul>}
                </div>
              )}
            </>
          )}
        </>
      )}

      {bursts.map((b) => (
        <Confetti key={b.id} x={b.x} y={b.y} big={b.big} />
      ))}

      {toast && (
        <div className="flash" role="status" key={toast.key}>
          {toast.text}
        </div>
      )}

      {milestone && (
        <div className="milestone card" role="status" key={milestone.key}>
          <button type="button" className="icon-btn milestone-close" onClick={() => setMilestone(null)} aria-label="Dismiss">
            <Icon name="x" size={14} />
          </button>
          <GifCard gif={milestone.gif} />
          <p className="milestone-title">Halfway there!</p>
          <p className="meta">Keep the momentum going.</p>
        </div>
      )}
    </section>
  );
}
