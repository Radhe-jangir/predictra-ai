import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp } from "../../lib/motion";

/**
 * Reveals its children with a fade + rise the first time they scroll into view.
 * Thin wrapper over framer-motion so pages stay readable.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
