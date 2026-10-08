import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from 'framer-motion';

/* ------------------------------------------------------------------ */
/* Motion primitives. Every one respects prefers-reduced-motion.       */
/* ------------------------------------------------------------------ */

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts children into place the first time they scroll into view. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}> = ({ children, delay = 0, y = 18, className, as = 'div' }) => {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </Tag>
  );
};

/** Parent/child variants for staggered lists. */
export const stagger = (step = 0.07, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

export const rise: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE_OUT } },
};

export const Stagger: React.FC<{ children: React.ReactNode; className?: string; step?: number; delay?: number; as?: 'div' | 'ul' | 'ol' }> = ({ children, className, step, delay, as = 'div' }) => {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      variants={stagger(step, delay)}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </Tag>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string; as?: 'div' | 'li' }> = ({ children, className, as = 'div' }) => {
  const Tag = motion[as] as typeof motion.div;
  return <Tag className={className} variants={rise}>{children}</Tag>;
};

/**
 * Card with a cursor-following spotlight and border glow (Linear / Vercel style).
 * Pure CSS variables, so it costs nothing when the pointer is elsewhere.
 */
export const Spotlight: React.FC<React.HTMLAttributes<HTMLDivElement> & { glow?: string }> = ({ children, className = '', glow = 'rgba(183,255,73,.10)', style, ...rest }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={`spotlight group/spot relative ${className}`}
      style={{ ['--spot' as string]: glow, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
};

/** Counts up to a number when it first scrolls into view. Non-numbers render as-is. */
export const CountUp: React.FC<{ value: React.ReactNode; className?: string; decimals?: number; suffix?: string }> = ({ value, className, decimals = 0, suffix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const num = typeof value === 'number' ? value : null;
  const [shown, setShown] = useState(num === null || reduce ? num : 0);

  useEffect(() => {
    if (num === null) return;
    if (reduce || !inView) { if (reduce) setShown(num); return; }
    const controls = animate(0, num, { duration: 0.9, ease: EASE_OUT, onUpdate: v => setShown(v) });
    return () => controls.stop();
  }, [num, inView, reduce]);

  useEffect(() => { if (num !== null && inView && reduce) setShown(num); }, [num, inView, reduce]);

  if (num === null) return <span ref={ref} className={className}>{value}</span>;
  return <span ref={ref} className={className}>{(shown ?? 0).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
};

/** Subtle 3D tilt that settles flat as it scrolls in (the Linear hero screenshot move). */
export const TiltIn: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div style={{ perspective: 1600 }}>
      <motion.div
        className={className}
        initial={{ opacity: 0, rotateX: 18, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -8% 0px' }}
        transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.25 }}
        style={{ transformOrigin: '50% 0%' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/** Magnetic hover for primary calls to action. */
export const Magnetic: React.FC<{ children: React.ReactNode; strength?: number; className?: string }> = ({ children, strength = 0.25, className }) => {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });
  if (reduce) return <span className={className}>{children}</span>;
  return (
    <motion.span
      className={`inline-flex ${className ?? ''}`}
      style={{ x: sx, y: sy }}
      onPointerMove={e => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.span>
  );
};

/** Thin progress bar pinned to the top of the page. */
export const ScrollProgress: React.FC = () => {
  const reduce = useReducedMotion();
  const p = useMotionValue(0);
  const scaleX = useSpring(p, { stiffness: 200, damping: 30, mass: 0.3 });
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      p.set(h > 0 ? window.scrollY / h : 0);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [p]);
  const opacity = useTransform(scaleX, [0, 0.02], [0, 1]);
  if (reduce) return null;
  return <motion.div aria-hidden="true" className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-[#b7ff49]/0 via-[#b7ff49] to-[#d0ff88]" style={{ scaleX, opacity }} />;
};
