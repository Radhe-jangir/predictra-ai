import type { Variants, Transition } from "framer-motion";

/**
 * Shared framer-motion presets so animations feel consistent across the app.
 * Tuned for a calm, "premium SaaS" feel: short durations, soft easing.
 */

export const easeOut: Transition["ease"] = [0.22, 1, 0.36, 1];

/** Fade + rise. Use on hero blocks and section headers. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

/** Smaller rise for list/grid items. */
export const fadeUpSm: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easeOut },
  },
};

/** Parent container that reveals children one after another. */
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

/** Route-level page transition used with AnimatePresence. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } },
};

/** Interactive card hover/press (spring). */
export const hoverLift = {
  whileHover: { y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } },
  whileTap: { scale: 0.98 },
} as const;

/** Chat message entrance from left (bot). */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOut } },
};

/** Chat message entrance from right (user). */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOut } },
};

/** Bouncy scale-in for hero accents and 404. */
export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

/** Expand/collapse for accordion items. */
export const expandCollapse: Variants = {
  collapsed: { height: 0, opacity: 0, overflow: "hidden" },
  expanded: {
    height: "auto",
    opacity: 1,
    overflow: "hidden",
    transition: { duration: 0.35, ease: easeOut },
  },
};

/** Badge / small element entrance. */
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: easeOut } },
};
