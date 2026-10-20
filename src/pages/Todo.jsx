import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';

const FILTERS = {
  all: () => true,
  active: (t) => !t.done,
  done: (t) => t.done,
};

export default function Todo() {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');

  function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setTodos([...todos, { id: crypto.randomUUID(), title: title.trim(), done: false }]);
    setTitle('');
  }

  function toggleTodo(id) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTodo(id) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  const remaining = todos.filter((t) => !t.done).length;
  const completed = todos.length - remaining;
  const visible = todos.filter(FILTERS[filter]);

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{todos.length ? `${remaining} of ${todos.length} remaining` : 'Nothing planned yet'}</p>
          <h1 className="page-title">Todo</h1>
        </div>
      </header>

      <form onSubmit={addTodo} className="todo-add card">
        <Icon name="plus" size={18} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task and press Enter" />
        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>Add</button>
      </form>

      {todos.length > 0 && (
        <div className="todo-toolbar">
          <div className="tabs">
            {Object.keys(FILTERS).map((key) => (
              <button key={key} type="button" className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>
                {key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          {completed > 0 && (
            <button type="button" className="link" onClick={() => setTodos(todos.filter((t) => !t.done))}>
              Clear completed
            </button>
          )}
        </div>
      )}

      {todos.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">All clear</p>
          <p>Add a task above to get started.</p>
        </div>
      ) : visible.length === 0 ? (
        <p className="meta center">{filter === 'done' ? 'Nothing completed yet.' : 'Everything is done. Nice.'}</p>
      ) : (
        <ul className="todos card">
          {visible.map((todo) => (
            <li key={todo.id} className={todo.done ? 'done' : ''}>
              <label>
                <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />
                <span className="checkmark" aria-hidden="true" />
                <span className="todo-title">{todo.title}</span>
              </label>
              <button type="button" className="icon-btn" onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.title}`}>
                <Icon name="trash" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
