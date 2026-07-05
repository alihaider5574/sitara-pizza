/* ─── Framer Motion Page Transition Variants ─────────────────────────────── */

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
}

/* ─── Stagger Children ────────────────────────────────────────────────────── */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ─── Slide In Right (Cart Drawer) ───────────────────────────────────────── */
export const slideInRight = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 28, stiffness: 300 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

/* ─── Card Hover ─────────────────────────────────────────────────────────── */
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.03,
    y: -6,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
}

/* ─── Fade Up ────────────────────────────────────────────────────────────── */
export const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ─── Scale In (Modal) ───────────────────────────────────────────────────── */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.1, ease: 'easeIn' },
  },
}
