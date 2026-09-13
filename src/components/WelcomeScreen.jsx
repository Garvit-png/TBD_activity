import { useEffect, useState } from 'react';
import { playKeyClick, playWelcomeReveal } from '../utils/sound';

const FULL_TEXT = 'WELCOME TO ....';

export default function WelcomeScreen({ onDone }) {
  const [typed, setTyped]   = useState('');
  const [phase, setPhase]   = useState('typing'); // 'typing' | 'done' | 'exiting'

  useEffect(() => {
    if (phase !== 'typing') return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(FULL_TEXT.slice(0, i));
      playKeyClick();

      if (i >= FULL_TEXT.length) {
        clearInterval(interval);
        setPhase('done');
        playWelcomeReveal();

        // Let it sit so the viewer can actually read it
        setTimeout(() => {
          setPhase('exiting');
          setTimeout(onDone, 600);
        }, 3000);
      }
    }, 160); // slower — cinematic keystroke pace

    return () => clearInterval(interval);
  }, [phase, onDone]);

  return (
    <div className="welcome-screen">
      <div className="welcome-label">// tbd-os terminal v2.0.6</div>
      <div className="welcome-text glitch" data-text={typed}>
        {typed}
        {phase !== 'exiting' && <span className="cursor-blink" />}
      </div>
      <div className="prompt-line">
        {phase === 'done' ? '> standby...' : '> _'}
      </div>
    </div>
  );
}
