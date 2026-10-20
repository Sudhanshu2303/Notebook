import { useMemo } from 'react';
import useLocalStorage from './useLocalStorage.js';
import { normalizeTask } from '../lib/todos.js';

export default function useTodos() {
  const [raw, setRaw] = useLocalStorage('todos', []);

  const tasks = useMemo(() => raw.map(normalizeTask), [raw]);

  function addTask(task) {
    setRaw((prev) => [...prev, task]);
  }

  function updateTask(id, patch) {
    setRaw((prev) => prev.map((t) => (t.id === id ? { ...normalizeTask(t), ...patch } : t)));
  }

  function deleteTask(id) {
    setRaw((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setRaw((prev) => prev.filter((t) => normalizeTask(t).status !== 'done'));
  }

  return { tasks, addTask, updateTask, deleteTask, clearCompleted };
}
