import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { content } from '../config/content';

// Các bảng màu tulip lãng mạn & sống động
const TULIP_PALETTES = [
  { name: 'rose-pink', outer: '#ff3366', inner: '#ff6699', tip: '#ffb3c6', glow: 'rgba(255, 51, 102, 0.45)' },
  { name: 'sunset-coral', outer: '#e63946', inner: '#f77f00', tip: '#fcbf49', glow: 'rgba(247, 127, 0, 0.45)' },
  { name: 'golden-sun', outer: '#f39c12', inner: '#f1c40f', tip: '#fef5d1', glow: 'rgba(241, 196, 15, 0.45)' },
  { name: 'lavender-dream', outer: '#6a0572', inner: '#ab83a1', tip: '#e8d7f1', glow: 'rgba(171, 131, 161, 0.45)' },
  { name: 'ruby-passion', outer: '#990024', inner: '#c9184a', tip: '#ff758f', glow: 'rgba(201, 24, 74, 0.45)' },
  { name: 'sweet-blush', outer: '#ff70a6', inner: '#ff9770', tip: '#ffd670', glow: 'rgba(255, 112, 166, 0.45)' },
  { name: 'royal-purple', outer: '#5c1349', inner: '#9b2270', tip: '#d66fa8', glow: 'rgba(155, 34, 112, 0.45)' },
  { name: 'pearl-cream', outer: '#f38375', inner: '#fbc3bc', tip: '#ffffff', glow: 'rgba(251, 195, 188, 0.45)' },
  { name: 'amber-flame', outer: '#d90429', inner: '#ff758f', tip: '#ffccd5', glow: 'rgba(217, 4, 41, 0.45)' },
  { name: 'pure-magenta', outer: '#7209b7', inner: '#b5179e', tip: '#f72585', glow: 'rgba(181, 23, 158, 0.45)' },
];

// Pre-render sẵn sprite đóa hoa tulip cho từng bảng màu trên Offscreen Canvas
// Giúp tăng tốc vẽ gấp 50-100 lần, loại bỏ hoàn toàn hiện tượng giật lag khi nở hàng trăm bông
function createTulipSprite(palette) {
  const c = document.createElement('canvas');
  c.width = 140;
  c.height = 180;
  const ctx = c.getContext('2d');

  const cx = 70;
  const baseY = 155;
  const cupW = 46;
  const cupH = 70;

  // 1. Quầng sáng aura mềm mại được nướng sẵn vào sprite (không tốn CPU tính shadowBlur)
  const glowGrad = ctx.createRadialGradient(cx, baseY - cupH * 0.55, 6, cx, baseY - cupH * 0.55, 60);
  glowGrad.addColorStop(0, palette.glow);
  glowGrad.addColorStop(0.55, palette.glow.replace(/[\d.]+\)$/, '0.15)'));
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, baseY - cupH * 0.55, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, baseY);

  // 2. Cánh sau
  ctx.fillStyle = palette.outer;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-cupW * 0.55, -cupH * 0.6, 0, -cupH * 1.05);
  ctx.quadraticCurveTo(cupW * 0.55, -cupH * 0.6, 0, 0);
  ctx.fill();

  // 3. Cánh trái
  const leftGrad = ctx.createLinearGradient(-cupW * 0.7, 0, 0, -cupH);
  leftGrad.addColorStop(0, palette.outer);
  leftGrad.addColorStop(0.5, palette.inner);
  leftGrad.addColorStop(1, palette.tip);
  ctx.fillStyle = leftGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-cupW * 0.9, -cupH * 0.3, -cupW * 0.85, -cupH * 0.85, -cupW * 0.25, -cupH);
  ctx.bezierCurveTo(-cupW * 0.08, -cupH * 0.92, -cupW * 0.1, -cupH * 0.4, 0, -cupH * 0.15);
  ctx.closePath();
  ctx.fill();

  // 4. Cánh phải
  const rightGrad = ctx.createLinearGradient(cupW * 0.7, 0, 0, -cupH);
  rightGrad.addColorStop(0, palette.outer);
  rightGrad.addColorStop(0.5, palette.inner);
  rightGrad.addColorStop(1, palette.tip);
  ctx.fillStyle = rightGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(cupW * 0.9, -cupH * 0.3, cupW * 0.85, -cupH * 0.85, cupW * 0.25, -cupH);
  ctx.bezierCurveTo(cupW * 0.08, -cupH * 0.92, cupW * 0.1, -cupH * 0.4, 0, -cupH * 0.15);
  ctx.closePath();
  ctx.fill();

  // 5. Cánh giữa chính diện
  const centerGrad = ctx.createRadialGradient(0, -cupH * 0.5, 2, 0, -cupH * 0.5, cupH * 0.8);
  centerGrad.addColorStop(0, palette.tip);
  centerGrad.addColorStop(0.4, palette.inner);
  centerGrad.addColorStop(1, palette.outer);
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.moveTo(-cupW * 0.18, -cupH * 0.05);
  ctx.bezierCurveTo(-cupW * 0.55, -cupH * 0.32, -cupW * 0.5, -cupH * 0.82, 0, -cupH * 0.98);
  ctx.bezierCurveTo(cupW * 0.5, -cupH * 0.82, cupW * 0.55, -cupH * 0.32, cupW * 0.18, -cupH * 0.05);
  ctx.closePath();
  ctx.fill();

  // 6. Đài hoa xanh
  ctx.fillStyle = '#265d45';
  ctx.beginPath();
  ctx.ellipse(0, 0, cupW * 0.18, cupH * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  return {
    canvas: c,
    cx,
    baseY,
    width: c.width,
    height: c.height,
    cupW,
    cupH,
  };
}

