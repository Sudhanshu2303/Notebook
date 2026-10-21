import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Flash from './components/Flash.jsx';
import Icon from './components/Icon.jsx';
import Sidebar from './components/Sidebar.jsx';
import Welcome from './components/Welcome.jsx';
import useOnboarding from './hooks/useOnboarding.js';
import useTheme from './hooks/useTheme.js';
import JournalEditor from './pages/journal/JournalEditor.jsx';
import JournalHome from './pages/journal/JournalHome.jsx';
import JournalLayout from './pages/journal/JournalLayout.jsx';
import TaskHistory from './pages/tasks/TaskHistory.jsx';
import Tasks from './pages/tasks/Tasks.jsx';
import TasksLayout from './pages/tasks/TasksLayout.jsx';

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showWelcome, finish, replay } = useOnboarding();

  return (
    <div className={`shell${drawerOpen ? ' drawer-open' : ''}`}>
      <Sidebar
        theme={theme}
        onToggleTheme={toggleTheme}
        onReplayWelcome={replay}
        onNavigate={() => setDrawerOpen(false)}
      />
      <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />

      <div className="main">
        <header className="mobile-bar">
          <button type="button" className="icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={20} />
          </button>
          <span className="mobile-brand">
            <span className="logo" aria-hidden="true">
              <Icon name="book" size={13} />
            </span>
            Notebook
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/journal" replace />} />
          <Route path="/journal" element={<JournalLayout />}>
            <Route index element={<JournalHome />} />
            <Route path="new" element={<JournalEditor />} />
            <Route path=":id" element={<JournalEditor />} />
          </Route>
          <Route path="/tasks" element={<TasksLayout />}>
            <Route index element={<Tasks />} />
            <Route path="history" element={<TaskHistory />} />
          </Route>
          <Route path="/todo" element={<Navigate to="/tasks" replace />} />
          <Route path="*" element={<Navigate to="/journal" replace />} />
        </Routes>
      </div>

      <Flash />
      {showWelcome && <Welcome theme={theme} onToggleTheme={toggleTheme} onClose={finish} />}
    </div>
  );
}
