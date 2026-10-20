import { useEffect, useMemo } from 'react';
import useLocalStorage from './useLocalStorage.js';
import { makeEvent, seedHistory, statusChangeType } from '../lib/history.js';
import { normalizeTask } from '../lib/todos.js';

export default function useTodos() {
  const [raw, setRaw] = useLocalStorage('todos', []);
  const [history, setHistory] = useLocalStorage('todo-history', null);

  const tasks = useMemo(() => raw.map(normalizeTask), [raw]);
  const events = history ?? [];

  // First run with history tracking: backfill from the tasks' own timestamps.
  useEffect(() => {
    if (history === null) setHistory(seedHistory(raw.map(normalizeTask)));
  }, [history, raw, setHistory]);

  const log = (...newEvents) => setHistory((prev) => [...(prev ?? []), ...newEvents]);

  function addTask(task) {
    setRaw((prev) => [...prev, task]);
    log(makeEvent('created', task, task.createdAt));
  }

  function updateTask(id, patch) {
    const current = tasks.find((t) => t.id === id);
    setRaw((prev) => prev.map((t) => (t.id === id ? { ...normalizeTask(t), ...patch } : t)));
    const type = current && patch.status ? statusChangeType(current.status, patch.status) : null;
    if (type) log(makeEvent(type, { ...current, ...patch }));
  }

  function deleteTask(id) {
    const current = tasks.find((t) => t.id === id);
    setRaw((prev) => prev.filter((t) => t.id !== id));
    if (current) log(makeEvent('deleted', current));
  }

  function clearCompleted() {
    const done = tasks.filter((t) => t.status === 'done');
    setRaw((prev) => prev.filter((t) => normalizeTask(t).status !== 'done'));
    if (done.length) log(...done.map((t) => makeEvent('deleted', t)));
  }

  function clearHistory() {
    setHistory([]);
  }

  return { tasks, events, addTask, updateTask, deleteTask, clearCompleted, clearHistory };
}
