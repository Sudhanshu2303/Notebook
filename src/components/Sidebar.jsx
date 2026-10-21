import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import useJournal from '../hooks/useJournal.js';
import useTodos from '../hooks/useTodos.js';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'Auto', icon: 'monitor' },
];

export default function Sidebar({
  themePreference,
  onSetThemePreference,
  moodColors,
  onSetMoodColors,
  onReplayWelcome,
  onNavigate,
}) {
  const navigate = useNavigate();
  const { entries } = useJournal();
  const { tasks } = useTodos();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openTasks = tasks.filter((t) => t.status !== 'done').length;

  function go(path, state) {
    setMenuOpen(false);
    onNavigate();
    navigate(path, { state });
  }

  return (
    <aside className="sidebar">
      {/* On phones the sidebar is a drawer; tapping the brand closes it. */}
      <button type="button" className="sidebar-brand" onClick={onNavigate} aria-label="Close menu">
        <span className="logo" aria-hidden="true">
          <Icon name="book" size={15} />
        </span>
        Notebook
      </button>

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
        {/* History is a tab inside Tasks, so Tasks stays highlighted there too. */}
        <NavLink to="/tasks" className="sidebar-link" onClick={onNavigate}>
          <Icon name="check" size={17} />
          Tasks
          {openTasks > 0 && <span className="count">{openTasks}</span>}
        </NavLink>
      </nav>

      <div
        className="sidebar-foot settings"
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setSettingsOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setSettingsOpen(false)}
      >
        {settingsOpen && (
          <div className="settings-panel" role="dialog" aria-label="Settings">
            <p className="settings-label">Appearance</p>
            <div className="theme-switch" role="radiogroup" aria-label="Theme">
              {THEME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={themePreference === o.value}
                  title={o.value === 'system' ? 'Match your device' : `${o.label} mode`}
                  onClick={() => onSetThemePreference(o.value)}
                >
                  <Icon name={o.icon} size={15} />
                  {o.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={moodColors}
              className="sidebar-link mood-colors-toggle"
              onClick={() => onSetMoodColors(!moodColors)}
              title="Tint the app with the colour of today's mood"
            >
              <Icon name="smile" size={17} />
              Mood colours
              <span className="switch" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="sidebar-link"
              onClick={() => {
                setSettingsOpen(false);
                onNavigate();
                onReplayWelcome();
              }}
            >
              <Icon name="play" size={17} />
              Welcome tour
            </button>
          </div>
        )}
        <button
          type="button"
          className={`sidebar-link settings-btn${settingsOpen ? ' open' : ''}`}
          onClick={() => setSettingsOpen(!settingsOpen)}
          aria-expanded={settingsOpen}
        >
          <Icon name="sliders" size={17} />
          Settings
          <span className="settings-chevron" aria-hidden="true">
            <Icon name="chevron" size={14} />
          </span>
        </button>
      </div>
    </aside>
  );
}
