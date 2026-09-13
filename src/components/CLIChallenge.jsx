import { useState, useEffect, useRef } from 'react';
import { playKeyClick, playCorrectCode, playWrongCode, playDigit, playOkTick } from '../utils/sound';

/* ─────────────────────────────────────────────────────────────────────────
   QUESTIONS
   Easy, plain-language, retry allowed.
   accepts[] = all valid answers (case-insensitive, extra spaces trimmed).
───────────────────────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 1,

    title: 'List the files',

    setup: [
      'Your current location (working directory):',
      '    /home/user',
      '',
      'Inside /home/user there is a folder called  projects',
      'which contains some files — including hidden ones',
      '(hidden files start with a dot, like  .secret)',
    ],

    ask: 'Write the command to show ALL files inside the projects folder — including hidden ones — without going inside it.',

    hint: 'Use  ls  with a flag that shows hidden files, and give it the folder name.',

    accepts: [
      // single-line (no cd)
      'ls -a projects',
      'ls -a projects/',
      'ls -la projects',
      'ls -la projects/',
      'ls -al projects',
      'ls -al projects/',
      'ls -a /home/user/projects',
      'ls -a /home/user/projects/',
      'ls -la /home/user/projects',
      'ls -la /home/user/projects/',
      // multi-line: cd into folder then ls
      'cd projects\nls -a',
      'cd projects\nls -a .',
      'cd projects\nls -la',
      'cd projects\nls -al',
      'cd projects/\nls -a',
      'cd projects/\nls -la',
      'cd /home/user/projects\nls -a',
      'cd /home/user/projects\nls -la',
      'cd /home/user/projects/\nls -a',
      'cd /home/user/projects/\nls -la',
      // ls . variants after cd
      'cd projects\nls -a .',
      'cd projects\nls -la .',
    ],

    solutions: [
      {
        cmd:   'ls -a projects',
        label: 'Basic — show all files including hidden',
        lines: [
          'ls          →  list files in a folder',
          '-a          →  show ALL files, including hidden ones',
          '               (hidden files start with a dot, like .secret)',
          'projects    →  the folder name (relative to where you are)',
        ],
      },
      {
        cmd:   'ls -la projects',
        label: 'Detailed — same but with extra info',
        lines: [
          'ls          →  list files',
          '-l          →  show details: permissions, size, date modified',
          '-a          →  also show hidden files',
          'projects    →  the target folder',
          '',
          '-la and -al are the same thing — order of flags does not matter',
        ],
      },
      {
        cmd:   'ls -a /home/user/projects',
        label: 'Full absolute path version',
        lines: [
          'Same as the first solution, but using the full path',
          'instead of a relative folder name.',
          '',
          '/home/user/projects  →  the complete path to the folder',
        ],
      },
    ],
  },

  {
    id: 2,

    title: 'Copy a file',

    setup: [
      'Your current location (working directory):',
      '    /home/user/projects',
      '',
      'Inside this folder there is a file called  notes.txt',
      '',
      'One level up, inside  /home/user,  there is a folder',
      'called  backup  (it is NOT inside projects)',
    ],

    ask: 'Write the command to copy  notes.txt  into the  backup  folder.',

    hint: 'Use  cp  (copy). To go one level up in a path, use  ../',

    accepts: [
      'cp notes.txt ../backup',
      'cp notes.txt ../backup/',
      'cp notes.txt /home/user/backup',
      'cp notes.txt /home/user/backup/',
      'cp /home/user/projects/notes.txt /home/user/backup',
      'cp /home/user/projects/notes.txt /home/user/backup/',
      'cp ./notes.txt ../backup',
      'cp ./notes.txt ../backup/',
    ],

    solutions: [
      {
        cmd:   'cp notes.txt ../backup/',
        label: 'Relative path — go up one level with ..',
        lines: [
          'cp           →  copy command',
          'notes.txt    →  the file to copy (it is in your current folder)',
          '../backup/   →  where to put the copy:',
          '    ..       →  go one level up  (takes you to /home/user)',
          '    backup/  →  the backup folder that is there',
        ],
      },
      {
        cmd:   'cp notes.txt /home/user/backup/',
        label: 'Absolute destination path',
        lines: [
          'cp                    →  copy command',
          'notes.txt             →  source file (current directory)',
          '/home/user/backup/    →  the full path to the backup folder',
          '',
          'Same result as  ../backup/  — just written as a full path.',
        ],
      },
      {
        cmd:   'cp /home/user/projects/notes.txt /home/user/backup/',
        label: 'Both paths fully written out',
        lines: [
          'cp  source  destination  — both paths written in full',
          '',
          '/home/user/projects/notes.txt  →  exact location of the file',
          '/home/user/backup/             →  exact location of destination',
          '',
          'Most explicit form — works from anywhere on the system.',
        ],
      },
    ],
  },
];

const SOLUTION_PASSWORD = 'TBD';

/* ── helpers ── */
function formatTime(ms) {
  const s  = Math.floor(ms / 1000);
  const m  = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
  return `${m}:${ss}.${cs}`;
}

