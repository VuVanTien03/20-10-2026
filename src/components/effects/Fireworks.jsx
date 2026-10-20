import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const PALETTE = [330, 340, 20, 45, 290, 350];

// Pháo hoa canvas. Props: active (tự bắn), ref.burst(x,y)
const Fireworks = forwardRef(function Fireworks({ active = true, className = '' }, ref) {
  const cv = useRef(null);
  const api = useRef({});
  const activeRef = useRef(active);
  activeRef.current = active;

  useImperativeHandle(ref, () => ({ burst: (x, y) => api.current.burst?.(x, y) }));

  useEffect(() => {
    const canvas = cv.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, raf, last = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    const rockets = [];
    const sparks = [];

    const burst = (x, y) => {
      const hue = PALETTE[(Math.random() * PALETTE.length) | 0];
      const heart = Math.random() < 0.4;
      const n = heart ? 70 : 80;
      for (let i = 0; i < n; i++) {
        let vx, vy;
        if (heart) {
          const t = (i / n) * Math.PI * 2;
          vx = (16 * Math.sin(t) ** 3) * 0.28;
          vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.28;
        } else {
          const a = Math.random() * 6.28;
          const sp = Math.random() * 4.5 + 1;
          vx = Math.cos(a) * sp;
          vy = Math.sin(a) * sp;
        }
        sparks.push({ x, y, vx, vy, life: 1, hue: hue + Math.random() * 20 - 10, d: 0.012 + Math.random() * 0.012 });
      }
    };
    api.current.burst = burst;

    const launch = () => {
      rockets.push({ x: w * (0.15 + Math.random() * 0.7), y: h, ty: h * (0.15 + Math.random() * 0.35), vy: -(6 + Math.random() * 3) });
    };

    const loop = (ts) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      if (activeRef.current && ts - last > 700) {
        launch();
        last = ts;
      }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        ctx.fillStyle = '#ffe6f0';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, 6.28);
        ctx.fill();
        if (r.y <= r.ty) {
          burst(r.x, r.y);
          rockets.splice(i, 1);
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.045;
        s.vx *= 0.985;
        s.life -= s.d;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `hsla(${s.hue},100%,68%,${s.life})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.2 * s.life + 0.4, 0, 6.28);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={cv} className={`fx-fireworks ${className}`} aria-hidden="true" />;
});

export default Fireworks;
