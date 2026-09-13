import { useEffect, useState, useRef } from 'react';
import { playWelcomeReveal, playKeyClick } from '../utils/sound';
import CLIChallenge   from './CLIChallenge';
import PSPChallenge   from './PSPChallenge';
import PitchChallenge from './PitchChallenge';

const LEVEL_DATA = {
  cli: {
    label:  'CLI',
    title:  'COMMAND LINE CHALLENGE',
    accent: '#00ff41',
    icon:   '>_',
    lines: [
      '> Initializing CLI challenge environment...',
      '> Loading question bank...',
      '> [  OK  ] 2 questions loaded',
      '> [  OK  ] timer module ready',
      '> Team confirmed — preparing arena...',
    ],
  },
  psp: {
    label:  'PSP',
    title:  'PROBLEM SOLVING PROTOCOL',
    accent: '#00ffff',
    icon:   '◈',
    lines: [
      '> Booting PSP module...',
      '> Loading Python problem set...',
      '> [  OK  ] 2 if/elif/else questions loaded',
      '> [  OK  ] timer module ready',
      '> Team confirmed — preparing arena...',
    ],
  },
  pitch: {
    label:  'PITCH',
    title:  'PITCH YOUR IDEA',
    accent: '#ffd700',
    icon:   '⬡',
    lines: [
      '> Loading pitch stage...',
      '> Importing 15 pitch topics...',
      '> [  OK  ] topic bank loaded',
      '> [  OK  ] timer module ready',
      '> Select your product and start pitching.',
    ],
  },
};

export default function LevelPage({ levelId, team, onBack, onComplete }) {
  const data = LEVEL_DATA[levelId];

  // For CLI, accent follows team color
  const accent = levelId === 'cli' && team
    ? (team === 'A' ? '#ff4455' : '#4488ff')
    : data.accent;

  const [visibleLines, setVisibleLines] = useState([]);
  const [bootDone,     setBootDone]     = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    playWelcomeReveal();
    data.lines.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
        playKeyClick();
        if (i === data.lines.length - 1) {
          const t2 = setTimeout(() => setBootDone(true), 600);
          timers.current.push(t2);
        }
      }, 400 + i * 500);
      timers.current.push(t);
    });
    return () => timers.current.forEach(clearTimeout);
  }, [levelId]);

  if (levelId === 'cli' && bootDone) {
    return (
      <div className="level-page" style={{ '--accent': accent }}>
        <button className="level-back" onClick={onBack}>← BACK</button>
        <CLIChallenge team={team} onComplete={onComplete} />
      </div>
    );
  }

  if (levelId === 'psp' && bootDone) {
    return (
      <div className="level-page" style={{ '--accent': accent }}>
        <button className="level-back" onClick={onBack}>← BACK</button>
        <PSPChallenge team={team} onComplete={onComplete} />
      </div>
    );
  }

  if (levelId === 'pitch' && bootDone) {
    return (
      <div className="level-page" style={{ '--accent': accent }}>
        <button className="level-back" onClick={onBack}>← BACK</button>
        <PitchChallenge team={team} onComplete={onComplete} />
      </div>
    );
  }

  return (
    <div className="level-page" style={{ '--accent': accent }}>
      <button className="level-back" onClick={onBack}>← BACK</button>

      <div className="level-page-header">
        <div className="level-page-icon" style={{ color: accent }}>{data.icon}</div>
        <div className="level-page-title" style={{ color: accent }}>{data.label}</div>
        <div className="level-page-sub">{data.title}</div>
      </div>

      <div className="level-boot-log">
        {visibleLines.map((l, i) => (
          <div key={i} className="level-boot-line">
            {l}
            {i === visibleLines.length - 1 && !bootDone && <span className="cursor-blink" />}
          </div>
        ))}
      </div>

      {bootDone && levelId !== 'cli' && levelId !== 'psp' && (
        <div className="level-content">
          <div className="level-status-badge" style={{ borderColor: accent, color: accent }}>
            STATUS: COMING SOON
          </div>
          <div className="level-placeholder">
            <div className="lp-label">// arena content loads here</div>
            <div className="lp-desc">
              This is the <span style={{ color: accent }}>{data.label}</span> level arena.
              Content will be injected by the event organizers.
            </div>
            <div className="lp-cmd">&gt; awaiting further instructions_</div>
          </div>
        </div>
      )}
    </div>
  );
}
