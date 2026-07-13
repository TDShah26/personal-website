import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Bio.css';

/* ─────────────────────────────────────────────
   SCRIBBLE SVG — hand-drawn underline paths
   Each path is slightly different so links
   feel individually hand-lettered.
   ───────────────────────────────────────────── */
const SCRIBBLE_PATHS = [
  "M 0,4 C 15,1 35,7 55,4 C 75,1 95,6 115,3 C 130,1 145,5 160,3",
  "M 0,5 C 20,2 40,7 60,4 C 80,1 100,6 120,4 C 135,2 148,5 160,3",
  "M 0,3 C 18,6 38,2 58,5 C 78,2 98,6 118,3 C 132,1 148,5 160,4",
  "M 0,4 C 12,2 32,7 52,4 C 72,1 92,6 112,4 C 130,2 147,5 160,3",
  "M 0,5 C 22,2 42,6 62,4 C 82,2 102,5 122,4 C 138,2 150,5 160,3",
];

/* ─────────────────────────────────────────────
   LINK METADATA — scribble color, fonts
   ───────────────────────────────────────────── */
export const LINK_META = {
  bessemer:      { color: '#C9A84C', scribbleIndex: 0, font: "'Playfair Display', serif", weight: 700 },
  jpmc:          { color: '#7EB8D4', scribbleIndex: 1, font: "'Inter', sans-serif", weight: 700 },
  bcg:           { color: '#6EC6A0', scribbleIndex: 2, font: "'Inter', sans-serif", weight: 700 },
  medium:        { color: '#A8D8A8', scribbleIndex: 3, font: "'Merriweather', serif", weight: 700 },
  'film-acted':  { color: '#E8A598', scribbleIndex: 4, font: "'Bebas Neue', sans-serif", weight: 400 },
  'film-directed': { color: '#E8C07A', scribbleIndex: 0, font: "'Bebas Neue', sans-serif", weight: 400 },
  'mime-acted':  { color: '#C9A0DC', scribbleIndex: 1, font: "'Space Mono', monospace", weight: 400 },
  'mime-directed': { color: '#BF5FFF', scribbleIndex: 2, font: "'Space Mono', monospace", weight: 400 },
  comic:         { color: '#E8A5B8', scribbleIndex: 3, font: "'Comic Neue', cursive", weight: 700 },
  loremaxxing:   { color: '#7EC8E3', scribbleIndex: 4, font: "'Outfit', sans-serif", weight: 500 },
  frisbee:       { color: '#7EC8A0', scribbleIndex: 0, font: "'Bebas Neue', sans-serif", weight: 400 },
  keys:          { color: '#E8D4A0', scribbleIndex: 1, font: "'Libre Baskerville', serif", weight: 400 },
  fa:            { color: '#8AA8D4', scribbleIndex: 2, font: "'Playfair Display', serif", weight: 700 },
};

/* ─────────────────────────────────────────────
   SCRIBBLE UNDERLINE
   SVG that animates its stroke-dashoffset
   from full (hidden) to 0 (drawn).
   ───────────────────────────────────────────── */
