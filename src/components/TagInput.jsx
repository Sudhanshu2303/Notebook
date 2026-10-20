import { useState } from 'react';
import Icon from './Icon.jsx';

const clean = (raw) => raw.trim().toLowerCase().replace(/^#+/, '').replace(/\s+/g, '-');

export default function TagInput({ tags, onChange, suggestions = [] }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  function add(raw) {
    const tag = clean(raw);
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setText('');
  }

  function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && text.trim()) {
      e.preventDefault();
      add(text);
    } else if (e.key === 'Backspace' && !text && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  const query = clean(text);
  const matches = suggestions.filter((s) => !tags.includes(s) && s.startsWith(query)).slice(0, 6);

  return (
    <div className="tag-field">
      <div className="tag-input">
        {tags.map((tag) => (
          <span key={tag} className="tag-pill">
            #{tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(tags.filter((t) => t !== tag))}>
              <Icon name="x" size={12} />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            if (text.trim()) add(text);
          }}
          placeholder={tags.length ? '' : 'work, family, run…'}
        />
      </div>
      {focused && matches.length > 0 && (
        <div className="tag-suggestions">
          {matches.map((s) => (
            <button key={s} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(s)}>
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
