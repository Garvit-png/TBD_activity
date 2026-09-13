import { useState, useEffect } from 'react';

export default function StartOverlay({ onStart }) {
  const [clicked, setClicked] = useState(false);

  // Also allow any keypress to start
  useEffect(() => {
    const handler = (e) => {
      if (clicked) return;
      if (e.type === 'keydown' && ['Tab','Shift','Control','Alt','Meta'].includes(e.key)) return;
      setClicked(true);
      onStart();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [clicked, onStart]);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    onStart();
  };

  return (
    <div className="start-overlay" onClick={handleClick}>
      <div className="start-inner">
        <div className="start-logo">TBD</div>
        <div className="start-tagline">// system offline — awaiting operator input</div>
        <div className={`start-btn ${clicked ? 'clicked' : ''}`}>
          {clicked ? '> INITIALIZING...' : '[ CLICK TO BOOT ]'}
        </div>
        <div className="start-hint">
          {clicked ? '' : 'click anywhere or press any key'}
        </div>
      </div>
      <div className="start-grid" aria-hidden="true" />
    </div>
  );
}
