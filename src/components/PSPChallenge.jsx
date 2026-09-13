import { useState, useEffect, useRef } from 'react';
import { playKeyClick, playCorrectCode, playWrongCode, playDigit, playOkTick } from '../utils/sound';

const ACCENT = '#00ffff';
const SOLUTION_PASSWORD = 'TBD';

/* ─────────────────────────────────────────────────────────────────────────
   QUESTIONS — if / elif / else logic
───────────────────────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 1,
    title: 'Grade Checker',

    setup: [
      'A teacher wants to print a grade based on a student\'s marks.',
      '',
      'The rules are:',
      '    marks >= 90   →  print  "A"',
      '    marks >= 75   →  print  "B"',
      '    marks >= 50   →  print  "C"',
      '    anything else →  print  "F"',
      '',
      'The variable  marks  already has a value.',
    ],

    ask: 'Write the if / elif / else block that prints the correct grade.',

    hint: 'Start with the highest condition first (>= 90), then go down. Use print() to output the grade.',

    accepts: [
      // canonical
      'if marks >= 90:\n    print("A")\nelif marks >= 75:\n    print("B")\nelif marks >= 50:\n    print("C")\nelse:\n    print("F")',
      // single quotes
      "if marks >= 90:\n    print('A')\nelif marks >= 75:\n    print('B')\nelif marks >= 50:\n    print('C')\nelse:\n    print('F')",
      // > 89 variant
      'if marks > 89:\n    print("A")\nelif marks > 74:\n    print("B")\nelif marks > 49:\n    print("C")\nelse:\n    print("F")',
      "if marks > 89:\n    print('A')\nelif marks > 74:\n    print('B')\nelif marks > 49:\n    print('C')\nelse:\n    print('F')",
    ],

    solutions: [
      {
        label: 'Standard — using >= (greater than or equal)',
        cmd: null,
        lines: [
          'if marks >= 90:',
          '    print("A")',
          'elif marks >= 75:',
          '    print("B")',
          'elif marks >= 50:',
          '    print("C")',
          'else:',
          '    print("F")',
          '',
          'Key points:',
          '  • Check highest condition FIRST',
          '  • elif = "else if" — only runs if all above were False',
          '  • else catches everything that did not match',
        ],
      },
      {
        label: 'Alternative — using > (strictly greater than)',
        cmd: null,
        lines: [
          'if marks > 89:',
          '    print("A")',
          'elif marks > 74:',
          '    print("B")',
          'elif marks > 49:',
          '    print("C")',
          'else:',
          '    print("F")',
          '',
          'Same result as >= version.',
          '  marks > 89  is identical to  marks >= 90  for whole numbers.',
        ],
      },
    ],

    // multiline — evaluate differently
    multiline: true,
  },

  {
    id: 2,
    title: 'Temperature Check',

    setup: [
      'A weather app checks a temperature value (in °C)',
      'and prints a message to the user.',
      '',
      'The rules are:',
      '    temp > 35    →  print  "Too hot!"',
      '    temp >= 20   →  print  "Nice weather"',
      '    temp >= 10   →  print  "A bit cold"',
      '    anything else →  print  "Very cold!"',
      '',
      'The variable  temp  already has a value.',
    ],

    ask: 'Write the if / elif / else block that prints the correct message.',

    hint: 'Check the hottest condition first (> 35). Work downwards. Each string must match exactly including the exclamation marks.',

    accepts: [
      'if temp > 35:\n    print("Too hot!")\nelif temp >= 20:\n    print("Nice weather")\nelif temp >= 10:\n    print("A bit cold")\nelse:\n    print("Very cold!")',
      "if temp > 35:\n    print('Too hot!')\nelif temp >= 20:\n    print('Nice weather')\nelif temp >= 10:\n    print('A bit cold')\nelse:\n    print('Very cold!')",
      // with == boundary variants for >= 20
      'if temp > 35:\n    print("Too hot!")\nelif temp > 19:\n    print("Nice weather")\nelif temp > 9:\n    print("A bit cold")\nelse:\n    print("Very cold!")',
      "if temp > 35:\n    print('Too hot!')\nelif temp > 19:\n    print('Nice weather')\nelif temp > 9:\n    print('A bit cold')\nelse:\n    print('Very cold!')",
    ],

    solutions: [
      {
        label: 'Standard solution',
        cmd: null,
        lines: [
          'if temp > 35:',
          '    print("Too hot!")',
          'elif temp >= 20:',
          '    print("Nice weather")',
          'elif temp >= 10:',
          '    print("A bit cold")',
          'else:',
          '    print("Very cold!")',
          '',
          'Same pattern as Q1 — hottest first, coldest last.',
          'The else catches anything below 10°C.',
        ],
      },
      {
        label: 'Alternative — using > with boundary shift',
        cmd: null,
        lines: [
          'if temp > 35:',
          '    print("Too hot!")',
          'elif temp > 19:',
          '    print("Nice weather")',
          'elif temp > 9:',
          '    print("A bit cold")',
          'else:',
          '    print("Very cold!")',
          '',
          'temp > 19  is the same as  temp >= 20  for whole numbers.',
          'Both approaches are correct.',
        ],
      },
    ],

    multiline: true,
  },
];

/* ── helpers ── */
function formatTime(ms) {
  const s  = Math.floor(ms / 1000);
  const m  = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
  return `${m}:${ss}.${cs}`;
}

