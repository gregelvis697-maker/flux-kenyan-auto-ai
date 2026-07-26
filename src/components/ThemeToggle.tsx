import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeToggle = React.forwardRef<
  HTMLButtonElement,
  { className?: string }
>(({ className = "" }, ref) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-border text-muted-foreground hover:text-brand hover:border-brand/50 transition-colors ${className}`}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </motion.span>
    </button>
  );
});

ThemeToggle.displayName = "ThemeToggle";
