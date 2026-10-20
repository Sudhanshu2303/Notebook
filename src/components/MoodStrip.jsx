import { averageMood, lastNDays, moodFor, parseDateKey } from '../lib/journal.js';

// One dot per day, coloured by that day's average mood.
export default function MoodStrip({ entries, days = 14 }) {
  const keys = lastNDays(days);
  return (
    <div className="mood-strip">
      {keys.map((key) => {
        const avg = averageMood(entries.filter((e) => e.date === key));
        const mood = avg ? moodFor(Math.round(avg)) : null;
        const date = parseDateKey(key);
        const label = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        return (
          <div key={key} className="mood-strip-day" title={`${label}: ${mood ? mood.label : 'No mood logged'}`}>
            <span className={`mood-dot${mood ? ` logged mood-${mood.value}` : ''}`} />
            <span className="mood-strip-weekday">{date.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
          </div>
        );
      })}
    </div>
  );
}
