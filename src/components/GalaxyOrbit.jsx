import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GalaxyOrbit({ photos, onOpenHeart }) {
  const [rotation, setRotation] = useState(0);
  const [activePhoto, setActivePhoto] = useState(null);
  const [windowSize, setWindowSize] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const dragDistRef = useRef(0);

  // Cập nhật kích thước màn hình responsive
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Vòng lặp quán tính và tự xoay vũ trụ mượt mà 60 FPS
  useEffect(() => {
    let raf;
    let lastFrame = performance.now();

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(32, now - lastFrame);
      lastFrame = now;

      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.04) {
          // Trượt theo quán tính của tay
          setRotation((prev) => prev + velocityRef.current);
          velocityRef.current *= 0.94;
        } else {
          // Tự quay êm dịu như dải ngân hà
          setRotation((prev) => prev + 0.14);
        }
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Xử lý chạm vuốt bằng tay (chuột hoặc cảm ứng điện thoại) chuẩn xác, không chặn click
  const handlePointerDown = (e) => {
    // Không bắt đầu drag nếu click thẳng vào nút mở quà
    if (e.target.closest('.galaxy-center-heart')) return;

    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    dragDistRef.current = 0;

    const onMove = (moveEvt) => {
      if (!isDraggingRef.current) return;
      const now = performance.now();
      const dx = moveEvt.clientX - lastXRef.current;
      const dt = Math.max(8, now - lastTimeRef.current);
      dragDistRef.current += Math.abs(dx);

      const sensitivity = window.innerWidth < 600 ? 0.38 : 0.28;
      setRotation((prev) => prev + dx * sensitivity);

      velocityRef.current = (dx / dt) * 14;
      lastXRef.current = moveEvt.clientX;
      lastTimeRef.current = now;
    };

    const onUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  // Tính toán quỹ đạo 3D ngân hà mở rộng, cân đối
  const isMobile = windowSize.w < 600;
  const radiusX = isMobile ? Math.min(windowSize.w * 0.44, 195) : Math.min(windowSize.w * 0.42, 480);
  const radiusY = radiusX * (isMobile ? 0.36 : 0.28);
  const total = photos.length;

  return (
    <div
      className="galaxy-stage"
      onPointerDown={handlePointerDown}
      role="region"
      aria-label="Vòng xoáy ngân hà ảnh kỷ niệm"
    >
      {/* Vòng đĩa bụi tinh vân & quỹ đạo ánh sáng */}
      <div
        className="galaxy-disc"
        style={{
          width: radiusX * 2.2,
          height: radiusY * 2.3,
        }}
      >
        <div className="galaxy-ring ring-outer" />
        <div className="galaxy-ring ring-middle" />
        <div className="galaxy-ring ring-inner" />
      </div>

      {/* Trái tim phát sáng ở tâm tinh hà (z-index: 40) */}
      <div
        className="galaxy-center-heart"
        onClick={(e) => {
          e.stopPropagation();
          onOpenHeart();
        }}
        role="button"
        tabIndex={0}
        aria-label="Mở món quà"
      >
        <div className="heart-aura-glow" />
        <motion.div
          className="heart-svg-box"
          animate={{ scale: [1, 1.15, 1, 1.1, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 32 29" width={isMobile ? 95 : 130} height={isMobile ? 88 : 120} aria-hidden="true">
            <defs>
              <linearGradient id="galaxy-heart-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffb3c8" />
                <stop offset="50%" stopColor="#ff3d7f" />
                <stop offset="100%" stopColor="#c724e0" />
              </linearGradient>
              <filter id="heart-glow-blur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              fill="url(#galaxy-heart-grad)"
              filter="url(#heart-glow-blur)"
              d="M23.6 0c-3.4 0-6.3 2.7-7.6 5.6C14.7 2.7 11.8 0 8.4 0 3.8 0 0 3.8 0 8.4c0 9.4 9.5 11.9 16 21.2 6.1-9.3 16-12.1 16-21.2C32 3.8 28.2 0 23.6 0z"
            />
          </svg>
        </motion.div>
        <span className="heart-pulse-tag">Chạm để mở quà 💌</span>
      </div>

      {/* Các thẻ ảnh xoay quanh như tinh hà trong không gian 3D */}
      <div className="galaxy-cards-orbit">
        {photos.map((item, index) => {
          // Tính góc và tọa độ elip 3D
          const angle = ((index / total) * 360 + rotation) * (Math.PI / 180);
          const x = Math.sin(angle) * radiusX;
          const depth = Math.cos(angle); // -1 (xa phía sau) đến +1 (sát phía trước)
          const y = -depth * radiusY;

          // Hiệu ứng phối cảnh chiều sâu chân thực
          const normDepth = (depth + 1) / 2; // 0 đến 1
          const scale = isMobile ? 0.72 + normDepth * 0.38 : 0.72 + normDepth * 0.44;
          const opacity = 0.52 + normDepth * 0.48;
          // Z-index: Phía trước (depth > 0) đè lên trái tim (zIndex > 40), phía sau chui ra sau trái tim (zIndex < 40)
          const zIndex = depth > 0 ? Math.round(50 + depth * 50) : Math.round(10 + normDepth * 20);

          return (
            <div
              key={index}
              className="galaxy-card"
              style={{
                transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                opacity,
                zIndex,
              }}
              onClick={(e) => {
                if (dragDistRef.current < 6) {
                  e.stopPropagation();
                  setActivePhoto(item);
                }
              }}
            >
              <div className="card-frame">
                <div className="card-img-wrap">
                  <img src={item.src} alt={item.caption || 'Kỷ niệm'} loading="lazy" />
                  <span className="card-pin">✨</span>
                </div>
                {item.caption && <span className="card-caption">{item.caption}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Huy hiệu hướng dẫn vuốt tay */}
      <div className="galaxy-guide-badge">
        <span>✨ Vuốt tay để xoay dải ngân hà · Chạm trái tim để mở quà 💖</span>
      </div>

      {/* Modal phóng to xem ảnh kỷ niệm khi bấm vào thẻ */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            className="photo-preview-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
          >
            <motion.div
              className="photo-preview-card"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={activePhoto.src} alt={activePhoto.caption} />
              <p className="preview-caption">{activePhoto.caption}</p>
              <button
                type="button"
                className="preview-close-btn"
                onClick={() => setActivePhoto(null)}
                aria-label="Đóng"
              >
                ✕ Đóng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