function normalize(str) {
  // collapse whitespace variations for multiline comparison
  return str
    .trim()
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join('\n')
    .toLowerCase()
    .replace(/"/g, "'"); // treat single/double quotes as same
}

/* ─────────────────────────────────────────────────────────────────────────
   SOLUTION MODAL
───────────────────────────────────────────────────────────────────────── */
function SolutionModal({ question, onClose }) {
  const [pw,     setPw]     = useState('');
  const [status, setStatus] = useState('locked');
  const [shake,  setShake]  = useState(false);
  const [tab,    setTab]    = useState(0);
  const ref = useRef(null);

  useEffect(() => { setTimeout(() => ref.current?.focus(), 60); }, []);

  const handleChange = (e) => {
    if (status === 'open') return;
    const val = e.target.value.toUpperCase();
    setPw(val);
    if (val === SOLUTION_PASSWORD) {
      setStatus('open'); playCorrectCode();
    } else if (val.length >= SOLUTION_PASSWORD.length) {
      setStatus('wrong'); playWrongCode(); setShake(true);
      setTimeout(() => { setShake(false); setStatus('locked'); setPw(''); }, 900);
    } else {
      playDigit();
    }
  };

  const solutions = question.solutions;
  const active    = solutions[tab];

  return (
    <div className="sol-overlay" onClick={onClose}>
      <div
        className={`sol-modal ${shake ? 'shake' : ''}`}
        style={{ '--sa': ACCENT }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sol-modal-header">
          <span style={{ color: ACCENT }}>SOLUTION — Q{question.id}: {question.title}</span>
          <button className="sol-close" onClick={onClose}>✕</button>
        </div>

        {status !== 'open' ? (
          <>
            <div className="sol-lock-label">
              {status === 'wrong' ? '> WRONG PASSWORD — try again' : '> enter solution password'}
            </div>
            <input
              ref={ref}
              className={`sol-input ${status}`}
              type="text" value={pw} onChange={handleChange}
              placeholder="________" maxLength={10}
              autoComplete="off" spellCheck="false"
            />
            <div className="sol-solution-count">
              {solutions.length} valid solution{solutions.length > 1 ? 's' : ''} available
            </div>
          </>
        ) : (
          <div className="sol-content">
            {solutions.length > 1 && (
              <div className="sol-tabs">
                {solutions.map((s, i) => (
                  <button
                    key={i}
                    className={`sol-tab ${i === tab ? 'active' : ''}`}
                    style={i === tab ? { borderColor: ACCENT, color: ACCENT } : {}}
                    onClick={() => { setTab(i); playDigit(); }}
                  >
                    Solution {i + 1}
                  </button>
                ))}
              </div>
            )}
            <div className="sol-sol-label" style={{ color: ACCENT }}>{active.label}</div>
            <div className="sol-code-block" style={{ borderLeftColor: ACCENT }}>
              {active.lines.map((line, i) => (
                <div key={i} className={`sol-code-line ${line === '' ? 'sol-gap' : ''}`}>
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
            {solutions.length > 1 && (
              <div className="sol-nav">
                <button className="sol-nav-btn" style={{ color: ACCENT }}
                  onClick={() => { setTab(t => Math.max(0, t-1)); playDigit(); }}
                  disabled={tab === 0}>← prev</button>
                <span className="sol-nav-count" style={{ color: ACCENT }}>{tab+1} / {solutions.length}</span>
                <button className="sol-nav-btn" style={{ color: ACCENT }}
                  onClick={() => { setTab(t => Math.min(solutions.length-1, t+1)); playDigit(); }}
                  disabled={tab === solutions.length-1}>next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   QUESTION BLOCK — multiline textarea, retry allowed
───────────────────────────────────────────────────────────────────────── */
function QuestionBlock({ q, onCorrect }) {
  const [answer,   setAnswer]   = useState('');
  const [status,   setStatus]   = useState('idle');
  const [attempts, setAttempts] = useState(0);
  const [showSol,  setShowSol]  = useState(false);
  const [shake,    setShake]    = useState(false);
  const [showHint, setShowHint] = useState(false);

  const submit = () => {
    if (status === 'correct' || !answer.trim()) return;
    const ok = q.accepts.some(a => normalize(a) === normalize(answer));

    if (ok) {
      setStatus('correct');
      playCorrectCode();
      onCorrect();
    } else {
      setAttempts(a => a + 1);
      setStatus('wrong');
      playWrongCode();
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setStatus('idle');
        // don't clear for multiline — let them fix their answer
      }, 800);
    }
  };

  return (
    <div
      className={`cli-qblock psp-qblock ${status === 'correct' ? 'q-correct' : status === 'wrong' ? 'q-wrong' : ''}`}
      style={{ '--ca': ACCENT }}
    >
      {/* header */}
      <div className="cli-qheader">
        <span className="cli-qnum" style={{ color: ACCENT }}>Q{q.id}</span>
        <span className="cli-qtitle">{q.title}</span>
        {status === 'correct' && <span className="cli-qstatus ok">✓ CORRECT</span>}
        {attempts > 0 && status !== 'correct' && (
          <span className="cli-attempts">attempt {attempts + 1}</span>
        )}
        <button
          className="cli-solution-btn"
          style={{ borderColor: ACCENT, color: ACCENT }}
          onClick={() => setShowSol(true)}
        >
          SOLUTION 🔒
        </button>
      </div>

      {/* setup */}
      <div className="cli-setup">
        {q.setup.map((line, i) => (
          <div key={i} className={`cli-setup-line ${line === '' ? 'cli-setup-gap' : ''}`}>
            {line || '\u00A0'}
          </div>
        ))}
      </div>

      {/* task */}
      <div className="cli-task-box">
        <div className="cli-task-label" style={{ color: ACCENT }}>TASK</div>
        <div className="cli-task-text">{q.ask}</div>
      </div>

      {/* hint */}
      <button
        className="cli-hint-toggle"
        style={{ color: ACCENT }}
        onClick={() => setShowHint(h => !h)}
      >
        {showHint ? '▾ hide hint' : '▸ show hint'}
      </button>
      {showHint && <div className="cli-hint-text">{q.hint}</div>}

      {/* multiline textarea */}
      <div className={`psp-answer-wrap ${shake ? 'shake' : ''}`}>
        <div className="psp-textarea-header" style={{ color: ACCENT }}>
          <span>your code  (indent with spaces)</span>
          <span className="psp-lang">python</span>
        </div>
        <textarea
          className="psp-textarea"
          style={{ '--ca': ACCENT }}
          value={answer}
          onChange={e => {
            if (status !== 'correct') { setAnswer(e.target.value); playKeyClick(); }
          }}
          onKeyDown={e => {
            // Tab inserts 4 spaces instead of jumping focus
            if (e.key === 'Tab') {
              e.preventDefault();
              const pos = e.target.selectionStart;
              const next = answer.slice(0, pos) + '    ' + answer.slice(pos);
              setAnswer(next);
              setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = pos + 4; }, 0);
            }
          }}
          placeholder={"if ...:\n    print(...)\nelif ...:\n    print(...)\nelse:\n    print(...)"}
          disabled={status === 'correct'}
          rows={8}
          autoComplete="off"
          spellCheck="false"
          autoCapitalize="none"
        />
        <div className="psp-submit-row">
          {status === 'wrong' && (
            <span className="cli-wrong-hint">
              ✗ not matching — check conditions, indentation and print strings
            </span>
          )}
          <button
            className="cli-submit-btn psp-submit"
            style={{ borderColor: ACCENT, color: ACCENT }}
            onClick={submit}
            disabled={status === 'correct' || !answer.trim()}
          >
            {status === 'correct' ? '✓ CORRECT' : 'RUN & CHECK'}
          </button>
        </div>
      </div>

      {showSol && <SolutionModal question={q} onClose={() => setShowSol(false)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────────────────── */
export default function PSPChallenge({ team, onComplete }) {
  const teamLabel  = team === 'A' ? 'TEAM A' : 'TEAM B';
  const teamAccent = team === 'A' ? '#ff4455' : '#4488ff';

  const [elapsed,   setElapsed]   = useState(0);
  const [running,   setRunning]   = useState(false);
  const [started,   setStarted]   = useState(false);
  const [finished,  setFinished]  = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [qTimes,    setQTimes]    = useState({});

  const intervalRef  = useRef(null);
  const startTimeRef = useRef(null);

  const startChallenge = () => {
    setStarted(true);
    setRunning(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => setElapsed(Date.now() - startTimeRef.current), 50);
    playOkTick();
  };

  const handleCorrect = (qid) => {
    const t = Date.now() - startTimeRef.current;
    setQTimes(prev => ({ ...prev, [qid]: t }));
    setDoneCount(prev => {
      const next = prev + 1;
      if (next >= QUESTIONS.length) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setFinished(true);
        if (onComplete) onComplete(t);
      }
      return next;
    });
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="cli-challenge theme-psp" style={{ '--ca': ACCENT }}>

      {/* TOP BAR */}
      <div className="cli-topbar">
        <div className="cli-team-badge" style={{ borderColor: teamAccent, color: teamAccent }}>
          {teamLabel}
        </div>
        <div className="cli-timer" style={{ color: running ? ACCENT : '#555' }}>
          ⏱ {formatTime(elapsed)}
        </div>
        {started && !finished && (
          <div className="cli-total-live" style={{ color: ACCENT }}>
            TOTAL: {formatTime(elapsed)}
          </div>
        )}
        <div className="cli-title">PSP CHALLENGE</div>
      </div>

      {/* PRE-START */}
      {!started && (
        <div className="cli-prestart">
          <div className="cli-prestart-label">// problem solving protocol</div>
          <div className="cli-prestart-desc">
            Timer starts when you click START.<br />
            2 Python if/elif/else questions.<br />
            Tab key inserts 4 spaces. Retry as many times as you need.
          </div>
          <button
            className="cli-start-btn"
            style={{ borderColor: ACCENT, color: ACCENT }}
            onClick={startChallenge}
          >
            [ START CHALLENGE ]
          </button>
        </div>
      )}

      {/* QUESTIONS */}
      {started && (
        <div className="cli-questions">
          {QUESTIONS.map(q => (
            <QuestionBlock
              key={q.id}
              q={q}
              onCorrect={() => handleCorrect(q.id)}
            />
          ))}
        </div>
      )}

      {/* RESULTS */}
      {finished && (
        <div className="cli-results" style={{ '--ca': ACCENT }}>
          <div className="cli-results-title" style={{ color: ACCENT }}>
            ── CHALLENGE COMPLETE ──
          </div>
          <div className="cli-results-grid">
            {QUESTIONS.map(q => (
              <div key={q.id} className="cli-result-row">
                <span>Q{q.id} — {q.title}</span>
                <span style={{ color: ACCENT }}>
                  {qTimes[q.id] !== undefined ? formatTime(qTimes[q.id]) : '—'}
                </span>
                <span className="cr-ok">✓</span>
              </div>
            ))}
            <div className="cli-result-row total">
              <span>TOTAL TIME</span>
              <span style={{ color: ACCENT }}>{formatTime(elapsed)}</span>
              <span />
            </div>
          </div>
          <div className="cli-results-note">
            // both solved — show this screen to the organizer
          </div>
        </div>
      )}
    </div>
  );
}
