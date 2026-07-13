import { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

export const PILL_THEMES = {
  bessemer: { color: '#FFD700', font: "'Playfair Display', serif", weight: 700 },
  jpmc: { color: '#005F9E', font: "'Inter', sans-serif", weight: 700 },
  bcg: { color: '#00654C', font: "'Inter', sans-serif", weight: 700 },
  medium: { color: '#00D46A', font: "'Merriweather', serif", weight: 700 },
  'film-acted': { color: '#FF6B6B', font: "'Bebas Neue', sans-serif", weight: 400 },
  'film-directed': { color: '#FF8C42', font: "'Bebas Neue', sans-serif", weight: 400 },
  mime: { color: '#BF5FFF', font: "'Space Mono', monospace", weight: 400 },
  comic: { color: '#FF6B6B', font: "'Comic Neue', cursive", weight: 700 },
  loremaxxing: { color: '#4FC3F7', font: "'Outfit', sans-serif", weight: 500 },
  frisbee: { color: '#34D399', font: "'Bebas Neue', sans-serif", weight: 400 },
  keys: { color: '#FBBF24', font: "'Libre Baskerville', serif", weight: 400 },
  fa: { color: '#003090', font: "'Playfair Display', serif", weight: 700 }
};

export function PillLink({ id, label, href, themeId, previewSrc, isActive, onActivate }) {
  const theme = PILL_THEMES[themeId];
  
  const handleClick = (e) => {
    // If we're on mobile (no hover support generally), we require two taps
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) {
      if (!isActive) {
        e.preventDefault();
        onActivate(id);
      }
      // If already active, it will naturally navigate to href
    }
  };

  const handleMouseEnter = () => {
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (!isTouch) {
      onActivate(id);
    }
  };

  const handleMouseLeave = () => {
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (!isTouch) {
      onActivate(null);
    }
  };

  return (
    <a
      href={href}
      className={`pill-link ${isActive ? 'is-active' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--pill-color': theme.color,
        '--pill-font': isActive ? theme.font : 'inherit',
        '--pill-weight': isActive ? theme.weight : 'inherit'
      }}
    >
      <span className="pill-text">{label}</span>
      <span className="pill-arrow">↗</span>
    </a>
  );
}

// Global Floating Card component
export function FloatingCard({ activePill }) {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { stiffness: 150, damping: 20 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  const [rotation] = useState(() => (Math.random() - 0.5) * 8); // random rotation ±4deg

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX + 24);
      cursorY.set(e.clientY + 24);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  const theme = activePill ? PILL_THEMES[activePill.themeId] : null;

  return (
    <AnimatePresence>
      {activePill && (
        <motion.div
          className="floating-card"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            x: smoothX,
            y: smoothY,
            rotate: rotation,
          }}
        >
          {activePill.previewSrc ? (
            <img src={activePill.previewSrc} alt="" className="floating-card-img" />
          ) : (
            // Placeholder fallback
            <div className="floating-card-placeholder" style={{ backgroundColor: theme?.color + '33' }}>
              <span style={{ color: theme?.color, fontFamily: theme?.font, fontWeight: theme?.weight }}>
                {activePill.label}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
