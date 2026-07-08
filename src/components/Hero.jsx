import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Hero.css';

/* ─────────────────────────────────────────────
   TIMING CONSTANTS (ms — easy to tune)
   ───────────────────────────────────────────── */
const CHROME_FADE    = 300;   // static UI fade-in
const MASK_DURATION  = 2400;  // clip-path wipe duration (much slower)
const HOLD_DURATION  = 800;   // pause with full name visible before split
const SPLIT_DELAY    = MASK_DURATION + HOLD_DURATION;
const SPLIT_DURATION = 1600;  // split animation duration (slower curve)
const GALLERY_DELAY  = SPLIT_DELAY + SPLIT_DURATION + 150;
const IMAGE_INTERVAL = 500;   // ms each image stays visible
const CROSSFADE      = 250;   // image crossfade duration

/* ─────────────────────────────────────────────
   PORTFOLIO IMAGES
   ───────────────────────────────────────────── */
const PORTFOLIO_IMAGES = [
  { src: '/gallery/bvp_blue.png', label: 'BVP' },
  { src: '/gallery/ey.png', label: 'EY' },
  { src: '/gallery/jpmorganchase.png', label: 'J.P. MORGAN' },
  { src: '/gallery/BCG_Corporate_Logo.jpg', label: 'BCG' },
  { src: '/gallery/WorldQuant_Text_Logo_2022.jpg', label: 'WORLDQUANT' },
  { src: '/gallery/hptech.jpg', label: 'HP TECH' },
  { src: '/gallery/pharmeasy_logo.jpg', label: 'PHARMEASY' },
  { src: '/gallery/bitsufc.jpg', label: 'BITS UFC' },
  { src: '/gallery/fmac.jpg', label: 'FMAC' },
  { src: '/gallery/medium.png', label: 'MEDIUM', fit: 'cover' },
  { src: '/gallery/mime_blackbg.png', label: 'MIME' },
  { src: '/gallery/manutd.jpg', label: 'MANCHESTER UNITED' },
  { src: '/gallery/ytlogo.png', label: 'YOUTUBE' },
];

/* ─────────────────────────────────────────────
   PORTFOLIO CARD
   ───────────────────────────────────────────── */