function normalize(str) {
  // Works for both single-line and multi-line answers.
  // Trims each line, removes blank lines, collapses inner spaces, lowercases.
  return str
    .split('\n')
    .map(l => l.trim().replace(/\s+/g, ' '))
    .filter(l => l.length > 0)
    .join('\n')
    .toLowerCase();
}

/* ─────────────────────────────────────────────────────────────────────────
   SOLUTION MODAL — shows multiple solutions with tab switching
───────────────────────────────────────────────────────────────────────── */
function SolutionModal({ question, accent, onClose }) {
  const [pw,      setPw]      = useState('');
  const [status,  setStatus]  = useState('locked');
  const [shake,   setShake]   = useState(false);
  const [tab,     setTab]     = useState(0);   // which solution is active
  const ref = useRef(null);

  useEffect(() => { setTimeout(() => ref.current?.focus(), 60); }, []);

  const handleChange = (e) => {
    if (status === 'open') return;
    const val = e.target.value.toUpperCase();
    setPw(val);
    if (val === SOLUTION_PASSWORD) {
      setStatus('open');
      playCorrectCode();
    } else if (val.length >= SOLUTION_PASSWORD.length) {
      setStatus('wrong');
      playWrongCode();
      setShake(true);
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
        style={{ '--sa': accent }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sol-modal-header">
          <span style={{ color: accent }}>SOLUTION — Q{question.id}: {question.title}</span>
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
              type="text"
              value={pw}
              onChange={handleChange}
              placeholder="________"
              maxLength={10}
              autoComplete="off"
              spellCheck="false"
            />
            <div className="sol-solution-count">
              {solutions.length} valid solution{solutions.length > 1 ? 's' : ''} available
            </div>
          </>
        ) : (
          <div className="sol-content">
            {/* ── tab bar ── */}
            {solutions.length > 1 && (
              <div className="sol-tabs">
                {solutions.map((s, i) => (
                  <button
                    key={i}
                    className={`sol-tab ${i === tab ? 'active' : ''}`}
                    style={i === tab ? { borderColor: accent, color: accent } : {}}
                    onClick={() => { setTab(i); playDigit(); }}
                  >
                    Solution {i + 1}
                  </button>
                ))}
              </div>
            )}

            {/* ── label ── */}
            <div className="sol-sol-label" style={{ color: accent }}>
              {active.label}
            </div>

            {/* ── command ── */}
            <div className="sol-cmd" style={{ color: accent }}>
              $ {active.cmd}
            </div>

            {/* ── explanation ── */}
            <div className="sol-explain">
              {active.lines.map((line, i) => (
                <div key={i} className={`sol-line ${line === '' ? 'sol-gap' : ''}`}>
                  {line || '\u00A0'}
                </div>
              ))}
            </div>

            {/* ── nav arrows for convenience ── */}
            {solutions.length > 1 && (
              <div className="sol-nav">
                <button
                  className="sol-nav-btn"
                  onClick={() => { setTab(t => Math.max(0, t - 1)); playDigit(); }}
                  disabled={tab === 0}
                  style={{ color: accent }}
                >
                  ← prev
                </button>
                <span className="sol-nav-count" style={{ color: accent }}>
                  {tab + 1} / {solutions.length}
                </span>
                <button
                  className="sol-nav-btn"
                  onClick={() => { setTab(t => Math.min(solutions.length - 1, t + 1)); playDigit(); }}
                  disabled={tab === solutions.length - 1}
                  style={{ color: accent }}
                >
                  next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   QUESTION BLOCK
   Retry allowed: wrong answer clears input, shows red flash, user can try again.
   Correct answer locks the block (green).
───────────────────────────────────────────────────────────────────────── */
function QuestionBlock({ q, accent, started, onCorrect }) {
  const [answer,   setAnswer]   = useState('');
  const [status,   setStatus]   = useState('idle');  // idle | wrong | correct
  const [attempts, setAttempts] = useState(0);
  const [showSol,  setShowSol]  = useState(false);
  const [shake,    setShake]    = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

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
      // after shake — clear input, back to idle so they can retry
      setTimeout(() => {
        setShake(false);
        setStatus('idle');
        setAnswer('');
        inputRef.current?.focus();
      }, 800);
    }
  };

  const blockClass = `cli-qblock ${status === 'correct' ? 'q-correct' : status === 'wrong' ? 'q-wrong' : ''}`;

  return (
    <div className={blockClass} style={{ '--ca': accent }}>

      {/* ── header row ── */}
      <div className="cli-qheader">
        <span className="cli-qnum" style={{ color: accent }}>Q{q.id}</span>
        <span className="cli-qtitle">{q.title}</span>
        {status === 'correct' && <span className="cli-qstatus ok">✓ CORRECT</span>}
        {attempts > 0 && status !== 'correct' && (
          <span className="cli-attempts">attempt {attempts + 1}</span>
        )}
        <button
          className="cli-solution-btn"
          style={{ borderColor: accent, color: accent }}
          onClick={() => setShowSol(true)}
        >
          SOLUTION 🔒
        </button>
      </div>

      {/* ── setup / context ── */}
      <div className="cli-setup">
        {q.setup.map((line, i) => (
          <div key={i} className={`cli-setup-line ${line === '' ? 'cli-setup-gap' : ''}`}>
            {line || '\u00A0'}
          </div>
        ))}
      </div>

      {/* ── task ── */}
      <div className="cli-task-box">
        <div className="cli-task-label" style={{ color: accent }}>TASK</div>
        <div className="cli-task-text">{q.ask}</div>
      </div>

      {/* ── hint toggle ── */}
      <button
        className="cli-hint-toggle"
        style={{ color: accent }}
        onClick={() => setShowHint(h => !h)}
      >
        {showHint ? '▾ hide hint' : '▸ show hint'}
      </button>
      {showHint && (
        <div className="cli-hint-text">{q.hint}</div>
      )}

      {/* ── answer input ── */}
      <div className={`cli-answer-row ${shake ? 'shake' : ''}`}>
        <span className="cli-prompt" style={{ color: accent }}>$</span>
        <input
          ref={inputRef}
          className="cli-input"
          type="text"
          value={answer}
          onChange={e => {
            if (status !== 'correct') {
              setAnswer(e.target.value);
              playKeyClick();
            }
          }}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="type your command and press Enter..."
          disabled={status === 'correct'}
          autoComplete="off"
          spellCheck="false"
          autoCapitalize="none"
        />
        <button
          className="cli-submit-btn"
          style={{ borderColor: accent, color: accent }}
          onClick={submit}
          disabled={status === 'correct' || !answer.trim()}
        >
          {status === 'correct' ? '✓ DONE' : 'SUBMIT'}
        </button>
      </div>

      {/* wrong feedback */}
      {status === 'wrong' && (
        <div className="cli-wrong-hint">
          ✗ not quite — check spacing and flags, then try again
        </div>
      )}

      {/* solution modal */}
      {showSol && (
        <SolutionModal question={q} accent={accent} onClose={() => setShowSol(false)} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function CLIChallenge({ team, onComplete }) {
  const accent     = team === 'A' ? '#ff4455' : '#4488ff';
  const teamLabel  = team === 'A' ? 'TEAM A'  : 'TEAM B';
  const themeClass = team === 'A' ? 'theme-red' : 'theme-blue';

  const [elapsed,    setElapsed]    = useState(0);
  const [running,    setRunning]    = useState(false);
  const [started,    setStarted]    = useState(false);
  const [doneCount,  setDoneCount]  = useState(0);   // how many Qs answered correctly
  const [finished,   setFinished]   = useState(false);
  const [qTimes,     setQTimes]     = useState({});  // qid → ms at completion

  const intervalRef  = useRef(null);
  const startTimeRef = useRef(null);

  const startChallenge = () => {
    setStarted(true);
    setRunning(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 50);
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
    <div className={`cli-challenge ${themeClass}`} style={{ '--ca': accent }}>

      {/* ── TOP BAR ── */}
      <div className="cli-topbar">
        <div className="cli-team-badge" style={{ borderColor: accent, color: accent }}>
          {teamLabel}
        </div>
        <div className="cli-timer" style={{ color: running ? accent : started ? '#888' : '#555' }}>
          ⏱ {formatTime(elapsed)}
        </div>
        {started && (
          <div className="cli-total-live" style={{ color: finished ? accent : '#666' }}>
            {finished ? '✓ DONE' : 'TOTAL'}: {formatTime(elapsed)}
          </div>
        )}
        <div className="cli-title">CLI CHALLENGE</div>
      </div>

      {/* ── PRE-START ── */}
      {!started && (
        <div className="cli-prestart">
          <div className="cli-prestart-label">// ready to begin</div>
          <div className="cli-prestart-desc">
            The timer starts the moment you click START.<br />
            Answer both questions correctly to stop the clock.<br />
            You can retry as many times as you need.
          </div>
          <button
            className="cli-start-btn"
            style={{ borderColor: accent, color: accent }}
            onClick={startChallenge}
          >
            [ START CHALLENGE ]
          </button>
        </div>
      )}

      {/* ── QUESTIONS ── */}
      {started && (
        <div className="cli-questions">
          {QUESTIONS.map(q => (
            <QuestionBlock
              key={q.id}
              q={q}
              accent={accent}
              started={started}
              onCorrect={() => handleCorrect(q.id)}
            />
          ))}
        </div>
      )}

      {/* ── RESULTS ── */}
      {finished && (
        <div className="cli-results" style={{ '--ca': accent }}>
          <div className="cli-results-title" style={{ color: accent }}>
            ── CHALLENGE COMPLETE ──
          </div>
          <div className="cli-results-grid">
            {QUESTIONS.map(q => (
              <div key={q.id} className="cli-result-row">
                <span>Q{q.id} — {q.title}</span>
                <span style={{ color: accent }}>
                  {qTimes[q.id] !== undefined ? formatTime(qTimes[q.id]) : '—'}
                </span>
                <span className="cr-ok">✓</span>
              </div>
            ))}
            <div className="cli-result-row total">
              <span>TOTAL TIME</span>
              <span style={{ color: accent }}>{formatTime(elapsed)}</span>
              <span />
            </div>
          </div>
          <div className="cli-results-note">
            // both questions solved — show this screen to the organizer
          </div>
        </div>
      )}
    </div>
  );
}
