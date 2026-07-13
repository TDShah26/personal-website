import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Bio.css';

/* ─────────────────────────────────────────────
   SCRIBBLE SVG — hand-drawn underline paths
   ───────────────────────────────────────────── */
const SCRIBBLE_PATHS = [
  "M 0,4 C 15,1 35,7 55,4 C 75,1 95,6 115,3 C 130,1 145,5 160,3",
  "M 0,5 C 20,2 40,7 60,4 C 80,1 100,6 120,4 C 135,2 148,5 160,3",
  "M 0,3 C 18,6 38,2 58,5 C 78,2 98,6 118,3 C 132,1 148,5 160,4",
  "M 0,4 C 12,2 32,7 52,4 C 72,1 92,6 112,4 C 130,2 147,5 160,3",
  "M 0,5 C 22,2 42,6 62,4 C 82,2 102,5 122,4 C 138,2 150,5 160,3",
];

/* ─────────────────────────────────────────────
   LINK METADATA
   ───────────────────────────────────────────── */
export const LINK_META = {
  bessemer:        { color: '#C9A84C', scribbleIndex: 0 },
  jpmc:            { color: '#7EB8D4', scribbleIndex: 1 },
  bcg:             { color: '#6EC6A0', scribbleIndex: 2 },
  bitspilani:      { color: '#E8A598', scribbleIndex: 3 },
  medium:          { color: '#A8D8A8', scribbleIndex: 4 },
  'films-acted':   { color: '#E8C07A', scribbleIndex: 0 },
  'film-directed': { color: '#E8C07A', scribbleIndex: 1 },
  'mime-acted':    { color: '#C9A0DC', scribbleIndex: 2 },
  'mimes-directed':{ color: '#BF5FFF', scribbleIndex: 3 },
  comic:           { color: '#E8A5B8', scribbleIndex: 4 },
  loremaxxing:     { color: '#7EC8E3', scribbleIndex: 0 },
  frisbee:         { color: '#7EC8A0', scribbleIndex: 1 },
  keys:            { color: '#E8D4A0', scribbleIndex: 2 },
  fa:              { color: '#8AA8D4', scribbleIndex: 3 },
};

/* ─────────────────────────────────────────────
   SCRIBBLE UNDERLINE
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
        opacity,
        transition: 'opacity 0.3s ease',
      }}
      viewBox="0 0 160 10"
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
        animate={{ strokeDashoffset: visible ? 0 : TOTAL_LENGTH }}
        transition={{
          duration: visible ? 0.35 : 0.2,
          ease: visible ? [0.25, 0.46, 0.45, 0.94] : 'easeIn',
        }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   INLINE LINK — single destination
   ───────────────────────────────────────────── */
function InlineLink({ id, label, href, onHoverChange, isAnyHovered }) {
  const [hovered, setHovered] = useState(false);
  const [touched, setTouched] = useState(false);
  const meta = LINK_META[id];
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const handleMouseEnter = () => { if (!isTouch) { setHovered(true); onHoverChange(id); } };
  const handleMouseLeave = () => { if (!isTouch) { setHovered(false); onHoverChange(null); } };
  const handleTouchStart = (e) => {
    if (!touched) { e.preventDefault(); setTouched(true); onHoverChange(id); }
  };
  const handleClick = (e) => { if (isTouch && !touched) e.preventDefault(); };

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
      style={{ '--link-color': meta?.color ?? '#F5F5F5' }}
    >
      {label}
      <ScribbleUnderline
        color={meta?.color ?? '#F5F5F5'}
        pathIndex={meta?.scribbleIndex ?? 0}
        visible={isActive}
      />
    </a>
  );
}

/* ─────────────────────────────────────────────
   EXPANDING LINK — one trigger word, multiple
   destinations revealed on hover.
   At rest:   "two"
   On hover:  "Film One ↗ / Film Two ↗"
   ───────────────────────────────────────────── */
