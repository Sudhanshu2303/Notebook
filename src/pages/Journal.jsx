import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import MoodStrip from '../components/MoodStrip.jsx';
import useJournal from '../hooks/useJournal.js';
import {
  ENERGY_LEVELS,
  MOODS,
  averageMood,
  currentStreak,
  greeting,
  lastNDays,
  moodFor,
  parseDateKey,
  toDateKey,
} from '../lib/journal.js';

function groupByMonth(entries) {
  const groups = [];
  for (const entry of entries) {
    const label = parseDateKey(entry.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  }
  return groups;
}

export default function Journal() {
  const { entries } = useJournal();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);

  const today = new Date();
  const wroteToday = entries.some((e) => e.date === toDateKey(today));
  const allTags = useMemo(() => [...new Set(entries.flatMap((e) => e.tags))].sort(), [entries]);
  const weekKeys = new Set(lastNDays(7));
  const weekAvg = averageMood(entries.filter((e) => weekKeys.has(e.date)));
  const weekMood = weekAvg ? moodFor(Math.round(weekAvg)) : null;

  const filtering = Boolean(query.trim() || moodFilter || tagFilter);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (!moodFilter || e.mood === moodFilter) &&
        (!tagFilter || e.tags.includes(tagFilter)) &&
        (!q || `${e.title} ${e.body} ${e.tags.join(' ')}`.toLowerCase().includes(q))
    );
  }, [entries, query, moodFilter, tagFilter]);
  const groups = groupByMonth(filtered);

  function clearFilters() {
    setQuery('');
    setMoodFilter(null);
    setTagFilter(null);
  }

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 className="page-title">{greeting(today)}</h1>
        </div>
        <Link to="/journal/new" className="btn btn-primary">
          <Icon name="plus" size={16} />
          New entry
        </Link>
      </header>

      {!wroteToday && (
        <div className="checkin card">
          <p className="checkin-prompt">How are you feeling today?</p>
          <div className="checkin-moods">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`checkin-mood mood-${m.value}`}
                onClick={() => navigate(`/journal/new?mood=${m.value}`)}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="stats">
          <div className="stat card">
            <span className="stat-value">{entries.length}</span>
            <span className="stat-label">{entries.length === 1 ? 'entry' : 'entries'}</span>
          </div>
          <div className="stat card">
            <span className="stat-value">
              {currentStreak(entries)}
              <span className="stat-icon"><Icon name="flame" size={16} /></span>
            </span>
            <span className="stat-label">day streak</span>
          </div>
          <div className="stat card">
            <span className="stat-value">{weekMood ? weekMood.emoji : '–'}</span>
            <span className="stat-label">{weekMood ? `${weekMood.label} this week` : 'no mood this week'}</span>
          </div>
          <div className="stat stat-wide card">
            <MoodStrip entries={entries} />
            <span className="stat-label">last 14 days</span>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="toolbar">
          <label className="search">
            <Icon name="search" size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entries" />
          </label>
          <div className="chips">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`chip${moodFilter === m.value ? ' active' : ''}`}
                onClick={() => setMoodFilter(moodFilter === m.value ? null : m.value)}
                title={`Only ${m.label.toLowerCase()} days`}
              >
                {m.emoji}
              </button>
            ))}
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`chip${tagFilter === tag ? ' active' : ''}`}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">Your journal is empty</p>
          <p>Write a few lines about your day. Small entries count.</p>
          <Link to="/journal/new" className="btn btn-primary">Write your first entry</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No matching entries</p>
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="timeline">
          {filtering && (
            <p className="meta">
              {filtered.length} of {entries.length} entries ·{' '}
              <button type="button" className="link" onClick={clearFilters}>clear</button>
            </p>
          )}
          {groups.map((group) => (
            <div key={group.label} className="month">
              <h2 className="month-label">{group.label}</h2>
              <ul className="entry-list">
                {group.entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EntryCard({ entry }) {
  const date = parseDateKey(entry.date);
  const mood = moodFor(entry.mood);
  return (
    <li>
      <Link to={`/journal/${entry.id}`} className="entry-card card">
        <div className="entry-date">
          <span className="entry-day">{date.getDate()}</span>
          <span className="entry-weekday">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
        </div>
        <div className="entry-main">
          <div className="entry-title-row">
            <h3 className={entry.title ? '' : 'untitled'}>{entry.title || 'Untitled entry'}</h3>
            {mood && (
              <span className={`mood-badge mood-${mood.value}`} title={mood.label}>
                {mood.emoji} {mood.label}
              </span>
            )}
          </div>
          {entry.body && <p className="entry-excerpt">{entry.body}</p>}
          {(entry.tags.length > 0 || entry.energy) && (
            <div className="entry-meta">
              {entry.energy && <span className="energy-chip">Energy: {ENERGY_LEVELS[entry.energy - 1]}</span>}
              {entry.tags.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
