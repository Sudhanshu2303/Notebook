import { useState } from 'react';
import Icon from './Icon.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';

// Already opened from the home screen (iOS reports it via navigator.standalone).
const isInstalled = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isPhone = () => matchMedia('(max-width: 768px)').matches;
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent);

// Nudges phone users to add Notebook to their home screen so it opens like an app.
export default function InstallTip() {
  const [dismissed, setDismissed] = useLocalStorage('install-tip-dismissed', false);
  const [show] = useState(() => isPhone() && !isInstalled());

  if (dismissed || !show) return null;
  return (
    <div className="card install-tip">
      <span className="install-tip-icon" aria-hidden="true">
        <Icon name="download" size={18} />
      </span>
      <div>
        <p className="card-title">Add Notebook to your home screen</p>
        <p className="card-sub">
          {isIOS()
            ? 'In Safari, tap Share, then “Add to Home Screen”.'
            : 'In Chrome, tap the ⋮ menu, then “Add to Home screen”.'}{' '}
          It opens full-screen, like an app.
        </p>
      </div>
      <button type="button" className="icon-btn" onClick={() => setDismissed(true)} aria-label="Dismiss tip">
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}