function ExpandingLink({ trigger, links, themeId }) {
  const [expanded, setExpanded] = useState(false);
  const meta = LINK_META[themeId];
  const color = meta?.color ?? '#F5F5F5';
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const expand   = () => setExpanded(true);
  const collapse = () => setExpanded(false);

  const handleTouchStart = (e) => {
    if (!expanded) { e.preventDefault(); setExpanded(true); }
  };

  return (
    <span
      className="expanding-link-container"
      style={{ '--link-color': color }}
      onMouseEnter={() => !isTouch && expand()}
      onMouseLeave={() => !isTouch && collapse()}
      onTouchStart={handleTouchStart}
    >
      {!expanded ? (
        /* ── Collapsed trigger ── */
        <span className="expanding-trigger">
          {trigger}
        </span>
      ) : (
        /* ── Expanded sub-links ── */
        <span className="expanding-links-group">
          {links.map((link, i) => (
            <React.Fragment key={link.id}>
              {i > 0 && <span className="expanding-sep"> / </span>}
              <motion.a
                href={link.href}
                className="expanding-sub-link"
                style={{ '--link-color': color }}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.15 }}
              >
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  {link.label}
                  <ScribbleUnderline
                    color={color}
                    pathIndex={(meta?.scribbleIndex ?? 0) + i + 1}
                    visible={true}
                    opacity={1}
                  />
                </span>
              </motion.a>
            </React.Fragment>
          ))}
        </span>
      )}
    </span>
  );
}

/* ─────────────────────────────────────────────
   SENTENCE — staggered blur+fade+y reveal
   ───────────────────────────────────────────── */
function Sentence({ children, delay, isInView }) {
  return (
    <motion.span
      className="bio-sentence"
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ delay, duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
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
      if (!e.target.closest('.bio-inline-link') && !e.target.closest('.expanding-link-container'))
        setHoveredId(null);
    };
    document.addEventListener('touchstart', dismiss);
    return () => document.removeEventListener('touchstart', dismiss);
  }, []);

  const isAnyHovered = hoveredId !== null;

  const L = (id, label, href = '#') => (
    <InlineLink id={id} label={label} href={href} onHoverChange={setHoveredId} isAnyHovered={isAnyHovered} />
  );

  /* ExpandingLink helper */
  const EL = (trigger, themeId, links) => (
    <ExpandingLink trigger={trigger} themeId={themeId} links={links} />
  );

  const BASE = 0;
  const GAP  = 0.11;

  return (
    <section className="bio-section" ref={sectionRef}>
      <div className="bio-inner">
        <p className="bio-para">
          <Sentence delay={BASE + GAP * 0} isInView={isInView}>
            I'm an investor at {L('bessemer', 'Bessemer Venture Partners')}.{' '}
          </Sentence>
          <Sentence delay={BASE + GAP * 1} isInView={isInView}>
            Before that, I studied Computer Science and Economics at {L('bitspilani', 'BITS Pilani')},{' '}
            and worked at {L('jpmc', 'J.P. Morgan')} and {L('bcg', 'BCG')}.
          </Sentence>
        </p>

        <p className="bio-para">
          <Sentence delay={BASE + GAP * 2} isInView={isInView}>
            The rest has been a series of happy detours — acting in{' '}
            {EL('two', 'films-acted', [
              { id: 'film-a', label: 'Short Film I', href: '#' },
              { id: 'film-b', label: 'Short Film II', href: '#' },
            ])}{' '}
            student short films, then directing {L('film-directed', 'one')};{' '}
            performing {L('mime-acted', 'mime on stage')}, then directing{' '}
            {EL('two', 'mimes-directed', [
              { id: 'mime-a', label: 'UV + LED', href: '#' },
              { id: 'mime-b', label: 'Blackout Show', href: '#' },
            ])};{' '}
            representing my college in {L('frisbee', 'ultimate frisbee')};{' '}
            and drawing a comic book called {L('comic', 'Incidental Findings')}.
          </Sentence>
        </p>

        <p className="bio-para">
          <Sentence delay={BASE + GAP * 3} isInView={isInView}>
            Right now I'm building {L('loremaxxing', 'Lore Maxxing')}, practicing the {L('keys', 'keys')},{' '}
            and working toward an {L('fa', 'English FA coaching badge')}.{' '}
          </Sentence>
          <Sentence delay={BASE + GAP * 4} isInView={isInView}>
            Manchester United could probably use the help.{' '}
          </Sentence>
        </p>

        <p className="bio-para">
          <Sentence delay={BASE + GAP * 5} isInView={isInView}>
            I'm always looking for the next interesting thing to say yes to.
          </Sentence>
        </p>

        {/* Mobile hint — shown only on touch screens via CSS */}
        <motion.p
          className="bio-mobile-hint"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: BASE + GAP * 15, duration: 0.8 }}
        >
          * tap any underlined word to discover more
        </motion.p>
      </div>
    </section>
  );
}
