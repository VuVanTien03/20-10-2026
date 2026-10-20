import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Fireworks from './effects/Fireworks';
import { content } from '../config/content';

export default function Finale() {
  const fw = useRef(null);
  const [active, setActive] = useState(false);
  const [shown, setShown] = useState(false);
  const [rain, setRain] = useState([]);

  const reveal = () => {
    setShown(true);
    const w = window.innerWidth;
    const h = window.innerHeight;
    [0.2, 0.5, 0.8, 0.35, 0.65].forEach((f, i) => setTimeout(() => fw.current?.burst(w * f, h * (0.25 + (i % 2) * 0.15)), i * 250));
    setRain(Array.from({ length: 24 }, (_, i) => ({ id: i, x: Math.random() * 100, d: Math.random() * 1.5, s: 16 + Math.random() * 22 })));
  };

  return (
    <motion.section
      className="section finale"
      id="finale"
      onViewportEnter={() => setActive(true)}
      onViewportLeave={() => setActive(false)}
      viewport={{ amount: 0.5 }}
    >
      <Fireworks ref={fw} active={active} className="finale-fw" />
      <div className="finale-inner">
        <motion.h2
          className="script finale-title"
          initial={{ opacity: 0, scale: 0.6, filter: 'blur(12px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        >
          {content.finaleTitle}
        </motion.h2>

        <AnimatePresence mode="wait">
          {!shown ? (
            <motion.button
              key="btn"
              id="surprise-btn"
              className="cta"
              onClick={reveal}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {content.finaleButton}
            </motion.button>
          ) : (
            <motion.div key="gift" className="gift glass" initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, type: 'spring' }}>
              <h3 className="script">{content.surpriseTitle}</h3>
              <ul>
                {content.surprises.map((s, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.5 }}>
                    {s}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="footer">
          {content.footer} {content.hisName} <span className="heart-beat">♥</span>
        </footer>
      </div>

      {rain.map((r) => (
        <span key={r.id} className="float-heart" style={{ left: `${r.x}%`, fontSize: r.s, animationDelay: `${r.d}s` }}>
          {r.id % 3 ? '💖' : '🌹'}
        </span>
      ))}
    </motion.section>
  );
}
