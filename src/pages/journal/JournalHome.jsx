import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import MoodStrip from '../../components/MoodStrip.jsx';
import useJournal from '../../hooks/useJournal.js';
import {
  MOODS,
  averageMood,
  currentStreak,
  greeting,
  lastNDays,
  moodFor,
  toDateKey,
  wordCount,
} from '../../lib/journal.js';

export default function JournalHome() {
  const { entries } = useJournal();
  const navigate = useNavigate();
  const today = new Date();
  const wroteToday = entries.some((e) => e.date === toDateKey(today));

  const weekKeys = new Set(lastNDays(7));
  const weekAvg = averageMood(entries.filter((e) => weekKeys.has(e.date)));
  const weekMood = weekAvg ? moodFor(Math.round(weekAvg)) : null;
  const totalWords = entries.reduce((sum, e) => sum + wordCount(e.body), 0);

  const topTags = useMemo(() => {
    const counts = new Map();
    for (const e of entries) for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [entries]);

  return (
    <div className="detail-scroll">
      <div className="home">
        <header className="page-header">
          <div>
            <p className="eyebrow">{today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="display">{greeting(today)}</h1>
          </div>
        </header>

        {!wroteToday && (
          <div className="card checkin">
            <div>
              <p className="card-title">How are you feeling today?</p>
              <p className="card-sub">Pick a mood to start today's entry.</p>
            </div>
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

        {entries.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><Icon name="book" size={22} /></span>
            <p className="empty-title">Start your journal</p>
            <p>Write a few lines about your day. Small entries count.</p>
            <Link to="/journal/new" className="btn btn-primary">Write your first entry</Link>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="card stat-card">
                <span className="stat-label">Entries</span>
                <span className="stat-value">{entries.length}</span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Day streak</span>
                <span className="stat-value">
                  {currentStreak(entries)}
                  <span className="stat-icon"><Icon name="flame" size={18} /></span>
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Mood this week</span>
                <span className="stat-value">
                  {weekMood ? (
                    <>
                      {weekMood.emoji} <span className="stat-value-sub">{weekMood.label}</span>
                    </>
                  ) : (
                    '–'
                  )}
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Words written</span>
                <span className="stat-value">{totalWords.toLocaleString()}</span>
              </div>
            </div>

            <div className="card section-card">
              <div className="section-card-head">
                <p className="card-title">Mood, last 14 days</p>
                <div className="mood-legend">
                  {MOODS.map((m) => (
                    <span key={m.value} title={m.label}>
                      <span className={`mood-dot logged mood-${m.value}`} />
                    </span>
                  ))}
                </div>
              </div>
              <MoodStrip entries={entries} />
            </div>

            {topTags.length > 0 && (
              <div className="card section-card">
                <p className="card-title">Top tags</p>
                <div className="tag-cloud">
                  {topTags.map(([tag, count]) => (
                    <span key={tag} className="tag-cloud-item">
                      #{tag}
                      <span className="count">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
