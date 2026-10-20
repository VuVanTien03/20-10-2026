import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { content } from '../config/content';
import GalaxyOrbit from './GalaxyOrbit';

export default function IntroGate({ onOpen }) {
  const [open, setOpen] = useState(false);
  const [stars] = useState(() =>
    Array.from({ length: 55 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      d: Math.random() * 4,
      s: Math.random() * 3 + 1,
    }))
  );

  useEffect(() => {
    document.body.style.overflow = open ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = () => {
    setOpen(true);
    onOpen();
  };

  return (
    <AnimatePresence>
      {!open && (
        <motion.div
          id="intro-gate"
          className="gate"
          exit={{ opacity: 0, scale: 1.25, filter: 'blur(16px)' }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        >
          {/* Bầu trời sao ngân hà lấp lánh */}
          {stars.map((s, i) => (
            <span
              key={i}
              className="star"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.s,
                height: s.s,
                animationDelay: `${s.d}s`,
              }}
            />
          ))}

          {/* Tiêu đề chào mừng */}
          <motion.div
            className="gate-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <span className="gate-tag script">20 · 10 · 2026</span>
            <h1 className="gate-title script glow">{content.gateText}</h1>
          </motion.div>

          {/* Vòng xoáy ngân hà ảnh kỷ niệm với trái tim ở giữa xoay bằng tay */}
          <GalaxyOrbit photos={content.photos || []} onOpenHeart={go} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
