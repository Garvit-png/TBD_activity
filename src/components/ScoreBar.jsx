/**
 * ScoreBar — fixed TOP strip showing per-level times + overall total.
 * Always visible on all portal screens.
 */

function fmt(ms) {
  if (ms === null || ms === undefined) return '--:--.--';
  const s  = Math.floor(ms / 1000);
  const m  = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
  return `${m}:${ss}.${cs}`;
}

const LEVELS = [
  { id: 'cli',   label: 'CLI',   color: '#00ff41' },
  { id: 'psp',   label: 'PSP',   color: '#00ffff' },
  { id: 'pitch', label: 'PITCH', color: '#ffd700' },
];

export default function ScoreBar({ times }) {
  const recorded = Object.values(times).filter(v => v !== null);
  const total    = recorded.length > 0 ? recorded.reduce((a, b) => a + b, 0) : null;

  return (
    <div className="score-bar" role="status" aria-label="Level times">
      <div className="score-bar-tag">SCOREBOARD</div>

      {LEVELS.map(lv => (
        <div key={lv.id} className="score-bar-cell">
          <span className="score-bar-label" style={{ color: lv.color }}>
            {lv.label}
          </span>
          <span
            className={`score-bar-time ${times[lv.id] !== null ? 'recorded' : 'pending'}`}
            style={{ color: times[lv.id] !== null ? lv.color : '#1e3a1e' }}
          >
            {fmt(times[lv.id])}
          </span>
        </div>
      ))}

      <div className="score-bar-divider" />

      <div className="score-bar-cell total">
        <span className="score-bar-label" style={{ color: total ? '#fff' : '#2a3a2a' }}>
          TOTAL
        </span>
        <span
          className={`score-bar-time ${total ? 'recorded' : 'pending'}`}
          style={{ color: total ? '#fff' : '#1e3a1e' }}
        >
          {fmt(total)}
        </span>
      </div>
    </div>
  );
}
