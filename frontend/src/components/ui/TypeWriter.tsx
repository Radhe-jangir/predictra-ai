import { useEffect, useState } from "react";

/**
 * Rotates through a list of words with a typewriter effect.
 * Falls back to showing the first word for reduced-motion users.
 */
export function TypeWriter({
  words,
  className,
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseDuration = 2000,
}: {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplayed(words[0]);
      return;
    }

    const current = words[wordIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          const next = current.slice(0, displayed.length + 1);
          setDisplayed(next);
          if (next.length === current.length) {
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          const next = current.slice(0, displayed.length - 1);
          setDisplayed(next);
          if (next.length === 0) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed, isDeleting, wordIndex, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {displayed}
      <span className="animate-pulse text-primary font-bold">|</span>
    </span>
  );
}
