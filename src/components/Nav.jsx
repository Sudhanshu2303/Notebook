import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const links = [
  { to: '/journal', label: 'Journal', icon: 'book' },
  { to: '/todo', label: 'Todo', icon: 'check' },
];

export default function Nav() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <span className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Notebook
        </span>
        <nav className="segmented" aria-label="Sections">
          {links.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon name={icon} size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
