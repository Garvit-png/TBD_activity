import { useEffect, useState, useRef } from 'react';
import { playKeyClick, playErrorBuzz, playTBDReveal, playWelcomeReveal } from '../utils/sound';

const COMP_LABEL_FULL = 'WE WELCOME YOU ALL FOR THE SMALL COMPETITION NAMED...';

const NAME_ERRORS = [
  'ERR: loading name...',
  'FATAL: name.txt not found',
  'ERR: decrypting... failed',
  'NULL: name = undefined',
  'WARN: classified_name.enc — access denied',
  'ERR: too cool to load fast',
];

export default function FinalScreen({ onDone }) {
  const [compLabel,     setCompLabel]     = useState('');
  const [showNameError, setShowNameError] = useState(false);
  const [nameErrorText, setNameErrorText] = useState(NAME_ERRORS[0]);
  const [showName,      setShowName]      = useState(false);
  const [showSub,       setShowSub]       = useState(false);
  const timers = useRef([]);

  const addTimer = (fn, delay) => {
    const t = setTimeout(fn, delay);
    timers.current.push(t);
    return t;
  };

  useEffect(() => {
    playWelcomeReveal();

    let i = 0;
    const typeInterval = setInterval(() => {
      i++;
      setCompLabel(COMP_LABEL_FULL.slice(0, i));
      if (i % 2 === 0) playKeyClick();

      if (i >= COMP_LABEL_FULL.length) {
        clearInterval(typeInterval);

        addTimer(() => {
          setShowNameError(true);
          playErrorBuzz();

          let errIdx = 0;
          const errCycle = setInterval(() => {
            errIdx++;
            if (errIdx < NAME_ERRORS.length) {
              setNameErrorText(NAME_ERRORS[errIdx]);
              playErrorBuzz();
            } else {
              clearInterval(errCycle);
              addTimer(() => {
                setShowNameError(false);
                addTimer(() => {
                  setShowName(true);
                  playTBDReveal();
                  addTimer(() => {
                    setShowSub(true);
                    if (onDone) addTimer(onDone, 3000);
                  }, 2000);
                }, 400);
              }, 500);
            }
          }, 600);
          timers.current.push({ interval: errCycle }); // store for cleanup
        }, 800);
      }
    }, 80);

    return () => {
      clearInterval(typeInterval);
      timers.current.forEach(t => {
        if (t?.interval) clearInterval(t.interval);
        else clearTimeout(t);
      });
    };
  }, []);

  return (
    <div className="final-screen">
      <div className="final-welcome-label">// tbd-os :: event_launcher.sh</div>

      <div className="final-welcome-text glitch" data-text="WELCOME TO TBD">
        WELCOME TO TBD
      </div>

      <div className="comp-line">
        {compLabel}
        {compLabel.length < COMP_LABEL_FULL.length && <span className="cursor-blink" />}
      </div>

      {showNameError && (
        <div className="comp-name-wrapper">
          <span className="comp-name-error">{nameErrorText}</span>
        </div>
      )}

      {showName && (
        <div
          className="comp-name-text glitch"
          data-text="TBD"
          style={{ opacity: 0, animation: 'fadeInBig 1.2s 0s forwards' }}
        >
          TBD
        </div>
      )}

      {showSub && (
        <div className="final-subline">
          &gt; competition.exe loaded successfully — good luck, have fun_
        </div>
      )}
    </div>
  );
}
