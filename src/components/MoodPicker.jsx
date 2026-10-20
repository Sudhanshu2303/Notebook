import { MOODS } from '../lib/journal.js';

export default function MoodPicker({ value, onChange }) {
  return (
    <div className="mood-picker" role="radiogroup" aria-label="Mood">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          role="radio"
          aria-checked={value === m.value}
          className={`mood-option mood-${m.value}${value === m.value ? ' selected' : ''}`}
          onClick={() => onChange(value === m.value ? null : m.value)}
        >
          <span className="mood-emoji">{m.emoji}</span>
          <span className="mood-label">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
