import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Âm thanh chime ngọt ngào khi chạm vào bé chuột hamster
function playHeartSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [659.25, 830.61, 987.77, 1318.5]; // E5, G#5, B5, E6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.07);
      osc.stop(ctx.currentTime + idx * 0.07 + 0.42);
    });
  } catch {
    // Ignore if audio context blocked
  }
}

const HAMSTER_QUOTES = [
  'Trái tim này là của em! ❤️',
  'Yêu em nhất trần đời! 🐹',
  'Tặng em cả tấm lòng nè! 💖',
  'Mãi mãi thương em! ✨',
];

export default function HamsterMascot({ size = 130, className = '', inLetter = false }) {
  const [isHopping, setIsHopping] = useState(false);
  const [bursts, setBursts] = useState([]);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [showQuote, setShowQuote] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Tạo tim bay nhẹ định kỳ từ trái tim trên tay hamster (tối ưu CPU mobile)
  useEffect(() => {
    const timer = setInterval(() => {
      const id = Date.now() + Math.random();
      setFloatingHearts((prev) => [
        ...prev.slice(-2),
        { id, x: Math.random() * 14 - 7, s: 12 + Math.random() * 6 },
      ]);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    playHeartSound();
    setIsHopping(true);
    setShowQuote(true);
    setQuoteIdx((prev) => (prev + 1) % HAMSTER_QUOTES.length);

    // Bắn chùm tim xung quanh
    const newBursts = Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 35 + Math.random() * 45;
      return {
        id: Date.now() + i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 15,
        emoji: ['❤️', '💖', '💕', '✨', '🐾'][(Math.random() * 5) | 0],
      };
    });
    setBursts(newBursts);

    setTimeout(() => setIsHopping(false), 600);
    setTimeout(() => setBursts([]), 1000);
    setTimeout(() => setShowQuote(false), 2400);
  };

  return (
    <div
      className={`hamster-wrapper ${className} ${inLetter ? 'in-letter' : ''}`}
      style={{ width: size, height: 'auto' }}
      onClick={handleClick}
      title="Chạm vào tớ nè!"
    >
      {/* Bong bóng lời thoại nhỏ */}
      <AnimatePresence>
        {showQuote && (
          <motion.div
            className="hamster-bubble"
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.85 }}
            transition={{ duration: 0.25 }}
          >
            <span>{HAMSTER_QUOTES[quoteIdx]}</span>
            <div className="hamster-bubble-tail" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="hamster-inner"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={
          isHopping
            ? {
                y: [0, -22, 2, 0],
                rotate: [0, -8, 8, -4, 0],
                scale: [1, 1.14, 0.96, 1],
              }
            : {
                y: [0, -6, 0],
                rotate: [-1.5, 1.5, -1.5],
              }
        }
        transition={
          isHopping
            ? { duration: 0.55, ease: 'easeOut' }
            : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <img
          src={`${import.meta.env.BASE_URL}hamster-heart.png`}
          alt="Bé hamster cầm trái tim"
          className="hamster-img"
          draggable={false}
        />

        {/* Tim bay lên từ bàn tay cầm tim */}
        {floatingHearts.map((h) => (
          <span
            key={h.id}
            className="hamster-float-heart"
            style={{
              right: `calc(10% + ${h.x}px)`,
              fontSize: `${h.s}px`,
            }}
          >
            ❤️
          </span>
        ))}

        {/* Bùng nổ tim khi bấm vào bé hamster */}
        {bursts.map((b) => (
          <motion.span
            key={b.id}
            className="hamster-burst-emoji"
            initial={{ opacity: 1, scale: 0.6, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 1.25,
              x: b.dx,
              y: b.dy,
            }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          >
            {b.emoji}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
