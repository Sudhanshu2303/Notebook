import Icon from '../Icon.jsx';
import { dayKeyFromToday, formatDue } from '../../lib/todos.js';

export default function DuePicker({ value, onChange }) {
  const quick = [
    ['Today', dayKeyFromToday(0)],
    ['Tomorrow', dayKeyFromToday(1)],
    ['Next week', dayKeyFromToday(7)],
  ];
  const custom = value && !quick.some(([, key]) => key === value);

  return (
    <div className="due-picker">
      {quick.map(([label, key]) => (
        <button
          key={label}
          type="button"
          className={`chip${value === key ? ' active' : ''}`}
          onClick={() => onChange(value === key ? null : key)}
        >
          {label}
        </button>
      ))}
      <label className={`chip date-chip${custom ? ' active' : ''}`}>
        <Icon name="calendar" size={13} />
        {custom ? formatDue(value) : 'Pick date'}
        <input
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          aria-label="Due date"
        />
      </label>
      {value && (
        <button type="button" className="link" onClick={() => onChange(null)}>
          clear
        </button>
      )}
    </div>
  );
}
