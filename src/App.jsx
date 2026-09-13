import { useState, useCallback } from 'react';
import './App.css';
import { initAudio, playFlash, playWarn } from './utils/sound';

import StartOverlay   from './components/StartOverlay';
import BootScreen     from './components/BootScreen';
import WelcomeScreen  from './components/WelcomeScreen';
import ErrorFlood     from './components/ErrorFlood';
import HeheScreen     from './components/HeheScreen';
import FinalScreen    from './components/FinalScreen';
import PasscodeScreen from './components/PasscodeScreen';
import Dashboard      from './components/Dashboard';
import TeamSelect     from './components/TeamSelect';
import LevelSelect    from './components/LevelSelect';
import LevelPage      from './components/LevelPage';
import ScoreBar       from './components/ScoreBar';

export default function App() {
  const [started,     setStarted]     = useState(false);
  const [stage,       setStage]       = useState('boot');
  const [portal,      setPortal]      = useState(null);
  const [showErrors,  setShowErrors]  = useState(false);
  const [flash,       setFlash]       = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [team,        setTeam]        = useState(null);

  // ── per-level elapsed times (ms) ─────────────────────────
  const [levelTimes, setLevelTimes] = useState({ cli: null, psp: null, pitch: null });

  const recordTime = useCallback((levelId, ms) => {
    setLevelTimes(prev => ({ ...prev, [levelId]: ms }));
  }, []);

  const isAnimating = portal === null;

  // ── flash helper ──────────────────────────────────────────
  const doFlash = useCallback((color, then) => {
    playFlash();
    setFlash(color);
    setTimeout(() => { setFlash(null); then(); }, 400);
  }, []);

  const goToPasscode = useCallback(() => {
    doFlash('green', () => setPortal('passcode'));
  }, [doFlash]);

  // ── start overlay ──────────────────────────────────────────
  const handleStart = useCallback(() => {
    initAudio();
    setTimeout(() => setStarted(true), 500);
  }, []);

  // ── skip ───────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    playWarn();
    goToPasscode();
  }, [goToPasscode]);

  // ── animation transitions ──────────────────────────────────
  const handleBootDone    = useCallback(() => doFlash('green', () => setStage('welcome')), [doFlash]);
  const handleWelcomeDone = useCallback(() => setShowErrors(true), []);
  const handleErrorsDone  = useCallback(() => { setShowErrors(false); doFlash('red', () => setStage('hehe')); }, [doFlash]);
  const handleHeheDone    = useCallback(() => doFlash('green', () => setStage('final')), [doFlash]);
  const handleFinalDone   = useCallback(() => doFlash('green', () => setPortal('passcode')), [doFlash]);

  // ── portal transitions ─────────────────────────────────────
  const handlePasscodeSuccess = useCallback(() => doFlash('green', () => setPortal('dashboard')), [doFlash]);
  const handleDashboardEnter  = useCallback(() => doFlash('green', () => setPortal('teamselect')), [doFlash]);
  const handleTeamConfirm     = useCallback((t) => { setTeam(t); doFlash('green', () => setPortal('levels')); }, [doFlash]);

  const handleLevelSelect = useCallback((levelId) => {
    setActiveLevel(levelId);
    doFlash('green', () => setPortal('level'));
  }, [doFlash]);

  const handleLevelBack = useCallback(() => {
    doFlash('green', () => { setPortal('levels'); setActiveLevel(null); });
  }, [doFlash]);

  // called by CLIChallenge / PSPChallenge when all questions solved
  const handleLevelComplete = useCallback((ms) => {
    if (activeLevel) recordTime(activeLevel, ms);
  }, [activeLevel, recordTime]);

  // ── render ─────────────────────────────────────────────────
  if (!started) return <StartOverlay onStart={handleStart} />;

  const showScoreBar = portal !== null; // visible on all portal screens

  return (
    <div className={`terminal ${showScoreBar ? 'has-score-bar' : ''}`}>
      {flash && <div className={`screen-flash ${flash === 'green' ? 'green' : ''}`} />}

      {/* ANIMATION */}
      {isAnimating && (
        <>
          {stage === 'boot'    && <BootScreen onDone={handleBootDone} />}
          {stage === 'welcome' && (
            <>
              <WelcomeScreen onDone={handleWelcomeDone} />
              {showErrors && <ErrorFlood onDone={handleErrorsDone} />}
            </>
          )}
          {stage === 'hehe'  && <HeheScreen  onDone={handleHeheDone} />}
          {stage === 'final' && <FinalScreen onDone={handleFinalDone} />}
          <button className="skip-btn" onClick={handleSkip} aria-label="Skip intro">
            SKIP  ⟶
          </button>
        </>
      )}

      {/* PORTAL */}
      {portal === 'passcode'   && <PasscodeScreen onSuccess={handlePasscodeSuccess} />}
      {portal === 'dashboard'  && <Dashboard      onEnter={handleDashboardEnter} />}
      {portal === 'teamselect' && <TeamSelect      onSelect={handleTeamConfirm} />}
      {portal === 'levels'     && <LevelSelect     onSelect={handleLevelSelect} />}
      {portal === 'level'      && activeLevel && (
        <LevelPage
          levelId={activeLevel}
          team={team}
          onBack={handleLevelBack}
          onComplete={handleLevelComplete}
        />
      )}

      {/* SCORE BAR — fixed top strip, always on portal screens */}
      {showScoreBar && <ScoreBar times={levelTimes} />}
    </div>
  );
}
