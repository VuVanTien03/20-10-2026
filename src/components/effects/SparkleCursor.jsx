import { useEffect, useRef } from 'react';

// Vệt lấp lánh nhẹ nhàng theo ngón tay / chuột (Tối ưu GPU, dừng khi nhàn rỗi)
export default function SparkleCursor() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    let w, h, raf;
    let isRunning = false;

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
      if (ps.length === 0) {
        ctx.clearRect(0, 0, w, h);
        isRunning = false;
        return; // Dừng vòng lặp RAF khi không có hạt, tiết kiệm 100% CPU khi nghỉ
      }

      ctx.clearRect(0, 0, w, h);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx;
        p.y += p.vy;
        p.l -= 0.04;
        if (p.l <= 0) {
          ps.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `hsla(${p.h},100%,85%,${p.l})`;
        star(p.x, p.y, p.s * 1.8 * p.l + 0.8);
      }

      raf = requestAnimationFrame(loop);
    };

    const startLoopIfNeeded = () => {
      if (!isRunning) {
        isRunning = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const add = (x, y) => {
      const minDistance = isMobile ? 12 : 6;
      if (Math.hypot(x - lx, y - ly) < minDistance) return;
      lx = x;
      ly = y;

      const spawnCount = isMobile ? 1 : 2;
      for (let i = 0; i < spawnCount; i++) {
        ps.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.0,
          vy: Math.random() * 0.8 + 0.2,
          l: 1,
          s: Math.random() * 2 + 1,
          h: 320 + Math.random() * 60,
        });
      }
      startLoopIfNeeded();
    };

    const mm = (e) => add(e.clientX, e.clientY);
    const tm = (e) => {
      if (e.touches && e.touches[0]) {
        add(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('pointermove', mm, { passive: true });
    window.addEventListener('touchmove', tm, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', mm);
      window.removeEventListener('touchmove', tm);
    };
  }, []);

  return <canvas ref={ref} className="fx-canvas fx-sparkle" aria-hidden="true" />;
}
