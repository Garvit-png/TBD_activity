/**
 * PitchChallenge — shows all 15 pitch topics with problem + product.
 * Teams pick one and pitch. No timer auto-stop — organizer decides when done.
 * Timer runs from START until organizer manually ends (or team goes back).
 */
import { useState, useEffect, useRef } from 'react';
import { playOkTick, playPing, playCorrectCode } from '../utils/sound';

const ACCENT = '#ffd700';

function formatTime(ms) {
  const s  = Math.floor(ms / 1000);
  const m  = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
  return `${m}:${ss}.${cs}`;
}

const TOPICS = [
  {
    id: 1,
    emoji: '🧦',
    product: 'Smart Socks',
    problem: 'Students sit for 6–8 hours a day and don\'t get enough physical activity.',
    pitch: 'How can socks encourage students to walk/exercise?',
  },
  {
    id: 2,
    emoji: '🪑',
    product: 'Smart Chair',
    problem: 'Students procrastinate and spend hours sitting without studying.',
    pitch: 'How can the chair make students more productive?',
  },
  {
    id: 3,
    emoji: '🎒',
    product: 'AI Backpack',
    problem: 'Students frequently forget books, chargers, assignments, etc.',
    pitch: 'How does the backpack prevent students from forgetting things?',
  },
  {
    id: 4,
    emoji: '🥤',
    product: 'Smart Water Bottle',
    problem: 'Students forget to drink enough water during college.',
    pitch: 'How can the bottle make students stay hydrated?',
  },
  {
    id: 5,
    emoji: '⏰',
    product: 'Brutally Honest Alarm',
    problem: 'Students keep snoozing their alarms and miss classes.',
    pitch: 'How does this alarm actually get them out of bed?',
  },
  {
    id: 6,
    emoji: '📱',
    product: 'Anti-Procrastination Phone',
    problem: 'Students open Instagram for 5 minutes and end up scrolling for 2 hours. 😭',
    pitch: 'How does your phone stop you from wasting time?',
  },
  {
    id: 7,
    emoji: '🍕',
    product: 'Pizza Calculator',
    problem: 'College students don\'t know how much food to order for a group.',
    pitch: 'How can this product prevent food wastage?',
  },
  {
    id: 8,
    emoji: '🧠',
    product: 'Memory Helmet',
    problem: 'Students study everything the night before an exam and forget it the next day.',
    pitch: 'How does the helmet improve learning/retention?',
  },
  {
    id: 9,
    emoji: '👟',
    product: 'GPS Shoes',
    problem: 'New students often get lost around a large campus.',
    pitch: 'How can the shoes help students navigate?',
  },
  {
    id: 10,
    emoji: '☕',
    product: 'Smart Coffee Mug',
    problem: 'Students get tired while studying and constantly have to get up for coffee.',
    pitch: 'How can the mug improve their study experience?',
  },
  {
    id: 11,
    emoji: '🧹',
    product: 'Hostel Cleaning Robot',
    problem: 'Students\' hostel rooms become messy because nobody wants to clean them. 😂',
    pitch: 'How can it solve the cleanliness problem?',
  },
  {
    id: 12,
    emoji: '👕',
    product: 'Attendance T-Shirt',
    problem: 'Students don\'t know their attendance percentage until it\'s too late. 💀',
    pitch: 'How can the T-shirt prevent attendance shortages?',
  },
  {
    id: 13,
    emoji: '🖊️',
    product: 'Smart Pen',
    problem: 'Students write pages of notes without actually understanding anything.',
    pitch: 'How can the pen improve learning?',
  },
  {
    id: 14,
    emoji: '🛏️',
    product: 'Smart Bed',
    problem: 'Students say "5 more minutes" and wake up 2 hours later. 😭',
    pitch: 'How does the bed make sure they wake up?',
  },
  {
    id: 15,
    emoji: '🪙',
    product: 'Screaming Wallet',
    problem: 'Students spend their entire monthly pocket money within the first 10 days.',
    pitch: 'How does the wallet control unnecessary spending?',
  },
];