function PortfolioCard({ src, label, fit = 'cover', phase, isDesktop }) {
  const isSplit = phase === 'split';
  
  const imgAnimate = isSplit && isDesktop
    ? { opacity: [0, 0, 1] }
    : { opacity: 1 };
  
  const imgTransition = isSplit && isDesktop
    ? { duration: SPLIT_DURATION / 1000, times: [0, 0.52, 1], ease: 'easeInOut' }
    : { duration: 0.2 };

  return (
    <div
      className="mockup-frame"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '6px',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.img
        src={src}
        alt={label}
        animate={imgAnimate}
        transition={imgTransition}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: '100%',
          height: '100%',
          objectFit: fit,
          display: 'block',
          borderRadius: '4px',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOOK — detect desktop breakpoint (≥768px)
   ───────────────────────────────────────────── */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

/* ─────────────────────────────────────────────
   HERO COMPONENT
   ───────────────────────────────────────────── */
export default function Hero() {
  const [phase, setPhase] = useState('mask'); // 'mask' → 'split' → 'gallery'
  const [imageIndex, setImageIndex] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const intervalRef = useRef(null);
  const isDesktop = useIsDesktop();

  /* ── font load check to avoid FOUT glitch ── */
  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  /* ── intro sequence — runs exactly once on mount ── */
  useEffect(() => {
    if (!fontsLoaded) return;
    const splitTimer   = setTimeout(() => setPhase('split'),   SPLIT_DELAY);
    const galleryTimer = setTimeout(() => setPhase('gallery'), GALLERY_DELAY);
    return () => { clearTimeout(splitTimer); clearTimeout(galleryTimer); };
  }, [fontsLoaded]);

  /* ── gallery rotation ── */
  useEffect(() => {
    if (phase !== 'gallery') return;
    intervalRef.current = setInterval(() => setImageIndex(p => p + 1), IMAGE_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const currentImage   = PORTFOLIO_IMAGES[imageIndex % PORTFOLIO_IMAGES.length];
  const isSplit        = phase === 'split' || phase === 'gallery';
  const showGallery    = phase === 'gallery';

  /*
   * Initial stacked positions — Tanay above centre, Shah below.
   * We do all horizontal/vertical offset using pure vw/vh now.
   * Centering is done by the nested .name-word-inner via CSS translate(-50%, -50%).
   *   Desktop: 16vh gap from centre.
   *   Mobile:  7vh gap from centre.
   */
  const TANAY_INIT = {
    x: '0vw',
    y: isDesktop ? '-16vh' : '-7vh',
  };
  const SHAH_INIT = {
    x: '0vw',
    y: isDesktop ? '16vh' : '7vh',
  };

  /*
   * Desktop: sequential L-shape motion (not diagonal).
   *   Tanay  — phase 1: slide LEFT  (x moves, y stays)
   *           — phase 2: slide DOWN  (x stays, y settles to centre)
   *   Shah   — phase 1: slide RIGHT (x moves, y stays)
   *           — phase 2: slide UP    (x stays, y settles to centre)
   *
   * Mobile: single-target vertical split to clear the image (36vh).
   */
  const tanayAnimate = isSplit
    ? (isDesktop
        ? {
            x: ['0vw', '-26.5vw', '-26.5vw'],
            y: ['-16vh', '-16vh', '0vh'],
          }
        : { x: '0vw', y: '-20vh' })
    : TANAY_INIT;

  const shahAnimate = isSplit
    ? (isDesktop
        ? {
            x: ['0vw', '24vw', '24vw'],
            y: ['16vh', '16vh', '0vh'],
          }
        : { x: '0vw', y: '20vh' })
    : SHAH_INIT;

  // Transition: desktop uses keyframe times array; mobile uses single easing.
  const splitTransition = isDesktop
    ? {
        duration: SPLIT_DURATION / 1000,
        times: [0, 0.52, 1],
        ease: 'easeInOut',
      }
    : {
        duration: SPLIT_DURATION / 1000,
        ease: [0.76, 0, 0.24, 1], // graceful curved easing
      };

  const galleryInitial = isDesktop
    ? { clipPath: 'inset(50% 50% 50% 50%)', x: '-50%', y: '-50%', scale: 0.88 }
    : { clipPath: 'inset(50% 0 50% 0)', x: '-50%', y: '-50%', scale: 0.88 };

  const galleryAnimate = isDesktop
    ? {
        clipPath: ['inset(50% 50% 50% 50%)', 'inset(49.7% 0% 49.7% 0%)', 'inset(0% 0% 0% 0%)'],
        scale: [0.88, 0.88, 1],
        x: '-50%',
        y: '-50%',
      }
    : {
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        x: '-50%',
        y: '-50%',
      };

  const galleryTransition = isDesktop
    ? {
        duration: SPLIT_DURATION / 1000,
        times: [0, 0.52, 1],
        ease: 'easeInOut',
      }
    : {
        duration: SPLIT_DURATION / 1000,
        ease: [0.76, 0, 0.24, 1],
      };

  const slideInitial = phase === 'split' ? { opacity: 1 } : { opacity: 0 };
  const slideAnimate = { opacity: 1 };
  const slideTransition = phase === 'split' ? { duration: 0.1 } : { duration: CROSSFADE / 1000 };

  // If fonts are not fully loaded, render a black background to prevent FOUT layout shift
  if (!fontsLoaded) {
    return <div className="hero" style={{ backgroundColor: '#0A0A0A' }} />;
  }

  return (
    <div className="hero">

      {/* ── STATIC CHROME — only appears after gallery starts ── */}
      <motion.header
        className="chrome-top"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: showGallery ? 1 : 0, y: showGallery ? 0 : -24 }}
        transition={{ duration: CHROME_FADE / 1000, ease: [0.25, 1, 0.5, 1] }}
      >
        <span className="chrome-name">TANAY SHAH</span>
        <span className="chrome-year">®2026</span>
      </motion.header>

      <motion.footer
        className="chrome-bottom"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: showGallery ? 1 : 0, y: showGallery ? 0 : 24 }}
        transition={{ duration: CHROME_FADE / 1000, ease: [0.25, 1, 0.5, 1] }}
      >
        <p className="chrome-bio">
          Builder. Investor. Storyteller.<br />
          Chasing interesting ideas wherever they lead.
        </p>
      </motion.footer>

      {/* ── CENTER STAGE — all three items absolutely centred, then split apart ── */}
      <div className="center-stage">

        {/* TANAY — starts above centre, flies left then down (desktop) / further up (mobile) */}
        <motion.div
          className="name-word-container"
          initial={TANAY_INIT}
          animate={tanayAnimate}
          transition={splitTransition}
        >
          <div className="name-word-inner">
            <div className="mask-reveal-wrapper">
              {/* Base grey layer that is filled over */}
              <span className="display-name display-name--base">
                Tanay
              </span>
              <motion.span
                className="display-name display-name--overlay"
                initial={{ clipPath: 'inset(-20% 100% -20% 0)' }}
                animate={{ clipPath: 'inset(-20% 0% -20% 0)' }}
                transition={{ duration: MASK_DURATION / 1000, ease: [0.76, 0, 0.24, 1] }}
              >
                Tanay
              </motion.span>
              {/* soft trailing-edge glow */}
              <motion.span
                className="display-name display-name--ghost"
                aria-hidden="true"
                initial={{ opacity: 0.18, clipPath: 'inset(-20% 100% -20% 0)' }}
                animate={{ opacity: 0,    clipPath: 'inset(-20% 0% -20% 0)' }}
                transition={{ duration: (MASK_DURATION * 1.15) / 1000, ease: [0.76, 0, 0.24, 1] }}
              >
                Tanay
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* GALLERY — always centred at viewport middle */}
        <AnimatePresence>
          {isSplit && (
            <motion.div
              className="gallery-container"
              key="gallery"
              initial={galleryInitial}
              animate={galleryAnimate}
              transition={galleryTransition}
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={imageIndex}
                  className="gallery-slide"
                  initial={slideInitial}
                  animate={slideAnimate}
                  exit={{ opacity: 0 }}
                  transition={slideTransition}
                >
                  <PortfolioCard src={currentImage.src} label={currentImage.label} fit={currentImage.fit} phase={phase} isDesktop={isDesktop} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SHAH — starts below centre, flies right then up (desktop) / further down (mobile) */}
        <motion.div
          className="name-word-container"
          initial={SHAH_INIT}
          animate={shahAnimate}
          transition={splitTransition}
        >
          <div className="name-word-inner">
            <div className="mask-reveal-wrapper">
              {/* Base grey layer that is filled over */}
              <span className="display-name display-name--base">
                Shah
              </span>
              <motion.span
                className="display-name display-name--overlay"
                initial={{ clipPath: 'inset(-20% 100% -20% 0)' }}
                animate={{ clipPath: 'inset(-20% 0% -20% 0)' }}
                transition={{ duration: MASK_DURATION / 1000, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
              >
                Shah
              </motion.span>
              {/* soft trailing-edge glow */}
              <motion.span
                className="display-name display-name--ghost"
                aria-hidden="true"
                initial={{ opacity: 0.18, clipPath: 'inset(-20% 100% -20% 0)' }}
                animate={{ opacity: 0,    clipPath: 'inset(-20% 0% -20% 0)' }}
                transition={{ duration: (MASK_DURATION * 1.15) / 1000, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
              >
                Shah
              </motion.span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