function ScribbleUnderline({ color, pathIndex = 0, visible, opacity = 1 }) {
  const pathData = SCRIBBLE_PATHS[pathIndex % SCRIBBLE_PATHS.length];
  const TOTAL_LENGTH = 165;

  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: '-6px',
        left: '-4px',
        width: 'calc(100% + 8px)',
        height: '12px',
        overflow: 'visible',
        pointerEvents: 'none',
        opacity: opacity,
        transition: 'opacity 0.3s ease',
      }}
      viewBox={`0 0 160 10`}
      preserveAspectRatio="none"
    >
      <motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ strokeDasharray: TOTAL_LENGTH, strokeDashoffset: TOTAL_LENGTH }}
        animate={{
          strokeDashoffset: visible ? 0 : TOTAL_LENGTH,
        }}
        transition={{
          duration: visible ? 0.35 : 0.2,
          ease: visible ? [0.25, 0.46, 0.45, 0.94] : 'easeIn',
        }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   INLINE LINK
   At rest: muted accent color, italic serif.
   On hover: full white, personality font, scribble draws in.
   ───────────────────────────────────────────── */
function InlineLink({ id, label, href, onHoverChange, isAnyHovered }) {
  const [hovered, setHovered] = useState(false);
  const meta = LINK_META[id];

  const [touched, setTouched] = useState(false);
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const handleMouseEnter = () => {
    if (!isTouch) { setHovered(true); onHoverChange(id); }
  };
  const handleMouseLeave = () => {
    if (!isTouch) { setHovered(false); onHoverChange(null); }
  };
  const handleTouchStart = (e) => {
    if (!touched) {
      e.preventDefault();
      setTouched(true);
      onHoverChange(id);
    }
  };
  const handleClick = (e) => {
    if (isTouch && !touched) {
      e.preventDefault();
    }
  };

  const isActive = hovered || touched;
  const isOtherHovered = isAnyHovered && !isActive;

  return (
    <a
      href={href}
      className={`bio-inline-link ${isActive ? 'is-active' : ''} ${isOtherHovered ? 'is-dimmed' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      style={{
        '--link-color': meta?.color ?? '#F5F5F5',
      }}
    >
      {label}
      <ScribbleUnderline
        color={meta?.color ?? '#F5F5F5'}
        pathIndex={meta?.scribbleIndex ?? 0}
        visible={isActive || isTouch}
        opacity={isTouch && !isActive ? 0.35 : 1}
      />
    </a>
  );
}

/* ─────────────────────────────────────────────
   SENTENCE — animated unit with blur+fade+y
   ───────────────────────────────────────────── */
function Sentence({ children, delay, isInView }) {
  return (
    <motion.span
      className="bio-sentence"
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{
        delay,
        duration: 0.65,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.span>
  );
}

/* ─────────────────────────────────────────────
   BIO — main export
   ───────────────────────────────────────────── */
export default function Bio() {
  const [hoveredId, setHoveredId] = useState(null);
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsInView(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const dismiss = (e) => {
      if (!e.target.closest('.bio-inline-link')) setHoveredId(null);
    };
    document.addEventListener('touchstart', dismiss);
    return () => document.removeEventListener('touchstart', dismiss);
  }, []);

  const isAnyHovered = hoveredId !== null;

  const L = (id, label, href = '#') => (
    <InlineLink
      id={id}
      label={label}
      href={href}
      onHoverChange={setHoveredId}
      isAnyHovered={isAnyHovered}
    />
  );

  const BASE = 0;
  const GAP = 0.11;

  return (
    <>
      <section className="bio-section" ref={sectionRef}>
        <div className="bio-inner">
          <p className="bio-para">
            <Sentence delay={BASE + GAP * 0} isInView={isInView}>
              I invest in frontier companies at {L('bessemer', 'Bessemer Venture Partners')}.{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 1} isInView={isInView}>
              Before that, I spent time at {L('jpmc', 'J.P. Morgan')} and {L('bcg', 'BCG')}.{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 2} isInView={isInView}>
              The rest of my time is spent collecting side quests.{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 3} isInView={isInView}>
              That has somehow led me to write on {L('medium', 'Medium')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 4} isInView={isInView}>
              act in {L('film-acted', 'two')} student short films,{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 5} isInView={isInView}>
              direct {L('film-directed', 'one')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 6} isInView={isInView}>
              perform {L('mime-acted', 'mime on stage')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 7} isInView={isInView}>
              direct a {L('mime-directed', 'UV + LED performance')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 8} isInView={isInView}>
              make a comic book called {L('comic', 'Incidental Findings')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 9} isInView={isInView}>
              build {L('loremaxxing', 'Lore Maxxing')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 10} isInView={isInView}>
              represent my college in {L('frisbee', 'ultimate frisbee')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 11} isInView={isInView}>
              play the {L('keys', 'keys')}, obsess over Manchester United, and work towards an{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 12} isInView={isInView}>
              {L('fa', 'English FA coaching badge')}.
            </Sentence>
          </p>
          {/* Mobile hint — hidden via CSS on desktop */}
          <motion.p
            className="bio-mobile-hint"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: BASE + GAP * 13, duration: 0.8 }}
          >
            * tap any underlined word to discover more
          </motion.p>
        </div>
      </section>
    </>
  );
}
