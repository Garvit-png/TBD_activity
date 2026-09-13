import { useEffect } from 'react';
import { playHeheSound, playNoJokes } from '../utils/sound';

export default function HeheScreen({ onDone }) {
  useEffect(() => {
    // Boom on mount
    playHeheSound();

    // No-jokes chime after the text fades in
    const t1 = setTimeout(playNoJokes, 1400);

    // Hold longer — let the moment breathe
    const t2 = setTimeout(onDone, 5500);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="hehe-screen">
      <div className="hehe-text">HEHE</div>
      <div className="nojokes-text">— no jokes, for real though —</div>
    </div>
  );
}
