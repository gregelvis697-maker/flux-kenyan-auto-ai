import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HeroNetwork } from "@/components/HeroNetwork";
import { supabase } from "@/lib/supabase";

const STATS: { k: string; literal: string }[] = [
  { k: "Dealer Verification", literal: "KRA + Yard" },
  { k: "Coverage", literal: "Kenya-wide" },
  { k: "Trust Signals", literal: "Real-time" },
];

export const Hero = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);

  const [liveListings, setLiveListings] = useState<number | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { count } = await supabase
          .from("vehicles")
          .select("id", { count: "exact", head: true })
          .eq("is_sold", false);
        if (mounted && typeof count === "number") setLiveListings(count);
      } catch {
        /* silent: hide the tile */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [parallax, setParallax] = useState(0);
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setParallax(v * 60));
    return () => unsub();
  }, [scrollYProgress]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-background/70 text-foreground pt-28 md:pt-36 pb-20 md:pb-28 overflow-hidden"
    >
      {/* Parallax network visualisation */}
      <motion.div
        aria-hidden
        style={{ y: bgY, willChange: "transform" }}
        className="pointer-events-none absolute inset-0 opacity-70"
      >
        <HeroNetwork parallax={parallax} />
      </motion.div>

      {/* Ambient spotlight */}
      <motion.div
        aria-hidden
        style={{ y: glowY, willChange: "transform" }}
        className="pointer-events-none absolute inset-0 opacity-70"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, hsl(var(--brand) / 0.10), transparent 60%), radial-gradient(ellipse 80% 60% at 50% 100%, hsl(var(--chrome) / 0.05), transparent 70%)",
          }}
        />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative max-w-7xl mx-auto px-6 sm:px-10"
      >
        {/* Editorial rail */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-border" />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-brand text-[10px] sm:text-xs tracking-editorial font-bold uppercase"
          >
            Est. 2024 · Nairobi · Kenya
          </motion.span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-black uppercase leading-[0.85] tracking-tighter"
          style={{ fontSize: "clamp(3rem, 10vw, 8.5rem)" }}
        >
          Drive Into
          <br />
          The <span className="text-stroke">Future</span>
        </motion.h1>

        <div className="mt-12 md:mt-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="max-w-md text-base sm:text-lg text-muted-foreground font-light leading-relaxed"
          >
            Kenya's premier AI-powered automotive marketplace. High-performance
            matching for high-performance drivers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={() => navigate("/marketplace")}
              className="px-7 sm:px-8 py-4 bg-chrome text-background font-bold uppercase tracking-widest text-xs hover:bg-brand hover:text-brand-foreground transition-colors"
            >
              Browse Cars
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-7 sm:px-8 py-4 border border-border text-foreground font-bold uppercase tracking-widest text-xs hover:border-brand transition-colors"
            >
              Sell Vehicle
            </button>
          </motion.div>
        </div>

        {/* Animated meta stat rail */}
        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
          {(liveListings && liveListings > 0
            ? [{ k: "Live Listings", literal: liveListings.toLocaleString() }, ...STATS]
            : STATS
          ).map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group relative bg-background p-5 md:p-6 overflow-hidden"
            >
              <span className="absolute left-0 top-0 h-full w-px bg-brand scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-400" />
              <div className="text-[10px] tracking-editorial uppercase text-muted-foreground">
                {s.k}
              </div>
              <div className="mt-2 font-display text-xl md:text-2xl font-black">
                <span className="text-brand">{s.literal}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
