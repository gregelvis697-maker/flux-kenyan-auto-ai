import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ctaBg from "@/assets/cta-bg.jpg";

export const CtaBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden border-t border-border">
      <img
        src={ctaBg}
        alt=""
        aria-hidden
        loading="lazy"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover opacity-60 dark:opacity-70"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, hsl(var(--background) / 0.95) 0%, hsl(var(--background) / 0.75) 45%, hsl(var(--background) / 0.35) 100%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-24 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <div className="text-[10px] tracking-editorial uppercase text-brand font-bold mb-4">
            Ready When You Are
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.88]">
            Find The One
            <br />
            <span className="text-brand">Worth Driving</span>
          </h2>
          <p className="mt-6 text-muted-foreground font-light leading-relaxed">
            Browse verified inventory across Kenya, compare against live market
            data, and talk directly to the dealer holding the keys.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/marketplace")}
              className="px-8 py-4 bg-brand text-brand-foreground font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
            >
              Browse Inventory
            </button>
            <button
              onClick={() => navigate("/stores")}
              className="px-8 py-4 border border-border bg-background/40 backdrop-blur font-bold uppercase tracking-widest text-xs hover:border-brand transition-colors"
            >
              Find A Dealer
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
