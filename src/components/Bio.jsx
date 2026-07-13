import { useRef, useState, useEffect, useId } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
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
   LINK METADATA — preview cards, scribble color
   ───────────────────────────────────────────── */
export const LINK_META = {
  bessemer:      { color: '#C9A84C', scribbleIndex: 0, preview: { title: 'Bessemer Venture Partners', desc: 'One of the oldest venture firms in the world.', img: null } },
  jpmc:          { color: '#7EB8D4', scribbleIndex: 1, preview: null },
  bcg:           { color: '#6EC6A0', scribbleIndex: 2, preview: null },
  medium:        { color: '#A8D8A8', scribbleIndex: 3, preview: { title: 'Medium', desc: 'Essays on markets, tech, and things I can\'t stop thinking about.', img: null } },
  'film-acted':  { color: '#E8A598', scribbleIndex: 4, preview: { title: 'Two Short Films', desc: 'Student films I acted in.', img: null } },
  'film-directed': { color: '#E8C07A', scribbleIndex: 0, preview: { title: 'Short Film', desc: 'A student short film I directed.', img: null } },
  mime:          { color: '#C9A0DC', scribbleIndex: 1, preview: { title: 'Mime on Stage', desc: 'Stage performances including a UV+LED piece.', img: null } },
  comic:         { color: '#E8A5B8', scribbleIndex: 2, preview: { title: 'Incidental Findings', desc: 'A comic book of dry humor.', img: null } },
  loremaxxing:   { color: '#7EC8E3', scribbleIndex: 3, preview: { title: 'Lore Maxxing', desc: "An app for people who\u2019d rather live an interesting life than scroll through one.", img: null } },
  frisbee:       { color: '#7EC8A0', scribbleIndex: 4, preview: { title: 'Ultimate Frisbee', desc: 'Represented my college team.', img: null } },
  keys:          { color: '#E8D4A0', scribbleIndex: 0, preview: null },
  fa:            { color: '#8AA8D4', scribbleIndex: 1, preview: { title: 'English FA Badge', desc: 'Working towards a formal coaching certification.', img: null } },
};

/* ─────────────────────────────────────────────
   SCRIBBLE UNDERLINE
   SVG that animates its stroke-dashoffset
   from full (hidden) to 0 (drawn).
   ───────────────────────────────────────────── */
function ScribbleUnderline({ color, pathIndex = 0, visible }) {
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
   FLOATING PREVIEW CARD
   Fixed position, tracks mouse with spring physics
   ───────────────────────────────────────────── */
function FloatingPreviewCard({ preview, color, visible }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 28, mass: 0.6 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const move = (e) => {
      // Offset card to the right and slightly up from cursor
      mouseX.set(e.clientX + 20);
      mouseY.set(e.clientY - 60);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  return (
    <AnimatePresence>
      {visible && preview && (
        <motion.div
          className="bio-preview-card"
          style={{ x, y }}
          initial={{ opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Thumbnail area */}
          <div className="bio-preview-thumb" style={{ background: `${color}18` }}>
            {preview.img ? (
              <img src={preview.img} alt={preview.title} />
            ) : (
              <div className="bio-preview-thumb-placeholder" style={{ color }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="7" cy="7.5" r="1.5" fill="currentColor" opacity="0.5"/>
                  <path d="M2 13 L6 9 L9 12 L13 8 L18 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                </svg>
              </div>
            )}
          </div>

          {/* Card content */}
          <div className="bio-preview-content">
            <p className="bio-preview-title">{preview.title}</p>
            <p className="bio-preview-desc">{preview.desc}</p>
            <span className="bio-preview-open" style={{ color }}>
              Open ↗
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   INLINE LINK
   Looks like plain text at rest.
   On hover: scribble draws in, ↗ fades in.
   ───────────────────────────────────────────── */
function InlineLink({ id, label, href, onHoverChange, isAnyHovered }) {
  const [hovered, setHovered] = useState(false);
  const meta = LINK_META[id];

  // Mobile: track touch state
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
      className="bio-inline-link"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      style={{
        color: isOtherHovered ? 'rgba(245,245,245,0.3)' : 'var(--color-fg)',
        transition: 'color 0.3s ease',
        position: 'relative',
        display: 'inline',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ position: 'relative', display: 'inline-block' }}>
        {label}
        <ScribbleUnderline
          color={meta?.color ?? '#F5F5F5'}
          pathIndex={meta?.scribbleIndex ?? 0}
          visible={isActive}
        />
      </span>
      <motion.span
        className="bio-link-arrow"
        initial={{ opacity: 0, x: -3 }}
        animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -3 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        aria-hidden="true"
      >
        ↗
      </motion.span>
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

  // Manual InView with IntersectionObserver for precise control
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

  // Dismiss touch state when tapping outside a link
  useEffect(() => {
    const dismiss = (e) => {
      if (!e.target.closest('.bio-inline-link')) setHoveredId(null);
    };
    document.addEventListener('touchstart', dismiss);
    return () => document.removeEventListener('touchstart', dismiss);
  }, []);

  const isAnyHovered = hoveredId !== null;
  const activeMeta = hoveredId ? LINK_META[hoveredId] : null;
  const activePreview = activeMeta?.preview ?? null;

  // Helper
  const L = (id, label, href = '#') => (
    <InlineLink
      id={id}
      label={label}
      href={href}
      onHoverChange={setHoveredId}
      isAnyHovered={isAnyHovered}
    />
  );

  // Sentence stagger: 100ms between each
  const BASE = 0;
  const GAP = 0.11;

  return (
    <>
      <section className="bio-section" ref={sectionRef}>
        <div className="bio-inner">
          <p
            className="bio-para"
            style={{ color: 'var(--color-fg)' }}
          >
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
              perform {L('mime', 'mime on stage')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 7} isInView={isInView}>
              make a comic book called {L('comic', 'Incidental Findings')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 8} isInView={isInView}>
              build {L('loremaxxing', 'Lore Maxxing')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 9} isInView={isInView}>
              represent my college in {L('frisbee', 'ultimate frisbee')},{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 10} isInView={isInView}>
              play the {L('keys', 'keys')}, obsess over Manchester United, and work towards an{' '}
            </Sentence>
            <Sentence delay={BASE + GAP * 11} isInView={isInView}>
              {L('fa', 'English FA coaching badge')}.
            </Sentence>
          </p>
        </div>
      </section>

      {/* Floating preview card — desktop only */}
      <FloatingPreviewCard
        preview={activePreview}
        color={activeMeta?.color ?? '#F5F5F5'}
        visible={isAnyHovered && activePreview !== null}
      />
    </>
  );
}
