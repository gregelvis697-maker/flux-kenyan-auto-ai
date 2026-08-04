import bgDark from "@/assets/bg-auto-dark.jpg";
import bgLight from "@/assets/bg-auto-light.jpg";

/**
 * Fixed, theme-aware automotive backdrop rendered behind every page.
 * Sits below content (negative z-index) and never intercepts pointer events.
 */
export const PageBackdrop = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <img
      src={bgDark}
      alt=""
      loading="lazy"
      width={1920}
      height={1280}
      className="hidden dark:block absolute inset-0 h-full w-full object-cover opacity-70"
    />
    <img
      src={bgLight}
      alt=""
      loading="lazy"
      width={1920}
      height={1280}
      className="block dark:hidden absolute inset-0 h-full w-full object-cover opacity-25"
    />
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 90% 60% at 50% 0%, hsl(var(--background) / 0.85) 0%, hsl(var(--background) / 0.95) 60%, hsl(var(--background)) 100%)",
      }}
    />
  </div>
);
