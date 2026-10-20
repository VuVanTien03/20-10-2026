import { useEffect, useRef } from 'react';

// Vệt lấp lánh theo ngón tay / chuột
export default function SparkleCursor() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, raf;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    const ps = [];
    let lx = 0, ly = 0;
    const add = (x, y) => {
      if (Math.hypot(x - lx, y - ly) < 6) return;
      lx = x; ly = y;
      for (let i = 0; i < 2; i++)
        ps.push({ x, y, vx: (Math.random() - 0.5) * 1.2, vy: Math.random() * 1.2 + 0.2, l: 1, s: Math.random() * 2.5 + 1, h: 320 + Math.random() * 60 });
    };
    const mm = (e) => add(e.clientX, e.clientY);
    const tm = (e) => add(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener('pointermove', mm);
    window.addEventListener('touchmove', tm, { passive: true });
    const star = (x, y, r) => {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rad = i % 2 ? r * 0.35 : r;
        const a = (i * Math.PI) / 4;
        ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
    };
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx; p.y += p.vy; p.l -= 0.03;
        if (p.l <= 0) { ps.splice(i, 1); continue; }
        ctx.fillStyle = `hsla(${p.h},100%,80%,${p.l})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${p.h},100%,75%)`;
        star(p.x, p.y, p.s * 2 * p.l + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', mm);
      window.removeEventListener('touchmove', tm);
    };
  }, []);
  return <canvas ref={ref} className="fx-canvas fx-sparkle" aria-hidden="true" />;
}
