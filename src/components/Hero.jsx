import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { content } from '../config/content';
import AnimatedCat from './AnimatedCat';

function useTypewriter(text, start, speed = 70) {
  const [out, setOut] = useState('');
  useEffect(() => {
    if (!start) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, start, speed]);
  return out;
}

export default function Hero({ started }) {
  const title = useTypewriter(content.heroGreeting, started, 80);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const op = useTransform(scrollY, [0, 500], [1, 0.1]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Chỉ kích hoạt hiệu ứng nghiêng theo chuột trên thiết bị có chuột (Desktop), tránh làm giật lag điện thoại
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let ticking = false;
    const mm = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setTilt({
            x: (e.clientX / window.innerWidth - 0.5) * 16,
            y: (e.clientY / window.innerHeight - 0.5) * 16,
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('pointermove', mm, { passive: true });
    return () => window.removeEventListener('pointermove', mm);
  }, []);

  return (
    <section className="section hero" id="hero">
      <motion.div className="hero-inner" style={{ y, opacity: op }}>
        <div className="hero-layer" style={{ transform: `translate(${tilt.x * -0.6}px, ${tilt.y * -0.6}px)` }}>
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={started ? { opacity: 1 } : {}} transition={{ delay: 0.3, duration: 1.2 }}>
            20 · 10 · 2026
          </motion.p>
          <h1 className="script hero-title" aria-label={content.heroGreeting}>
            <span>{title}</span>
            <span className="caret" />
          </h1>
          <motion.h2 className="hero-name" initial={{ opacity: 0, y: 20 }} animate={started ? { opacity: 1, y: 0 } : {}} transition={{ delay: 2.4, duration: 1.2 }}>
            {content.herName} <span className="heart-beat">♥</span>
          </motion.h2>
        </div>
        <motion.p
          className="hero-sub"
          style={{ transform: `translate(${tilt.x * 0.4}px, ${tilt.y * 0.4}px)` }}
          initial={{ opacity: 0 }}
          animate={started ? { opacity: 1 } : {}}
          transition={{ delay: 3.2, duration: 1.4 }}
        >
          {content.heroSub}
        </motion.p>
        <AnimatedCat />
      </motion.div>
      <div className="scroll-cue" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
