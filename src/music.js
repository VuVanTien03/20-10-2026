// Phát bản nhạc "Chờ chút..." (file: /music/song.mp3)
const audio = typeof Audio !== 'undefined' ? new Audio('/music/song.mp3') : null;
if (audio) {
  audio.loop = true;
  audio.volume = 0.85;
  audio.preload = 'auto';
}

let playing = false;
const listeners = new Set();

const emit = () => listeners.forEach((l) => l(playing));

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const isPlaying = () => playing;

export async function start() {
  if (playing || !audio) return;
  try {
    await audio.play();
    playing = true;
    emit();
  } catch (err) {
    console.warn('Playback waiting for user gesture:', err);
    const resumeOnGesture = async () => {
      window.removeEventListener('pointerdown', resumeOnGesture);
      window.removeEventListener('click', resumeOnGesture);
      window.removeEventListener('keydown', resumeOnGesture);
      try {
        await audio.play();
        playing = true;
        emit();
      } catch (e) {
        console.error('Audio play error:', e);
      }
    };
    window.addEventListener('pointerdown', resumeOnGesture, { once: true });
    window.addEventListener('click', resumeOnGesture, { once: true });
    window.addEventListener('keydown', resumeOnGesture, { once: true });
  }
}

export function stop() {
  if (!playing || !audio) return;
  audio.pause();
  playing = false;
  emit();
}

export const toggle = () => (playing ? stop() : start());
