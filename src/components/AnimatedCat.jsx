import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { content } from '../config/content';

// Danh sách các câu chúc dễ thương khi bé mèo được chạm vào
const MESSAGES = [
  'Tặng em bó hoa xinh nhất ngày 20/10 nè! 🌹',
  'Bó hoa này dành riêng cho công chúa của anh! 💐',
  'Chúc em luôn rạng rỡ, xinh đẹp và yêu đời!',
  'Nụ cười của em là điều ngọt ngào nhất thế gian!',
  'Yêu em nhiều lắmmm! 💖',
  'Hôm nay và mãi mãi, em luôn là điều tuyệt vời nhất!',
];

// Âm thanh chime nhẹ nhàng bằng Web Audio API khi chạm vào mèo
function playCuteChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
    });
  } catch {
    // Ignore audio errors if blocked
  }
}

export default function AnimatedCat() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [bursts, setBursts] = useState([]);
  const [floatingPetals, setFloatingPetals] = useState([]);
  const containerRef = useRef(null);

  // Sinh hiệu ứng đom đóm / tim bay nhẹ từ bó hoa định kỳ
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const item = {
        id,
        emoji: ['🌸', '✨', '💖', '🌹'][(Math.random() * 4) | 0],
        x: Math.random() * 50 - 25,
        s: 14 + Math.random() * 12,
      };
      setFloatingPetals((prev) => [...prev.slice(-6), item]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e) => {
    playCuteChime();
    setIsJumping(true);
    setMsgIdx((prev) => (prev + 1) % MESSAGES.length);

    // Bắn tim / hoa xung quanh
    const newBursts = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 50 + Math.random() * 60;
      return {
        id: Date.now() + i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 20,
        emoji: ['💖', '🌹', '✨', '🌸', '🐾'][(Math.random() * 5) | 0],
        rot: Math.random() * 60 - 30,
      };
    });
    setBursts(newBursts);

    setTimeout(() => setIsJumping(false), 700);
    setTimeout(() => setBursts([]), 1100);
  };

  return (
    <motion.div
      ref={containerRef}
      className="cat-container"
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 3.6, duration: 1.2, type: 'spring' }}
    >
      {/* Bong bóng lời thoại của bé mèo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={msgIdx}
          className="cat-speech glass"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.9 }}
          transition={{ duration: 0.35 }}
        >
          <span>{MESSAGES[msgIdx]}</span>
          <div className="cat-speech-tail" />
        </motion.div>
      </AnimatePresence>

      {/* Bé mèo hoạt hình */}
      <motion.div
        className="cat-character-wrapper"
        onClick={handleClick}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        animate={
          isJumping
            ? {
              y: [0, -32, 4, 0],
              rotate: [0, -12, 12, -6, 0],
              scale: [1, 1.15, 0.95, 1],
            }
            : {
              y: [0, -10, 0],
              rotate: [-2, 2, -2],
              scale: [1, 1.015, 1],
            }
        }
        transition={
          isJumping
            ? { duration: 0.65, ease: 'easeOut' }
            : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {/* Vầng hào quang sáng nhẹ sau lưng bé mèo */}
        <div className="cat-glow-aura" />

        <img
          src={`${import.meta.env.BASE_URL}cat-3d-transparent.png`}
          alt="Bé mèo 3D dễ thương tặng hoa 20/10"
          className="cat-image"
          draggable={false}
        />

        {/* Các cánh hoa / tim bay lên từ bó hoa */}
        {floatingPetals.map((p) => (
          <span
            key={p.id}
            className="cat-petal-float"
            style={{
              left: `calc(28% + ${p.x}px)`,
              fontSize: `${p.s}px`,
            }}
          >
            {p.emoji}
          </span>
        ))}

        {/* Bùng nổ tim và hoa khi bấm vào bé mèo */}
        {bursts.map((b) => (
          <motion.span
            key={b.id}
            className="cat-burst-emoji"
            initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 1.3,
              x: b.dx,
              y: b.dy,
              rotate: b.rot,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {b.emoji}
          </motion.span>
        ))}
      </motion.div>

      {/* Gợi ý tương tác */}
      <p className="cat-hint pulse">
        <span>🐾 Chạm vào bé mèo để nhận thêm quà nè 🌹</span>
      </p>
    </motion.div>
  );
}
