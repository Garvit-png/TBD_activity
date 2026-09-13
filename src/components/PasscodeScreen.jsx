import { useState, useEffect, useRef } from 'react';
import { playDigit, playWrongCode, playCorrectCode } from '../utils/sound';

function getCurrentTimeCode() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}${m}`; // e.g. "1432"
}

export default function PasscodeScreen({ onSuccess }) {
  const [input,    setInput]    = useState('');
  const [status,   setStatus]   = useState('idle'); // idle | wrong | correct
  const [attempts, setAttempts] = useState(0);
  const [shake,    setShake]    = useState(false);
  const inputRef = useRef(null);

  // auto-focus so keyboard appears
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => {
    if (status === 'correct') return;
    // only digits, max 4
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > input.length) playDigit(); // only beep on add
    setInput(raw);

    if (raw.length === 4) {
      const correct = getCurrentTimeCode();
      if (raw === correct) {
        setStatus('correct');
        playCorrectCode();
        setTimeout(onSuccess, 1200);
      } else {
        setStatus('wrong');
        setAttempts(a => a + 1);
        playWrongCode();
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setStatus('idle');
          setInput('');
        }, 900);
      }
    }
  };

  // Display dots for typed digits
  const dots = Array.from({ length: 4 }, (_, i) => ({
    filled: i < input.length,
  }));

  const statusMsg = () => {
    if (status === 'correct') return '> ACCESS GRANTED';
    if (status === 'wrong')   return `> WRONG CODE — ${attempts} failed attempt${attempts > 1 ? 's' : ''}`;
    return '> ENTER 4-DIGIT ACCESS CODE';
  };

  return (
    <div className="passcode-screen" onClick={() => inputRef.current?.focus()}>
      <div className="passcode-inner">
        <div className="passcode-label">// tbd-os :: security_gate.sh</div>
        <div className="passcode-title">IDENTITY VERIFICATION</div>

        <div className="passcode-hint">
          hint: <span className="hint-val">current time — no colon (HHMM)</span>
        </div>

        {/* dot display */}
        <div className={`passcode-dots ${shake ? 'shake' : ''} ${status}`}>
          {dots.map((d, i) => (
            <div key={i} className={`passcode-dot ${d.filled ? 'filled' : ''}`} />
          ))}
        </div>

        {/* visible-but-visually-hidden input — always on top of dots for mobile tap */}
        <input
          ref={inputRef}
          className="passcode-hidden-input"
          type="tel"
          inputMode="numeric"
          pattern="\d*"
          value={input}
          onChange={handleChange}
          maxLength={4}
          autoComplete="off"
          aria-label="Passcode input"
        />

        <div className={`passcode-status ${status}`}>
          {statusMsg()}
        </div>

        {attempts >= 3 && status !== 'correct' && (
          <div className="passcode-warn">
            ⚠ multiple failed attempts logged
          </div>
        )}
      </div>
    </div>
  );
}
