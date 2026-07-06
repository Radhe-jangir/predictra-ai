import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("predictra.theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("predictra.theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <Button variant="secondary" size="icon" onClick={() => setDark((value) => !value)} aria-label="Toggle dark mode">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
