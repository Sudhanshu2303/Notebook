import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import useJournal from '../hooks/useJournal.js';
import useTodos from '../hooks/useTodos.js';

export default function Sidebar({ theme, onToggleTheme, onNavigate }) {
  const navigate = useNavigate();
  const { entries } = useJournal();
  const { tasks } = useTodos();
  const [menuOpen, setMenuOpen] = useState(false);
  const openTasks = tasks.filter((t) => t.status !== 'done').length;

  function go(path, state) {
    setMenuOpen(false);
    onNavigate();
    navigate(path, { state });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="logo" aria-hidden="true">
          <Icon name="book" size={15} />
        </span>
        Notebook
      </div>

      <div
        className="new-menu"
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setMenuOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setMenuOpen(false)}
      >
        <button type="button" className="new-btn" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
          <Icon name="plus" size={16} />
          New
        </button>
        {menuOpen && (
          <div className="new-menu-list" role="menu">
            <button type="button" role="menuitem" onClick={() => go('/journal/new')}>
              <Icon name="book" size={16} />
              Journal entry
            </button>
            <button type="button" role="menuitem" onClick={() => go('/tasks', { focusComposer: true })}>
              <Icon name="check" size={16} />
              Task
            </button>
          </div>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Sections">
        <NavLink to="/journal" className="sidebar-link" onClick={onNavigate}>
          <Icon name="book" size={17} />
          Journal
          {entries.length > 0 && <span className="count">{entries.length}</span>}
        </NavLink>
        <NavLink to="/tasks" end className="sidebar-link" onClick={onNavigate}>
          <Icon name="check" size={17} />
          Tasks
          {openTasks > 0 && <span className="count">{openTasks}</span>}
        </NavLink>
        <NavLink to="/tasks/history" className="sidebar-link sub" onClick={onNavigate}>
          <Icon name="clock" size={16} />
          History
        </NavLink>
      </nav>

      <div className="sidebar-foot">
        <button type="button" className="sidebar-link theme-toggle" onClick={onToggleTheme}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  );
}
