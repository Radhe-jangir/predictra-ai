import { motion } from "framer-motion";
import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { fadeUpSm } from "../../lib/motion";

export function Card({
  className,
  glass,
  animate = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { glass?: boolean; animate?: boolean }) {
  const Comp = animate ? motion.div : "div";
  const motionProps = animate
    ? { variants: fadeUpSm, initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-60px" } }
    : {};
  return (
    <Comp
      className={cn(
        "rounded-xl border border-border bg-background/86 p-5 shadow-sm transition-shadow hover:shadow-md",
        glass && "glass",
        className,
      )}
      {...(motionProps as Record<string, unknown>)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex items-start justify-between gap-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold", className)} {...props} />;
}