// Bộ nhớ đệm sprite
let CACHED_SPRITES = null;
function getCachedSprites() {
  if (!CACHED_SPRITES && typeof document !== 'undefined') {
    CACHED_SPRITES = TULIP_PALETTES.map((pal) => ({
      palette: pal,
      sprite: createTulipSprite(pal),
    }));
  }
  return CACHED_SPRITES;
}

// Quản lý AudioContext dùng chung
let sharedAudioCtx = null;
function getAudioContext() {
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => { });
  }
  return sharedAudioCtx;
}

// Âm thanh nở hoa diệu kỳ mượt mà
function playMagicBloomSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.065, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const chords = [220.0, 261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;
    chords.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.075);
      noteGain.gain.setValueAtTime(0, now + i * 0.075);
      noteGain.gain.linearRampToValueAtTime(1, now + i * 0.075 + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.075 + 0.55);
      osc.connect(noteGain);
      noteGain.connect(masterGain);
      osc.start(now + i * 0.075);
      osc.stop(now + i * 0.075 + 0.6);
    });
  } catch {
    // Ignore
  }
}

// Âm thanh gieo hoa đơn lẻ
function playSinglePop() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const freqs = [659.25, 783.99, 880.0, 1046.5, 1174.66];
    const freq = freqs[(Math.random() * freqs.length) | 0];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore
  }
}

