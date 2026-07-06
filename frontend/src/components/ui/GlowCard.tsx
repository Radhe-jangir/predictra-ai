import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "../../lib/utils";

/**
 * Card with a mouse-tracking radial gradient glow.
 * Uses CSS custom properties --mouse-x / --mouse-y set via JS.
 */
export function GlowCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        "glow-card glow-border glass rounded-xl border border-border p-6 shadow-sm",
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