export default function PitchChallenge({ team, onComplete }) {
  const teamLabel  = team === 'A' ? 'TEAM A' : 'TEAM B';
  const teamAccent = team === 'A' ? '#ff4455' : '#4488ff';

  const [selected,  setSelected]  = useState(null);  // topic id
  const [started,   setStarted]   = useState(false);
  const [finished,  setFinished]  = useState(false);
  const [elapsed,   setElapsed]   = useState(0);
  const [running,   setRunning]   = useState(false);

  const intervalRef  = useRef(null);
  const startTimeRef = useRef(null);

  const startPitch = () => {
    setStarted(true);
    setRunning(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => setElapsed(Date.now() - startTimeRef.current), 50);
    playOkTick();
  };

  const stopPitch = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(true);
    playCorrectCode();
    if (onComplete) onComplete(Date.now() - startTimeRef.current);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const topic = TOPICS.find(t => t.id === selected);

  return (
    <div className="cli-challenge theme-pitch" style={{ '--ca': ACCENT }}>

      {/* TOP BAR */}
      <div className="cli-topbar">
        <div className="cli-team-badge" style={{ borderColor: teamAccent, color: teamAccent }}>
          {teamLabel}
        </div>
        <div className="cli-timer" style={{ color: running ? ACCENT : started ? '#888' : '#555' }}>
          ⏱ {formatTime(elapsed)}
        </div>
        {started && (
          <div className="cli-total-live" style={{ color: finished ? ACCENT : '#666' }}>
            {finished ? '✓ DONE' : 'LIVE'}: {formatTime(elapsed)}
          </div>
        )}
        <div className="cli-title">PITCH CHALLENGE</div>
      </div>

      {/* PRE-START — topic selection */}
      {!started && (
        <div className="pitch-prestart">
          <div className="pitch-prestart-label">// select your pitch topic</div>
          <div className="pitch-prestart-sub">
            Pick one product. Timer starts when you click START PITCH.
          </div>

          <div className="pitch-grid">
            {TOPICS.map(t => (
              <button
                key={t.id}
                className={`pitch-topic-card ${selected === t.id ? 'selected' : ''}`}
                style={selected === t.id ? { borderColor: ACCENT, boxShadow: `0 0 12px ${ACCENT}44` } : {}}
                onClick={() => { setSelected(t.id); playPing(); }}
              >
                <span className="pitch-topic-emoji">{t.emoji}</span>
                <span className="pitch-topic-name">{t.product}</span>
              </button>
            ))}
          </div>

          {selected && topic && (
            <div className="pitch-selected-detail">
              <div className="pitch-detail-product" style={{ color: ACCENT }}>
                {topic.emoji} {topic.product}
              </div>
              <div className="pitch-detail-row">
                <span className="pitch-detail-lbl">PROBLEM</span>
                <span className="pitch-detail-val">{topic.problem}</span>
              </div>
              <div className="pitch-detail-row">
                <span className="pitch-detail-lbl" style={{ color: ACCENT }}>PITCH</span>
                <span className="pitch-detail-val" style={{ color: '#ccc' }}>{topic.pitch}</span>
              </div>
              <button
                className="cli-start-btn pitch-start"
                style={{ borderColor: ACCENT, color: ACCENT }}
                onClick={startPitch}
              >
                [ START PITCH ]
              </button>
            </div>
          )}
        </div>
      )}

      {/* DURING PITCH */}
      {started && !finished && topic && (
        <div className="pitch-arena">
          <div className="pitch-arena-card" style={{ borderColor: ACCENT }}>
            <div className="pitch-arena-emoji">{topic.emoji}</div>
            <div className="pitch-arena-product" style={{ color: ACCENT }}>
              {topic.product}
            </div>
            <div className="pitch-arena-section">
              <div className="pitch-arena-lbl">THE PROBLEM</div>
              <div className="pitch-arena-text">{topic.problem}</div>
            </div>
            <div className="pitch-arena-section">
              <div className="pitch-arena-lbl" style={{ color: ACCENT }}>YOUR PITCH QUESTION</div>
              <div className="pitch-arena-text pitch-question" style={{ color: '#e8e8e8' }}>
                {topic.pitch}
              </div>
            </div>
          </div>

          <div className="pitch-stop-row">
            <div className="pitch-stop-hint">
              // present your pitch — click DONE when finished
            </div>
            <button
              className="cli-start-btn pitch-done-btn"
              style={{ borderColor: ACCENT, color: ACCENT }}
              onClick={stopPitch}
            >
              [ PITCH DONE ✓ ]
            </button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {finished && topic && (
        <div className="cli-results" style={{ '--ca': ACCENT }}>
          <div className="cli-results-title" style={{ color: ACCENT }}>
            ── PITCH COMPLETE ──
          </div>
          <div className="cli-results-grid">
            <div className="cli-result-row">
              <span>Product</span>
              <span style={{ color: ACCENT }}>{topic.emoji} {topic.product}</span>
              <span />
            </div>
            <div className="cli-result-row total">
              <span>PITCH TIME</span>
              <span style={{ color: ACCENT }}>{formatTime(elapsed)}</span>
              <span className="cr-ok">✓</span>
            </div>
          </div>
          <div className="cli-results-note">
            // pitch time recorded — show this screen to the organizer
          </div>
        </div>
      )}
    </div>
  );
}