// Vẽ đóa hoa tulip tối ưu hoá bằng GPU Sprite Stamp (Zero Lag, Locked 60 FPS)
function drawTulip(ctx, t, time) {
  const p = Math.min(1, Math.max(0, t.progress));
  if (p <= 0.01) return;

  const e = 1 - Math.pow(1 - p, 3);
  const stemH = t.stemLength * e;
  const sway = Math.sin(time * t.swaySpeed + t.swayPhase) * t.swayAmp * e;
  const topX = t.x + sway;
  const topY = t.y - stemH;

  ctx.globalAlpha = t.alpha || 1.0;

  // 1. Lá hoa tulip (màu mượt tự nhiên, không tạo garbage collector)
  if (e > 0.12) {
    const leafP = Math.min(1, (e - 0.12) / 0.88);

    // Lá trái
    ctx.fillStyle = '#265d45';
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - stemH * 0.08);
    ctx.quadraticCurveTo(
      t.x - t.size * 0.95 * leafP + sway * 0.2,
      t.y - stemH * 0.42,
      t.x - t.size * 0.4 * leafP + sway * 0.4,
      t.y - stemH * 0.72
    );
    ctx.quadraticCurveTo(
      t.x - t.size * 0.2 * leafP + sway * 0.3,
      t.y - stemH * 0.35,
      t.x,
      t.y - stemH * 0.22
    );
    ctx.closePath();
    ctx.fill();

    // Lá phải (chỉ vẽ cho hoa vừa và lớn để giữ 60 FPS)
    if (t.size > 22) {
      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.moveTo(t.x, t.y - stemH * 0.15);
      ctx.quadraticCurveTo(
        t.x + t.size * 0.85 * leafP + sway * 0.25,
        t.y - stemH * 0.48,
        t.x + t.size * 0.35 * leafP + sway * 0.45,
        t.y - stemH * 0.78
      );
      ctx.quadraticCurveTo(
        t.x + t.size * 0.18 * leafP + sway * 0.35,
        t.y - stemH * 0.38,
        t.x,
        t.y - stemH * 0.3
      );
      ctx.closePath();
      ctx.fill();
    }
  }

  // 2. Cuống hoa (stem)
  ctx.strokeStyle = '#276247';
  ctx.lineWidth = Math.max(1.5, t.size * 0.075);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(t.x, t.y);
  ctx.quadraticCurveTo(t.x + sway * 0.45, t.y - stemH * 0.5, topX, topY);
  ctx.stroke();

  // 3. Đóa hoa tulip nở (Hardware-accelerated sprite drawImage)
  if (e > 0.22 && t.sprite) {
    const bloomP = Math.min(1, (e - 0.22) / 0.78);
    const scale = (t.size / t.sprite.cupW) * bloomP;
    const drawW = t.sprite.width * scale;
    const drawH = t.sprite.height * scale;
    const rot = sway * 0.012;

    if (Math.abs(rot) > 0.005) {
      ctx.save();
      ctx.translate(topX, topY);
      ctx.rotate(rot);
      ctx.drawImage(t.sprite.canvas, -t.sprite.cx * scale, -t.sprite.baseY * scale, drawW, drawH);
      ctx.restore();
    } else {
      ctx.drawImage(t.sprite.canvas, topX - t.sprite.cx * scale, topY - t.sprite.baseY * scale, drawW, drawH);
    }
  }
}

