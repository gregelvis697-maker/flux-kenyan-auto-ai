import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-background text-foreground pt-28 md:pt-36 pb-20 md:pb-28 overflow-hidden">
      {/* Ambient chrome spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,212,255,0.08), transparent 60%), radial-gradient(ellipse 80% 60% at 50% 100%, rgba(229,229,229,0.04), transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">
        {/* Editorial rail */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[#00d4ff] text-[10px] sm:text-xs tracking-editorial font-bold uppercase">
            Est. 2024 · Nairobi · Kenya
          </span>
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
              className="px-7 sm:px-8 py-4 bg-chrome text-background font-bold uppercase tracking-widest text-xs hover:bg-[#00d4ff] transition-colors"
            >
              Browse Cars
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-7 sm:px-8 py-4 border border-border text-foreground font-bold uppercase tracking-widest text-xs hover:border-chrome transition-colors"
            >
              Sell Vehicle
            </button>
          </motion.div>
        </div>

        {/* Meta stat rail */}
        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
          {[
            { k: "Verified Dealers", v: "240+" },
            { k: "Live Inventory", v: "1,200+" },
            { k: "Cities Covered", v: "12" },
            { k: "AI Trust Signals", v: "Real-time" },
          ].map((s) => (
            <div key={s.k} className="bg-background p-5 md:p-6">
              <div className="text-[10px] tracking-editorial uppercase text-muted-foreground">
                {s.k}
              </div>
              <div className="mt-2 font-display text-xl md:text-2xl font-black">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
