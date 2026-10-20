import { ENERGY_LEVELS } from '../lib/journal.js';

export default function EnergyPicker({ value, onChange }) {
  return (
    <div className="energy-picker">
      <div className="energy-bars" role="radiogroup" aria-label="Energy">
        {ENERGY_LEVELS.map((label, i) => {
          const level = i + 1;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={value === level}
              aria-label={label}
              title={label}
              className={`energy-bar${value && level <= value ? ' filled' : ''}`}
              onClick={() => onChange(value === level ? null : level)}
            />
          );
        })}
      </div>
      <span className="energy-label">{value ? ENERGY_LEVELS[value - 1] : 'Not set'}</span>
    </div>
  );
}
