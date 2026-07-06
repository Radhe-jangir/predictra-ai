import { motion } from "framer-motion";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "icon" }
>(({ className, variant = "primary", size = "md", ...props }, ref) => (
  <motion.button
    ref={ref}
    whileHover={{ y: -1, transition: { type: "spring", stiffness: 400, damping: 25 } }}
    whileTap={{ scale: 0.97 }}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
      size === "sm" && "h-9 px-3.5 text-sm",
      size === "md" && "h-10 px-5 text-sm",
      size === "icon" && "h-10 w-10",
      variant === "primary" &&
        "bg-gradient-to-r from-teal-600 to-sky-500 text-white shadow-glow hover:brightness-110",
      variant === "secondary" &&
        "border border-border bg-background hover:bg-muted hover:border-primary/30",
      variant === "ghost" && "hover:bg-muted",
      variant === "danger" &&
        "bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:brightness-110",
      className,
    )}
    {...(props as any)}
  />
));
Button.displayName = "Button";
