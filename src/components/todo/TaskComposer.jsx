import { useState } from 'react';
import Icon from '../Icon.jsx';
import DuePicker from './DuePicker.jsx';
import { PRIORITIES, newTask } from '../../lib/todos.js';

export default function TaskComposer({ onAdd }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('none');
  const [due, setDue] = useState(null);
  const open = title.trim().length > 0;

  function submit(e) {
    e.preventDefault();
    if (!open) return;
    onAdd(newTask({ title, priority, due }));
    setTitle('');
    setPriority('none');
    setDue(null);
  }

  return (
    <form onSubmit={submit} className={`composer card${open ? ' open' : ''}`}>
      <div className="composer-main">
        <Icon name="plus" size={18} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task and press Enter" />
        <button type="submit" className="btn btn-primary" disabled={!open}>Add</button>
      </div>
      {open && (
        <div className="composer-options">
          <div className="priority-chips" role="radiogroup" aria-label="Priority">
            {PRIORITIES.filter((p) => p.value !== 'none').map((p) => (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={priority === p.value}
                className={`chip flag-chip flag-${p.value}${priority === p.value ? ' active' : ''}`}
                onClick={() => setPriority(priority === p.value ? 'none' : p.value)}
              >
                <Icon name="flag" size={13} />
                {p.label}
              </button>
            ))}
          </div>
          <DuePicker value={due} onChange={setDue} />
        </div>
      )}
    </form>
  );
}
