import { useEffect, useState } from 'react';
import {
  playBootBeep,
  playOkTick,
  playWarn,
  playSectionBeep,
  playProgressDone,
} from '../utils/sound';

const BOOT_LINES = [
  { text: 'TBD-OS v2.0.6 (build 20260913)',              cls: 'bright', delay: 0,    sound: 'boot' },
  { text: 'Copyright (c) TBD Systems. All rights reserved.', cls: 'dim', delay: 500,  sound: null },
  { text: '',                                              cls: '',      delay: 900,   sound: null },
  { text: 'Initializing hardware interface...',           cls: '',      delay: 1200,  sound: 'section' },
  { text: '[  OK  ] Memory: 65536 MB detected',           cls: 'dim',   delay: 2000,  sound: 'ok' },
  { text: '[  OK  ] CPU: TBD-X1 @ 99.9GHz',              cls: 'dim',   delay: 2600,  sound: 'ok' },
  { text: '[  OK  ] Storage: /dev/tbd0 mounted',          cls: 'dim',   delay: 3100,  sound: 'ok' },
  { text: '[  OK  ] Network interface: tbd-eth0 up',      cls: 'dim',   delay: 3600,  sound: 'ok' },
  { text: '',                                              cls: '',      delay: 4000,  sound: null },
  { text: 'Loading kernel modules...',                    cls: '',      delay: 4300,  sound: 'section' },
  { text: '[  OK  ] module: drama.ko',                    cls: 'dim',   delay: 5000,  sound: 'ok' },
  { text: '[  OK  ] module: chaos.ko',                    cls: 'dim',   delay: 5500,  sound: 'ok' },
  { text: '[  OK  ] module: suspense.ko',                 cls: 'dim',   delay: 6000,  sound: 'ok' },
  { text: '[ WARN ] module: stability.ko — NOT FOUND',   cls: 'warn',  delay: 6700,  sound: 'warn' },
  { text: '',                                              cls: '',      delay: 7100,  sound: null },
  { text: 'Starting TBD services...',                     cls: '',      delay: 7400,  sound: 'section' },
  { text: '[  OK  ] tbd-router.service started',          cls: 'dim',   delay: 8100,  sound: 'ok' },
  { text: '[  OK  ] event-manager.service started',       cls: 'dim',   delay: 8700,  sound: 'ok' },
  { text: '[ WARN ] sanity-check.service — DISABLED',    cls: 'warn',  delay: 9400,  sound: 'warn' },
  { text: '',                                              cls: '',      delay: 9800,  sound: null },
  { text: 'System ready. Launching TBD welcome sequence...', cls: 'bright', delay: 10200, sound: 'done' },
];

export default function BootScreen({ onDone }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers = [];

    BOOT_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));

        // sounds
        if (line.sound === 'boot')    playBootBeep();
        if (line.sound === 'ok')      playOkTick();
        if (line.sound === 'warn')    playWarn();
        if (line.sound === 'section') playSectionBeep();
        if (line.sound === 'done')    playProgressDone();
      }, line.delay);
      timers.push(t);
    });

    // Done 2s after last line
    const doneTimer = setTimeout(onDone, 12400);
    timers.push(doneTimer);

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="boot-screen">
      {visibleLines.map((line, i) => (
        <div key={i} className={`boot-line ${line.cls || ''}`}>
          {line.text || '\u00A0'}
        </div>
      ))}
      <div className="progress-bar-wrap" style={{ marginTop: 20 }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
