import { NavLink, Outlet } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';

export default function TasksLayout() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="display">Tasks</h1>
        </div>
        <nav className="tabs" aria-label="Task views">
          <NavLink to="/tasks" end>
            <Icon name="check" size={15} />
            Tasks
          </NavLink>
          <NavLink to="/tasks/history">
            <Icon name="clock" size={15} />
            History
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
