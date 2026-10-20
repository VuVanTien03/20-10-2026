import { useEffect, useRef } from 'react';

const COLORS = ['#ff8fb1', '#ff5d8f', '#ffc2d4', '#f9a8d4', '#ffd6a5', '#e879f9'];

function drawPetal(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.8, s * 0.7, 0, s);
  ctx.bezierCurveTo(-s * 0.8, s * 0.7, -s * 0.9, -s * 0.6, 0, -s);
  ctx.fill();
}

function drawHeart(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.3, 0, s * 0.35);
  ctx.fill();
}

export default function PetalRain() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, raf;

    // Giảm DPR trên điện thoại để tiết kiệm băng thông GPU, giữ 60fps mượt mà
    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Số lượng cánh hoa cân bằng: 16 cánh trên điện thoại, tối đa 38 cánh trên máy tính
    const count = Math.round(isMobile ? 16 : Math.min(38, (window.innerWidth / 1200) * 30 + 16)) * (reduce ? 0.3 : 1);

    const make = (initial) => {
      const depth = Math.random();
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -25,
        s: isMobile ? 5 + depth * 8 : 6 + depth * 10,
        vy: 0.5 + depth * 1.2,
        sway: Math.random() * 2 + 0.5,
        ph: Math.random() * 6.28,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.03,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        a: 0.35 + depth * 0.55,
        heart: Math.random() < 0.2,
      };
    };

    const ps = Array.from({ length: count }, () => make(true));
    let t = 0;

    const loop = () => {
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.y += p.vy;
        p.x += Math.sin(t * p.sway + p.ph) * 0.7;
        p.rot += p.vr;
        if (p.y > h + 25) Object.assign(p, make(false));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.abs(Math.cos(t * p.sway + p.ph)) * 0.6 + 0.4);
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        if (p.heart) {
          drawHeart(ctx, p.s);
        } else {
          drawPetal(ctx, p.s);
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="fx-canvas fx-petals" aria-hidden="true" />;
}
