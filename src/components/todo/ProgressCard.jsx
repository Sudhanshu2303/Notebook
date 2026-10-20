function headline(pct, total) {
  if (total === 0) return 'Nothing planned yet';
  if (pct === 100) return 'All done. Take a breather.';
  if (pct >= 75) return 'Almost there';
  if (pct >= 50) return 'Over halfway';
  if (pct > 0) return 'Good start';
  return "Let's get going";
}

export default function ProgressCard({ counts, total, onQuickFilter }) {
  const pct = total ? Math.round((counts.done / total) * 100) : 0;
  const doingPct = total ? (counts.doing / total) * 100 : 0;

  const stats = [
    { key: 'todo', label: 'To do', value: counts.todo },
    { key: 'doing', label: 'In progress', value: counts.doing },
    { key: 'today', label: 'Due today', value: counts.today },
    { key: 'overdue', label: 'Overdue', value: counts.overdue, alert: counts.overdue > 0 },
  ];

  return (
    <div className="progress-card card">
      <div className="progress-top">
        <div>
          <span className="progress-pct">{pct}%</span>
          <span className="progress-headline">{headline(pct, total)}</span>
        </div>
        <span className="meta">
          {counts.done} of {total} done
        </span>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tasks completed"
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
        <div className="progress-doing" style={{ width: `${doingPct}%` }} />
      </div>
      <div className="progress-stats">
        {stats.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`progress-stat stat-${s.key}${s.alert ? ' alert' : ''}`}
            onClick={() => onQuickFilter(s.key)}
          >
            <span className="progress-stat-value">{s.value}</span>
            <span className="progress-stat-label">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
