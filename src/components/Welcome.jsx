import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import useJournal from '../hooks/useJournal.js';
import useTodos from '../hooks/useTodos.js';
import { sampleEntries, sampleTasks } from '../lib/samples.js';

const STEPS = 3;

// First-run tour: what Notebook is, where data lives, and a way to get started.
export default function Welcome({ theme, onToggleTheme, onClose }) {
  const navigate = useNavigate();
  const { saveEntry } = useJournal();
  const { addTask } = useTodos();
  const [step, setStep] = useState(0);
  const primaryRef = useRef(null);

  useEffect(() => {
    primaryRef.current?.focus();
  }, [step]);

  function finish(path, state) {
    onClose();
    if (path) navigate(path, { state });
  }

  function loadExamples() {
    sampleTasks().forEach(addTask);
    sampleEntries().forEach(saveEntry);
    finish('/journal', { flash: 'Added a few examples. Delete them anytime.' });
  }

  return (
    <div className="welcome-backdrop" onKeyDown={(e) => e.key === 'Escape' && finish()}>
      <div className="welcome card" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <button type="button" className="icon-btn welcome-close" onClick={() => finish()} aria-label="Skip the tour">
          <Icon name="x" size={18} />
        </button>

        {step === 0 && (
          <>
            <span className="welcome-logo" aria-hidden="true">
              <Icon name="book" size={22} />
            </span>
            <h2 id="welcome-title" className="welcome-title">Welcome to Notebook</h2>
            <p className="welcome-text">A calm place for your days: a journal for how you feel, and a task list for what to do.</p>
            <div className="welcome-features">
              <div className="welcome-feature">
                <Icon name="book" size={18} />
                <div>
                  <p className="card-title">Journal</p>
                  <p className="card-sub">Write daily entries with a mood, energy and tags. Build a streak.</p>
                </div>
              </div>
              <div className="welcome-feature">
                <Icon name="check" size={18} />
                <div>
                  <p className="card-title">Tasks</p>
                  <p className="card-sub">Priorities, due dates and subtasks, plus a history of what you got done.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <span className="welcome-logo" aria-hidden="true">
              <Icon name="smile" size={22} />
            </span>
            <h2 id="welcome-title" className="welcome-title">Your notes stay with you</h2>
            <p className="welcome-text">
              There's no account. Everything is saved in this browser on this device, and it doesn't sync to your
              other devices yet.
            </p>
            <button type="button" className="btn btn-secondary welcome-theme" onClick={onToggleTheme}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
              {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <span className="welcome-logo" aria-hidden="true">
              <Icon name="bolt" size={22} />
            </span>
            <h2 id="welcome-title" className="welcome-title">How do you want to start?</h2>
            <div className="welcome-choices">
              <button ref={primaryRef} type="button" className="welcome-choice" onClick={() => finish('/journal/new')}>
                <Icon name="book" size={18} />
                Write my first entry
              </button>
              <button
                type="button"
                className="welcome-choice"
                onClick={() => finish('/tasks', { focusComposer: true })}
              >
                <Icon name="check" size={18} />
                Add my first task
              </button>
              <button type="button" className="welcome-choice" onClick={loadExamples}>
                <Icon name="list" size={18} />
                Show me some examples
              </button>
            </div>
          </>
        )}

        <div className="welcome-foot">
          <div className="welcome-dots" aria-label={`Step ${step + 1} of ${STEPS}`}>
            {Array.from({ length: STEPS }, (_, i) => (
              <span key={i} className={i === step ? 'active' : ''} />
            ))}
          </div>
          <div className="welcome-actions">
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            {step < STEPS - 1 ? (
              <button ref={primaryRef} type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
                Next
              </button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={() => finish()}>
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
