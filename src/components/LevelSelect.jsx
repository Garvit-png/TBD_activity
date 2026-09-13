import { useState, useRef, useEffect } from 'react';
import { playDigit, playWrongCode, playAccessGranted, playPing } from '../utils/sound';

const LEVELS = [
  {
    id:       'cli',
    label:    'CLI',
    title:    'COMMAND LINE CHALLENGE',
    desc:     'Navigate the terminal. Answer fast. Think faster.',
    code:     'CLI0313',
    color:    'var(--green)',
    icon:     '>_',
    accent:   '#00ff41',
  },
  {
    id:       'psp',
    label:    'PSP',
    title:    'PROBLEM SOLVING PROTOCOL',
    desc:     'Real problems. Real pressure. No hints.',
    code:     'PSP0310',
    color:    'var(--cyan)',
    icon:     '◈',
    accent:   '#00ffff',
  },
  {
    id:       'pitch',
    label:    'PITCH',
    title:    'PITCH YOUR IDEA',
    desc:     'One shot. Make it count. Choose wisely.',
    code:     'PITCH0310',
    color:    'var(--yellow)',
    icon:     '⬡',
    accent:   '#ffd700',
  },
];

function LevelCard({ level, onUnlock }) {
  const [open,   setOpen]   = useState(false);
  const [input,  setInput]  = useState('');
  const [status, setStatus] = useState('idle'); // idle | wrong | correct
  const [shake,  setShake]  = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.toUpperCase() === level.code) {
      setStatus('correct');
      playAccessGranted();
      setTimeout(() => onUnlock(level.id), 1000);
    } else {
      setStatus('wrong');
      playWrongCode();
      setShake(true);
      setTimeout(() => { setShake(false); setStatus('idle'); setInput(''); }, 900);
    }
  };

  return (
    <div
      className={`level-card ${open ? 'expanded' : ''}`}
      style={{ '--accent': level.accent }}
      onMouseEnter={playPing}
    >
      <div className="level-card-top" onClick={() => !open && setOpen(true)}>
        <div className="level-icon">{level.icon}</div>
        <div className="level-info">
          <div className="level-label" style={{ color: level.accent }}>{level.label}</div>
          <div className="level-title">{level.title}</div>
          <div className="level-desc">{level.desc}</div>
        </div>
        <div className="level-lock">{open ? '▾' : '🔒'}</div>
      </div>

      {open && (
        <form className={`level-form ${shake ? 'shake' : ''}`} onSubmit={handleSubmit}>
          <div className="level-form-label">
            {status === 'correct' ? '> ACCESS GRANTED — entering...' :
             status === 'wrong'   ? '> INCORRECT — try again' :
             '> enter access code'}
          </div>
          <div className="level-input-row">
            <span className="level-prompt" style={{ color: level.accent }}>&gt;</span>
            <input
              ref={inputRef}
              className={`level-input ${status}`}
              style={{ '--accent': level.accent }}
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value.toUpperCase()); playDigit(); }}
              placeholder="________"
              maxLength={10}
              autoComplete="off"
              spellCheck="false"
              disabled={status === 'correct'}
            />
            <button
              type="submit"
              className="level-submit"
              style={{ borderColor: level.accent, color: level.accent }}
              disabled={status === 'correct'}
            >
              ENTER
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function LevelSelect({ onSelect }) {
  return (
    <div className="level-select">
      <div className="level-select-header">
        <div className="level-select-label">// tbd-os :: level_select.sh</div>
        <div className="level-select-title">SELECT YOUR ARENA</div>
        <div className="level-select-sub">each level is locked — use your access code</div>
      </div>

      <div className="level-cards">
        {LEVELS.map(lv => (
          <LevelCard key={lv.id} level={lv} onUnlock={onSelect} />
        ))}
      </div>
    </div>
  );
}
