import { useState, useCallback, useRef, useMemo } from 'react';
import { playRunaway, playPowerOn, playErrorBuzz } from '../utils/sound';

const TOTAL_BUTTONS = 18; // lots of them

// All start green — same color, same label, impossible to guess
const GREEN = '#1a7a2a';

function randPos() {
  return {
    top:  8 + Math.random() * 76,
    left: 4 + Math.random() * 82,
  };
}

function initButtons(realIdx) {
  return Array.from({ length: TOTAL_BUTTONS }, (_, i) => {
    // real button starts dead-centre
    if (i === realIdx) {
      return {
        id:      i,
        isReal:  true,
        top:     48,   // ~center vertically
        left:    47,   // ~center horizontally
        color:   GREEN,
        clicked: false,
        caught:  false,
        fleeing: false,
      };
    }
    return {
      id:      i,
      isReal:  false,
      ...randPos(),
      color:   GREEN,
      clicked: false,
      caught:  false,
      fleeing: false,
    };
  });
}

export default function Dashboard({ onEnter }) {
  const realIdx = useMemo(() => Math.floor(Math.random() * TOTAL_BUTTONS), []);
  const [buttons, setButtons] = useState(() => initButtons(realIdx));
  const [log, setLog] = useState([
    '> tbd-portal v1.0 loaded',
    `> WARNING: ${TOTAL_BUTTONS} START processes spawned`,
    '> locate and click the real one to continue...',
  ]);
  const fleeing = useRef(new Set());

  const addLog = useCallback((msg) => {
    setLog(prev => [...prev.slice(-7), msg]);
  }, []);

  const handleButtonClick = useCallback((btn) => {
    if (btn.caught || btn.clicked) return;

    if (btn.isReal) {
      playPowerOn();
      addLog('> ✓ real START process located — launching portal...');
      setButtons(prev => prev.map(b =>
        b.id === btn.id ? { ...b, caught: true } : b
      ));
      setTimeout(onEnter, 1300);
      return;
    }

    // fake — run away first, THEN turn red after movement
    if (fleeing.current.has(btn.id)) return;
    fleeing.current.add(btn.id);
    playRunaway();
    playErrorBuzz();
    addLog(`> ✗ process_${btn.id}.exe evaded — FAKE`);

    // immediately mark as clicked (will turn red after flee)
    setButtons(prev => prev.map(b => {
      if (b.id !== btn.id) return b;

      let np;
      let tries = 0;
      do {
        np = randPos();
        tries++;
      } while (tries < 30 && (Math.abs(np.top - b.top) < 20 || Math.abs(np.left - b.left) < 25));

      return {
        ...b,
        top:     np.top,
        left:    np.left,
        fleeing: true,
        clicked: false, // still green while moving
      };
    }));

    // After movement animation completes → turn red
    setTimeout(() => {
      fleeing.current.delete(btn.id);
      setButtons(prev => prev.map(b =>
        b.id === btn.id
          ? { ...b, fleeing: false, clicked: true, color: '#8c0000' }
          : b
      ));
    }, 480);
  }, [addLog, onEnter]);

  return (
    <div className="dashboard">
      <div className="dash-header">
        <span className="dash-title">TBD PORTAL</span>
        <span className="dash-sub">// session authenticated — find the real START</span>
      </div>

      <div className="dash-log">
        {log.map((l, i) => (
          <div key={i} className="dash-log-line">{l}</div>
        ))}
      </div>

      <div className="dash-arena">
        <div className="dash-arena-label">
          ⚠ {TOTAL_BUTTONS} START processes active — only 1 is real
        </div>

        {buttons.map(btn => (
          <button
            key={btn.id}
            className={[
              'dash-start-btn',
              btn.fleeing ? 'fleeing'  : '',
              btn.caught  ? 'caught'   : '',
              btn.clicked ? 'clicked'  : '',
            ].join(' ')}
            style={{
              top:        `${btn.top}%`,
              left:       `${btn.left}%`,
              background: btn.caught  ? 'var(--green)'
                        : btn.clicked ? '#8c0000'
                        : btn.color,
              color:      btn.caught  ? '#000'
                        : btn.clicked ? '#ff6666'
                        : '#c8ffc8',
              borderColor: btn.caught  ? 'var(--green)'
                         : btn.clicked ? '#ff2244'
                         : 'rgba(0,255,65,0.25)',
              boxShadow:   btn.caught  ? '0 0 20px var(--green)'
                         : btn.clicked ? '0 0 8px #ff2244'
                         : '0 0 4px rgba(0,255,65,0.15)',
            }}
            onClick={() => handleButtonClick(btn)}
            aria-label={btn.isReal ? 'Real start button' : 'Fake start button'}
          >
            {btn.caught  ? 'LAUNCHING...'
           : btn.clicked ? '[ FAKE ]'
           :               '[ START ]'}
          </button>
        ))}
      </div>
    </div>
  );
}
