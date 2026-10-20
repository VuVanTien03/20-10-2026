import { useState } from 'react';
import IntroGate from './components/IntroGate';
import Hero from './components/Hero';
import LoveLetter from './components/LoveLetter';
import Garden from './components/Garden';
import Finale from './components/Finale';
import MusicPlayer from './components/MusicPlayer';
import PetalRain from './components/effects/PetalRain';
import SparkleCursor from './components/effects/SparkleCursor';
import { start } from './music';

export default function App() {
  const [started, setStarted] = useState(false);
  const open = () => {
    start();
    setTimeout(() => setStarted(true), 500);
  };
  return (
    <>
      <div className="aurora" aria-hidden="true">
        <i /><i /><i />
      </div>
      <PetalRain />
      <SparkleCursor />
      <IntroGate onOpen={open} />
      {started && <MusicPlayer />}
      <main>
        <Hero started={started} />
        <LoveLetter />
        <Garden />
        <Finale />
      </main>
    </>
  );
}
