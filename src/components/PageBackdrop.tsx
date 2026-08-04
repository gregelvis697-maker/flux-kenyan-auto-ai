import bgDark from "@/assets/bg-auto-dark.jpg";
import bgLight from "@/assets/bg-auto-light.jpg";

/**
 * Fixed, theme-aware automotive backdrop rendered behind every page.
 * Uses <picture> with device breakpoints + object-fit cover so the image
 * scales cleanly from phones to ultrawide without cropping the subject.
 */
export const PageBackdrop = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    {/* Dark theme */}
    <picture className="hidden dark:block">
      <source media="(max-width: 640px)" srcSet={`${bgDark}?w=768 768w`} />
      <source media="(max-width: 1024px)" srcSet={`${bgDark}?w=1280 1280w`} />
      <img
        src={bgDark}
        alt=""
        loading="lazy"
        decoding="async"
        width={1920}
        height={1280}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover object-[60%_center] sm:object-center opacity-70"
      />
    </picture>

    {/* Light theme */}
    <picture className="block dark:hidden">
      <source media="(max-width: 640px)" srcSet={`${bgLight}?w=768 768w`} />
      <source media="(max-width: 1024px)" srcSet={`${bgLight}?w=1280 1280w`} />
      <img
        src={bgLight}
        alt=""
        loading="lazy"
        decoding="async"
        width={1920}
        height={1280}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover object-[60%_center] sm:object-center opacity-25"
      />
    </picture>

    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 90% 60% at 50% 0%, hsl(var(--background) / 0.85) 0%, hsl(var(--background) / 0.95) 60%, hsl(var(--background)) 100%)",
      }}
    />
  </div>
);
