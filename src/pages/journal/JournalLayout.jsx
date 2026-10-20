import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useMatch } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import useJournal from '../../hooks/useJournal.js';
import useLocalStorage from '../../hooks/useLocalStorage.js';
import { MOODS, moodFor, parseDateKey } from '../../lib/journal.js';

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

// Evernote-style split: entry list on the left, overview or editor on the right.
// On narrow screens only one pane shows at a time.
export default function JournalLayout() {
  const detail = useMatch('/journal/:id');
  return (
    <div className={`journal-layout${detail ? ' show-detail' : ''}`}>
      <EntryList />
      <section className="detail-pane">
        <Outlet />
      </section>
    </div>
  );
}

function EntryList() {
  const { entries } = useJournal();
  const [draft] = useLocalStorage('journal-draft', null);
  const [query, setQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);

  const allTags = useMemo(() => [...new Set(entries.flatMap((e) => e.tags))].sort(), [entries]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (!moodFilter || e.mood === moodFilter) &&
        (!tagFilter || e.tags.includes(tagFilter)) &&
        (!q || `${e.title} ${e.body} ${e.tags.join(' ')}`.toLowerCase().includes(q))
    );
  }, [entries, query, moodFilter, tagFilter]);
  const filtering = Boolean(query.trim() || moodFilter || tagFilter);

  function clearFilters() {
    setQuery('');
    setMoodFilter(null);
    setTagFilter(null);
  }

  return (
    <aside className="list-pane" aria-label="Journal entries">
      <div className="list-head">
        <div className="list-title-row">
          <div>
            <h2 className="list-title">Journal</h2>
            <span className="list-count">
              {filtering ? `${filtered.length} of ${entries.length}` : entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <Link to="/journal/new" className="btn btn-primary btn-sm" aria-label="New entry">
            <Icon name="plus" size={15} />
            New
          </Link>
        </div>
        {entries.length > 0 && (
          <>
            <label className="search">
              <Icon name="search" size={15} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entries" />
            </label>
            <div className="filter-row">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`chip chip-emoji${moodFilter === m.value ? ' active' : ''}`}
                  onClick={() => setMoodFilter(moodFilter === m.value ? null : m.value)}
                  title={`Only ${m.label.toLowerCase()} days`}
                  aria-pressed={moodFilter === m.value}
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
                  aria-pressed={tagFilter === tag}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="list-scroll">
        {draft && (
          <NavLink to="/journal/new" className="note-item draft">
            <div className="note-item-top">
              <span className={`note-title${draft.title ? '' : ' untitled'}`}>{draft.title || 'Untitled draft'}</span>
              <span className="badge">Draft</span>
            </div>
            {draft.body && <p className="note-excerpt">{draft.body}</p>}
          </NavLink>
        )}

        {entries.length === 0 && !draft ? (
          <div className="list-empty">
            <p>No entries yet.</p>
            <Link to="/journal/new" className="link">Write your first one</Link>
          </div>
        ) : filtered.length === 0 && filtering ? (
          <div className="list-empty">
            <p>No matching entries.</p>
            <button type="button" className="link" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          groupByMonth(filtered).map((group) => (
            <div key={group.label}>
              <h3 className="list-group-label">{group.label}</h3>
              {group.entries.map((entry) => (
                <EntryItem key={entry.id} entry={entry} />
              ))}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

function EntryItem({ entry }) {
  const mood = moodFor(entry.mood);
  const date = parseDateKey(entry.date);
  return (
    <NavLink to={`/journal/${entry.id}`} className="note-item">
      <div className="note-item-top">
        <span className={`note-title${entry.title ? '' : ' untitled'}`}>{entry.title || 'Untitled entry'}</span>
        {mood && (
          <span className="note-mood" title={mood.label}>
            {mood.emoji}
          </span>
        )}
      </div>
      {entry.body && <p className="note-excerpt">{entry.body}</p>}
      <div className="note-meta">
        <span>{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        {entry.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="note-tag">#{tag}</span>
        ))}
        {entry.tags.length > 3 && <span>+{entry.tags.length - 3}</span>}
      </div>
    </NavLink>
  );
}
