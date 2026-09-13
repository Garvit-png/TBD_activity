import { useEffect, useState, useCallback } from 'react';
import { playErrorBuzz, playErrorEscalate } from '../utils/sound';

const ERROR_MESSAGES = [
  { title: 'FATAL ERROR',        msg: 'Segmentation fault (core dumped)',                    code: 'ERR_0x000000C5'   },
  { title: 'KERNEL PANIC',       msg: 'Not syncing: VFS: Unable to mount root fs',           code: 'PANIC_0xDEADBEEF' },
  { title: 'NULL POINTER',       msg: 'Attempt to dereference null pointer at 0x0000',       code: 'ERR_NULLPTR'      },
  { title: 'STACK OVERFLOW',     msg: 'Maximum call stack size exceeded',                    code: 'ERR_STACK_0xFF'   },
  { title: 'MEMORY LEAK',        msg: 'Heap exhausted — 99999 MB unfreed',                   code: 'ERR_MEM_LEAK'     },
  { title: 'CRITICAL FAILURE',   msg: 'sanity.exe has stopped working',                      code: 'ERR_0xC0000005'   },
  { title: 'ASSERTION FAILED',   msg: 'assert(this_makes_sense) failed at line 420',         code: 'ASSERT_FAIL'      },
  { title: 'RUNTIME ERROR',      msg: 'Division by zero in module: confidence.dll',          code: 'ERR_DIV0'         },
  { title: 'CONNECTION RESET',   msg: 'Server refused to believe you',                       code: 'ECONNREFUSED'     },
  { title: 'TIMEOUT EXCEPTION',  msg: 'Waiting for common sense... timed out (30s)',         code: 'ERR_TIMEOUT'      },
  { title: 'INFINITE LOOP',      msg: 'Thread stuck in procrastination.loop()',              code: 'ERR_LOOP_INF'     },
  { title: 'DISK FULL',          msg: 'No space left — too many ideas, no execution',        code: 'ENOSPC'           },
  { title: 'BAD ALLOCATION',     msg: 'Cannot allocate memory for responsibility',           code: 'ERR_ALLOC'        },
  { title: 'ACCESS DENIED',      msg: 'Permission denied: /dev/chill',                       code: 'EACCES'           },
  { title: 'FATAL: UNDEFINED',   msg: 'TypeError: plan is not a function',                   code: 'ERR_UNDEF'        },
  { title: 'OUT OF BOUNDS',      msg: 'Index out of range: expectations[]',                  code: 'ERR_BOUNDS'       },
  { title: 'DECODE ERROR',       msg: 'Cannot parse: life_choices.json — malformed',         code: 'ERR_DECODE'       },
  { title: 'DEPENDENCY MISSING', msg: 'Module "sleep" not found — 72h runtime',              code: 'ERR_NODEP'        },
];

let idCounter = 0;

export default function ErrorFlood({ onDone }) {
  const [popups, setPopups] = useState([]);

  const addPopup = useCallback(() => {
    const err = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
    setPopups(prev => [
      ...prev,
      {
        id: idCounter++,
        ...err,
        top:  `${5  + Math.random() * 80}%`,
        left: `${2  + Math.random() * 72}%`,
      },
    ]);
    playErrorBuzz();
  }, []);

  useEffect(() => {
    // Cinematic schedule:
    // Phase 1 — slow trickle, one by one so each error is readable (0–4s)
    // Phase 2 — acceleration (4–6s)
    // Phase 3 — rapid burst (6–7s)
    const schedule = [
      400,
      1100,
      1900,
      2800,
      3500,          // phase 1 ends — 5 errors, spaced out
      4000,
      4400,
      4750,
      5050,
      5300,          // phase 2 — picks up pace
      5500,
      5680,
      5840,
      5980,
      6100,
      6210,
      6310,
      6400,
      6480,
      6550,
      6615,
      6675,
      6730,
      6780,
      6825,
      6865,
      6900,
      6930,
      6958,
      6984,
      7008,
      7030,
      7050,
      7068,
      7084,
      7098,          // phase 3 — rapid-fire
    ];

    const timers = schedule.map(delay => setTimeout(addPopup, delay));

    // Escalation sounds at turning points
    const t1 = setTimeout(playErrorEscalate, 4200);
    const t2 = setTimeout(playErrorEscalate, 5600);
    const t3 = setTimeout(playErrorEscalate, 6500);
    timers.push(t1, t2, t3);

    // Done 1.5s after last popup
    const doneTimer = setTimeout(onDone, 8800);
    timers.push(doneTimer);

    return () => timers.forEach(clearTimeout);
  }, [addPopup, onDone]);

  return (
    <div className="error-container">
      {popups.map(p => (
        <div key={p.id} className="error-popup" style={{ top: p.top, left: p.left }}>
          <div className="err-title">⚠ {p.title}</div>
          <div>{p.msg}</div>
          <div className="err-code">{p.code}</div>
        </div>
      ))}
    </div>
  );
}