export default function Garden() {
  const cv = useRef(null);
  const wrap = useRef(null);
  const [hasBloomed, setHasBloomed] = useState(false);
  const stateRef = useRef({
    tulips: [],
    sparkles: [],
    hasBloomed: false,
    w: 0,
    h: 0,
    sprites: [],
  });

  useEffect(() => {
    const canvas = cv.current;
    const ctx = canvas.getContext('2d');
    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    let w, h, raf;
    let isVisible = true;

    const sprites = getCachedSprites();
    stateRef.current.sprites = sprites;

    const resize = () => {
      const r = wrap.current ? wrap.current.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      w = r.width;
      h = r.height;
      stateRef.current.w = w;
      stateRef.current.h = h;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Nếu chưa nở vườn, đặt đóa hoa tulip ban đầu ở vị trí trung tâm nổi bật
      if (!stateRef.current.hasBloomed) {
        stateRef.current.tulips = [
          {
            id: 'initial',
            isInitial: true,
            x: w * 0.5,
            y: h * 0.88,
            size: Math.min(w, 540) * 0.14,
            stemLength: Math.min(h * 0.44, 310),
            progress: 1,
            palette: TULIP_PALETTES[0],
            sprite: sprites[0].sprite,
            swaySpeed: 1.6,
            swayAmp: 18,
            swayPhase: 0,
            delay: 0,
            alpha: 1.0,
            tierIdx: 99,
          },
        ];
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let startTime = performance.now();
    let lastTime = performance.now();

    const loop = (now) => {
      if (!isVisible) {
        raf = null;
        return;
      }
      const dt = Math.min(32, now - lastTime);
      lastTime = now;
      const time = (now - startTime) * 0.001;
      ctx.clearRect(0, 0, w, h);

      // Cỏ và lớp nền thảm xanh mịn màng
      if (stateRef.current.hasBloomed) {
        // Lớp sương hồng mơ màng ở chân trời xa
        const horizonMist = ctx.createLinearGradient(0, h * 0.28, 0, h * 0.48);
        horizonMist.addColorStop(0, 'rgba(255, 182, 193, 0)');
        horizonMist.addColorStop(0.6, 'rgba(255, 120, 150, 0.1)');
        horizonMist.addColorStop(1, 'rgba(38, 93, 69, 0.22)');
        ctx.fillStyle = horizonMist;
        ctx.fillRect(0, h * 0.28, w, h * 0.2);

        // Thảm xanh cánh đồng đan xen chiều sâu
        const grassGrad = ctx.createLinearGradient(0, h * 0.35, 0, h);
        grassGrad.addColorStop(0, 'rgba(18, 50, 35, 0.25)');
        grassGrad.addColorStop(0.35, 'rgba(20, 58, 40, 0.55)');
        grassGrad.addColorStop(0.7, 'rgba(15, 42, 29, 0.8)');
        grassGrad.addColorStop(1, 'rgba(8, 24, 16, 0.97)');
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, h * 0.35, w, h * 0.65);
      }

      // Cập nhật tiến độ nở hoa (dựa trên dt thực tế để mượt mà 60-144 FPS)
      const tulips = stateRef.current.tulips;
      for (let i = 0; i < tulips.length; i++) {
        const t = tulips[i];
        if (t.delay > 0) {
          t.delay -= dt;
        } else if (t.progress < 1) {
          t.progress = Math.min(1, t.progress + dt * 0.0012);
        }
        drawTulip(ctx, t, time);
      }

      // Vầng sáng lung linh quanh bông hoa đầu tiên khi chưa kích hoạt (Tối ưu radial gradient, không dùng shadowBlur)
      if (!stateRef.current.hasBloomed && tulips.length > 0) {
        const initT = tulips[0];
        const pulse = 0.8 + Math.sin(time * 3.5) * 0.25;
        const flowerHeadY = initT.y - initT.stemLength;

        ctx.save();
        const aura = ctx.createRadialGradient(
          initT.x,
          flowerHeadY - initT.size * 0.6,
          2,
          initT.x,
          flowerHeadY - initT.size * 0.6,
          initT.size * 1.4 * pulse
        );
        aura.addColorStop(0, 'rgba(255, 77, 109, 0.45)');
        aura.addColorStop(0.6, 'rgba(255, 182, 193, 0.16)');
        aura.addColorStop(1, 'rgba(255, 182, 193, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(initT.x, flowerHeadY - initT.size * 0.6, initT.size * 1.4 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        for (let i = 0; i < 3; i++) {
          const orbitAngle = time * 2.2 + (i * Math.PI * 2) / 3;
          const ox = initT.x + Math.cos(orbitAngle) * (initT.size * 0.95);
          const oy = flowerHeadY - initT.size * 0.6 + Math.sin(orbitAngle) * (initT.size * 0.6);
          ctx.beginPath();
          ctx.arc(ox, oy, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = '#fff0f5';
          ctx.fill();
        }
      }

      // Hạt phấn hoa / đom đóm / tim bay
      const sparkles = stateRef.current.sparkles;
      const maxSp = isMobile ? 18 : 40;
      if (stateRef.current.hasBloomed && Math.random() < 0.22 && sparkles.length < maxSp) {
        sparkles.push({
          x: Math.random() * w,
          y: h - Math.random() * (h * 0.6),
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(0.5 + Math.random() * 1.2),
          size: 2 + Math.random() * 2.5,
          color: ['#ffe6ea', '#ffd166', '#ff758f', '#e0aaff', '#f72585'][(Math.random() * 5) | 0],
          alpha: 0.85,
          decay: 0.006 + Math.random() * 0.006,
          isHeart: Math.random() < 0.35,
        });
      }

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;
        if (sp.alpha <= 0 || sp.y < 0) {
          sparkles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        if (sp.isHeart) {
          const s = sp.size;
          ctx.translate(sp.x, sp.y);
          ctx.moveTo(0, s * 0.35);
          ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.45);
          ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.3, 0, s * 0.35);
          ctx.fill();
        } else {
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(loop);
    };

    // IntersectionObserver: chỉ chạy RAF khi người dùng cuộn đến vườn hoa
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !raf) {
          lastTime = performance.now();
          raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.05 }
    );
    if (wrap.current) observer.observe(wrap.current);

    raf = requestAnimationFrame(loop);

    // KÍCH HOẠT NỞ CẢ ĐẠI DƯƠNG HOA TULIP DÀY ĐẶC VỚI 9 TẦNG LỚP ĐỘ SÂU
    const triggerFieldBloom = (clickX, clickY) => {
      const state = stateRef.current;

      if (!state.hasBloomed) {
        state.hasBloomed = true;
        setHasBloomed(true);
        playMagicBloomSound();

        for (let i = 0; i < 40; i++) {
          const angle = Math.random() * Math.PI * 2;
          const sp = 2 + Math.random() * 5.5;
          state.sparkles.push({
            x: clickX,
            y: clickY,
            vx: Math.cos(angle) * sp,
            vy: Math.sin(angle) * sp - 2.5,
            size: 2.2 + Math.random() * 4,
            color: ['#fff', '#ff758f', '#fcbf49', '#c77dff', '#ffb3c1', '#f72585'][(Math.random() * 6) | 0],
            alpha: 1,
            decay: 0.012 + Math.random() * 0.01,
            isHeart: Math.random() < 0.48,
          });
        }

        // Phân tầng lớp hoa tối ưu: 5 tầng (~70-80 bông) trên điện thoại, 9 tầng (~500 bông) trên máy tính
        const isMob = w < 600;
        const tiers = isMob
          ? [
              {
                count: Math.round(Math.max(14, w / 26)),
                rootYMin: h * 0.40,
                rootYMax: h * 0.50,
                sizeMin: 16,
                sizeMax: 22,
                stemMin: Math.min(h * 0.14, 110),
                stemMax: Math.min(h * 0.20, 150),
                alpha: 0.72,
                tierIdx: 0,
              },
              {
                count: Math.round(Math.max(16, w / 24)),
                rootYMin: h * 0.50,
                rootYMax: h * 0.62,
                sizeMin: 22,
                sizeMax: 30,
                stemMin: Math.min(h * 0.16, 130),
                stemMax: Math.min(h * 0.24, 180),
                alpha: 0.82,
                tierIdx: 1,
              },
              {
                count: Math.round(Math.max(16, w / 24)),
                rootYMin: h * 0.62,
                rootYMax: h * 0.74,
                sizeMin: 28,
                sizeMax: 38,
                stemMin: Math.min(h * 0.20, 160),
                stemMax: Math.min(h * 0.28, 220),
                alpha: 0.90,
                tierIdx: 2,
              },
              {
                count: Math.round(Math.max(14, w / 26)),
                rootYMin: h * 0.74,
                rootYMax: h * 0.86,
                sizeMin: 36,
                sizeMax: 48,
                stemMin: Math.min(h * 0.22, 180),
                stemMax: Math.min(h * 0.30, 240),
                alpha: 0.96,
                tierIdx: 3,
              },
              {
                count: Math.round(Math.max(12, w / 30)),
                rootYMin: h * 0.86,
                rootYMax: h + 10,
                sizeMin: 46,
                sizeMax: 62,
                stemMin: Math.min(h * 0.22, 180),
                stemMax: Math.min(h * 0.28, 250),
                alpha: 1.0,
                tierIdx: 4,
              },
            ]
          : [
              {
                count: Math.round(Math.min(90, Math.max(38, w / 20))),
                rootYMin: h * 0.38,
                rootYMax: h * 0.46,
                sizeMin: 14,
                sizeMax: 20,
                stemMin: Math.min(h * 0.14, 120),
                stemMax: Math.min(h * 0.20, 160),
                alpha: 0.68,
                tierIdx: 0,
              },
              {
                count: Math.round(Math.min(85, Math.max(36, w / 22))),
                rootYMin: h * 0.46,
                rootYMax: h * 0.53,
                sizeMin: 18,
                sizeMax: 24,
                stemMin: Math.min(h * 0.16, 140),
                stemMax: Math.min(h * 0.22, 180),
                alpha: 0.75,
                tierIdx: 1,
              },
              {
                count: Math.round(Math.min(80, Math.max(34, w / 24))),
                rootYMin: h * 0.53,
                rootYMax: h * 0.60,
                sizeMin: 22,
                sizeMax: 29,
                stemMin: Math.min(h * 0.18, 160),
                stemMax: Math.min(h * 0.25, 210),
                alpha: 0.82,
                tierIdx: 2,
              },
              {
                count: Math.round(Math.min(75, Math.max(32, w / 26))),
                rootYMin: h * 0.60,
                rootYMax: h * 0.67,
                sizeMin: 27,
                sizeMax: 36,
                stemMin: Math.min(h * 0.20, 180),
                stemMax: Math.min(h * 0.28, 240),
                alpha: 0.88,
                tierIdx: 3,
              },
              {
                count: Math.round(Math.min(70, Math.max(30, w / 28))),
                rootYMin: h * 0.67,
                rootYMax: h * 0.74,
                sizeMin: 33,
                sizeMax: 44,
                stemMin: Math.min(h * 0.22, 200),
                stemMax: Math.min(h * 0.30, 260),
                alpha: 0.93,
                tierIdx: 4,
              },
              {
                count: Math.round(Math.min(65, Math.max(28, w / 30))),
                rootYMin: h * 0.74,
                rootYMax: h * 0.81,
                sizeMin: 40,
                sizeMax: 52,
                stemMin: Math.min(h * 0.24, 220),
                stemMax: Math.min(h * 0.32, 280),
                alpha: 0.96,
                tierIdx: 5,
              },
              {
                count: Math.round(Math.min(60, Math.max(26, w / 32))),
                rootYMin: h * 0.81,
                rootYMax: h * 0.88,
                sizeMin: 47,
                sizeMax: 60,
                stemMin: Math.min(h * 0.24, 220),
                stemMax: Math.min(h * 0.34, 300),
                alpha: 0.98,
                tierIdx: 6,
              },
              {
                count: Math.round(Math.min(52, Math.max(22, w / 36))),
                rootYMin: h * 0.88,
                rootYMax: h * 0.94,
                sizeMin: 54,
                sizeMax: 70,
                stemMin: Math.min(h * 0.23, 210),
                stemMax: Math.min(h * 0.32, 280),
                alpha: 1.0,
                tierIdx: 7,
              },
              {
                count: Math.round(Math.min(45, Math.max(18, w / 40))),
                rootYMin: h * 0.94,
                rootYMax: h + 12,
                sizeMin: 62,
                sizeMax: 82,
                stemMin: Math.min(h * 0.20, 190),
                stemMax: Math.min(h * 0.30, 270),
                alpha: 1.0,
                tierIdx: 8,
              },
            ];

        const allTulips = [];

        tiers.forEach((tier) => {
          for (let i = 0; i < tier.count; i++) {
            const fx = (i / (tier.count - 1)) * (w + 80) - 40 + (Math.random() - 0.5) * (w / tier.count * 1.5);
            const clampedX = Math.max(-20, Math.min(w + 20, fx));
            const fy = tier.rootYMin + Math.random() * (tier.rootYMax - tier.rootYMin);
            const size = tier.sizeMin + Math.random() * (tier.sizeMax - tier.sizeMin);
            const stemLength = tier.stemMin + Math.random() * (tier.stemMax - tier.stemMin);

            // Dải màu lượn sóng tự nhiên (như cánh đồng Keukenhof Hà Lan)
            const ribbonVal = Math.sin(clampedX * 0.003 + tier.tierIdx * 0.72) * 3.5 + Math.cos(fy * 0.004) * 2;
            const paletteIdx = Math.floor(Math.abs(ribbonVal + (Math.random() * 0.8 - 0.4))) % sprites.length;
            const chosen = sprites[paletteIdx];

            const distFromClick = Math.hypot(clampedX - clickX, fy - clickY);
            const delay = distFromClick * 0.55 + tier.tierIdx * 60 + Math.random() * 120;

            allTulips.push({
              id: `${tier.tierIdx}-${i}`,
              x: clampedX,
              y: fy,
              size,
              stemLength,
              progress: 0,
              palette: chosen.palette,
              sprite: chosen.sprite,
              swaySpeed: 1.1 + Math.random() * 0.8,
              swayAmp: (6 + Math.random() * 9) * (1 - tier.tierIdx * 0.07),
              swayPhase: clampedX * 0.005 + Math.random() * 0.6,
              delay,
              alpha: tier.alpha,
              tierIdx: tier.tierIdx,
            });
          }
        });

        // Sắp xếp vẽ tuần tự từ tầng xa tới tầng gần
        allTulips.sort((a, b) => a.tierIdx - b.tierIdx || a.y - b.y);

        state.tulips = [...state.tulips, ...allTulips];
      } else {
        // Chạm tiếp: gieo 10 đóa hoa tulip dày dặn tại điểm chạm
        playSinglePop();
        const clusterCount = 10;
        for (let k = 0; k < clusterCount; k++) {
          const offsetX = (k - 4.5) * 18 + (Math.random() - 0.5) * 18;
          const layerDepth = Math.random();
          const tierIdx = 4 + Math.floor(layerDepth * 4);
          const chosen = sprites[(Math.random() * sprites.length) | 0];

          state.tulips.push({
            id: Date.now() + k,
            x: Math.max(10, Math.min(w - 10, clickX + offsetX)),
            y: Math.min(h + 5, Math.max(h * 0.5, clickY + 60 + (Math.random() - 0.5) * 70)),
            size: (28 + layerDepth * 36) * (Math.min(w, 800) / 600),
            stemLength: (130 + layerDepth * 150) * (Math.min(h, 900) / 750),
            progress: 0,
            palette: chosen.palette,
            sprite: chosen.sprite,
            swaySpeed: 1.2 + Math.random() * 0.8,
            swayAmp: 8 + Math.random() * 10,
            swayPhase: Math.random() * Math.PI * 2,
            delay: k * 35,
            alpha: 0.9 + layerDepth * 0.1,
            tierIdx,
          });
        }

        for (let i = 0; i < 12; i++) {
          state.sparkles.push({
            x: clickX,
            y: clickY,
            vx: (Math.random() - 0.5) * 4,
            vy: -(1.5 + Math.random() * 4),
            size: 3 + Math.random() * 3.5,
            color: ['#ff4d6d', '#fcbf49', '#c77dff', '#fff'][(Math.random() * 4) | 0],
            alpha: 1,
            decay: 0.015,
            isHeart: Math.random() < 0.5,
          });
        }
      }
    };

    const handlePointerDown = (e) => {
      const r = canvas.getBoundingClientRect();
      const clickX = e.clientX - r.left;
      const clickY = e.clientY - r.top;
      triggerFieldBloom(clickX, clickY);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <section className="section garden" id="garden">
      <motion.div
        className="garden-head"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <h2 className="script glow">{content.gardenTitle}</h2>
        <AnimatePresence mode="wait">
          {!hasBloomed ? (
            <motion.p
              key="pre"
              className="hint garden-trigger-hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <span className="garden-pulse-badge">🌷 Chạm vào bông hoa để đánh thức cả cánh đồng rực rỡ</span>
            </motion.p>
          ) : (
            <motion.p
              key="post"
              className="hint garden-bloomed-hint"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span>🌷 Cánh đồng hoa tulip nở rộ ngát hương vì em</span>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="garden-stage" ref={wrap} role="button" tabIndex={0} aria-label="Cánh đồng hoa tulip">
        <canvas ref={cv} />
      </div>
    </section>
  );
}
