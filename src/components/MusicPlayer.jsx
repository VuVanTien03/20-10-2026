import { useEffect, useState } from 'react';
import { subscribe, toggle, isPlaying } from '../music';

export default function MusicPlayer() {
  const [on, setOn] = useState(isPlaying());
  useEffect(() => subscribe(setOn), []);
  return (
    <button id="music-toggle" className={`music ${on ? 'spin' : ''}`} onClick={toggle} aria-label={on ? 'Tắt nhạc' : 'Bật nhạc'}>
      <span className="disc">{on ? '♪' : '▶'}</span>
    </button>
  );
}
