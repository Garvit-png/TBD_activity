import { useState, useRef, useEffect } from 'react';
import { playDigit, playWrongCode, playCorrectCode, playPing } from '../utils/sound';

const CHANGE_CODE = '0910';

export default function TeamSelect({ onSelect }) {
  const [chosen,     setChosen]     = useState(null);   // null | 'A' | 'B'
  const [showUnlock, setShowUnlock] = useState(false);
  const [code,       setCode]       = useState('');
  const [codeStatus, setCodeStatus] = useState('idle');
  const [shake,      setShake]      = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (showUnlock) setTimeout(() => inputRef.current?.focus(), 60);
  }, [showUnlock]);

  const pickTeam = (t) => { playPing(); setChosen(t); };

  const confirmTeam = () => {
    if (!chosen) return;
    playCorrectCode();
    onSelect(chosen);
  };

  const handleCodeChange = (e) => {
    if (codeStatus === 'correct') return;
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > code.length) playDigit();
    setCode(raw);
    if (raw.length === 4) {
      if (raw === CHANGE_CODE) {
        setCodeStatus('correct');
        playCorrectCode();
        setTimeout(() => {
          setShowUnlock(false);
          setCodeStatus('idle');
          setCode('');
          setChosen(null);
        }, 700);
      } else {
        setCodeStatus('wrong');
        playWrongCode();
        setShake(true);
        setTimeout(() => { setShake(false); setCodeStatus('idle'); setCode(''); }, 900);
      }
    }
  };

  const TEAMS = [
    { id: 'A', label: 'TEAM A', hint: 'red theme', tc: '#cc2233', tg: '#ff2244', tbg: '#0d0003' },
    { id: 'B', label: 'TEAM B', hint: 'blue theme', tc: '#1a66ff', tg: '#4488ff', tbg: '#00030d' },
  ];

  return (
    <div className="team-select-page">
      <div className="team-select-inner">
        <div className="team-select-label">// tbd-os :: team_assignment.sh</div>
        <div className="team-select-title">SELECT YOUR TEAM</div>
        <div className="team-select-sub">choose carefully — locked once confirmed</div>

        <div className="team-cards">
          {TEAMS.map(t => (
            <button
              key={t.id}
              className={`team-card ${chosen === t.id ? 'selected' : ''}`}
              style={{ '--tc': t.tc, '--tg': t.tg, '--tbg': t.tbg }}
              onClick={() => pickTeam(t.id)}
            >
              <div className="team-card-letter">{t.id}</div>
              <div className="team-card-name">{t.label}</div>
              <div className="team-card-hint">{t.hint}</div>
              {chosen === t.id && <div className="team-card-check">✓ SELECTED</div>}
            </button>
          ))}
        </div>

        {chosen && (
          <div className="team-confirm-row">
            <button className="team-confirm-btn" onClick={confirmTeam}>
              CONFIRM {chosen === 'A' ? 'TEAM A' : 'TEAM B'}  →
            </button>
            <button className="team-change-btn" onClick={() => setShowUnlock(true)}>
              change team
            </button>
          </div>
        )}
      </div>

      {/* change-team modal */}
      {showUnlock && (
        <div className="team-modal-overlay" onClick={() => setShowUnlock(false)}>
          <div
            className={`team-modal ${shake ? 'shake' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="team-modal-title">ENTER CHANGE CODE</div>
            <input
              ref={inputRef}
              className={`team-modal-input ${codeStatus}`}
              type="tel"
              inputMode="numeric"
              pattern="\d*"
              value={code}
              onChange={handleCodeChange}
              maxLength={4}
              placeholder="_ _ _ _"
              autoComplete="off"
            />
            <div className={`team-modal-status ${codeStatus}`}>
              {codeStatus === 'correct' ? '> UNLOCKED — reselecting...'
               : codeStatus === 'wrong' ? '> WRONG CODE'
               : '> 4-digit code required'}
            </div>
            <button className="team-modal-close" onClick={() => setShowUnlock(false)}>cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
