import bgDark from "@/assets/bg-auto-dark.jpg";
import bgLight from "@/assets/bg-auto-light.jpg";

/**
 * Fixed, theme-aware automotive backdrop rendered behind every page.
 * object-fit: cover + breakpoint-tuned object-position keeps the subject
 * framed on phones, tablets and wide desktops without stretching.
 */
export const PageBackdrop = () => {
  const base =
    "absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-[58%_center] md:object-center";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img
        src={bgDark}
        alt=""
        loading="lazy"
        decoding="async"
        width={1920}
        height={1280}
        sizes="100vw"
        className={`hidden dark:block ${base} opacity-70`}
      />
      <img
        src={bgLight}
        alt=""
        loading="lazy"
        decoding="async"
        width={1920}
        height={1280}
        sizes="100vw"
        className={`block dark:hidden ${base} opacity-25`}
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
};
