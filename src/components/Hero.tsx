import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronsRight, Search, Wand2 } from "lucide-react";
import { HeroNetwork } from "@/components/HeroNetwork";
import { AiDescribeSearch } from "@/components/AiDescribeSearch";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { supabase } from "@/lib/supabase";

const FUEL_OPTIONS = [
  { value: "", label: "Fuel Type" },
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => String(CURRENT_YEAR - i));

const PRICE_STEPS = [500000, 1000000, 2000000, 3000000, 5000000, 10000000, 20000000, 50000000, 100000000, 200000000].map(
  (v) => ({ value: String(v), label: `KES ${v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}K`}` })
);

const selectClass =
  "h-12 w-full bg-transparent border-0 border-b border-border px-0 text-sm text-foreground outline-none focus:border-brand transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-card";

// Qualitative, non-numeric capability labels (always true, never invented data)
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

  const { data: stats, isLoading: statsLoading } = usePlatformStats();

  // Only metrics with a real, non-zero backend value are rendered.
  const liveMetrics = stats
    ? [
        { k: "Live Listings", literal: stats.liveListings.toLocaleString() , n: stats.liveListings },
        { k: "Verified Listings", literal: stats.verifiedListings.toLocaleString(), n: stats.verifiedListings },
        { k: "Verified Dealers", literal: stats.verifiedDealers.toLocaleString(), n: stats.verifiedDealers },
        { k: "Vehicles Tracked", literal: stats.trackedVehicles.toLocaleString(), n: stats.trackedVehicles },
      ].filter((m) => m.n > 0)
    : [];

  const tiles = [...liveMetrics, ...STATS].slice(0, 4);


  const [parallax, setParallax] = useState(0);
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setParallax(v * 60));
    return () => unsub();
  }, [scrollYProgress]);

  // Hero search state
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [fuel, setFuel] = useState("");
  const [year, setYear] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rows, setRows] = useState<{ make: string; model: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("vehicles")
      .select("make, model")
      .limit(1000)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setRows(data as { make: string; model: string }[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const makes = useMemo(() => [...new Set(rows.map((r) => r.make).filter(Boolean))].sort(), [rows]);
  const models = useMemo(
    () => [...new Set(rows.filter((r) => r.make === make).map((r) => r.model).filter(Boolean))].sort(),
    [rows, make]
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (fuel) params.set("fuel", fuel);
    if (year) params.set("minYear", year);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    navigate(`/marketplace${params.toString() ? `?${params.toString()}` : ""}`);
  };

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

        {/* Find a Car panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-12 md:mt-16 bg-card text-card-foreground border border-border shadow-2xl p-5 md:p-8"
        >
          <h2 className="font-display text-xl md:text-2xl font-black uppercase tracking-tight">Find a Car</h2>
          <span className="mt-2 block h-0.5 w-12 bg-brand" />

          <div className="mt-6 grid grid-cols-2 md:grid-cols-[repeat(6,minmax(0,1fr))_auto] gap-x-4 gap-y-5 items-end">
            <select value={make} onChange={(e) => { setMake(e.target.value); setModel(""); }} className={selectClass} aria-label="Make">
              <option value="">Select Make</option>
              {makes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={model} onChange={(e) => setModel(e.target.value)} className={selectClass} aria-label="Model" disabled={!make}>
              <option value="">Select Model</option>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={fuel} onChange={(e) => setFuel(e.target.value)} className={selectClass} aria-label="Fuel type">
              {FUEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className={selectClass} aria-label="Year from">
              <option value="">Year</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}+</option>)}
            </select>
            <select value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={selectClass} aria-label="Min price">
              <option value="">Min Price</option>
              {PRICE_STEPS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={selectClass} aria-label="Max price">
              <option value="">Max Price</option>
              {PRICE_STEPS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <button
              onClick={handleSearch}
              className="col-span-2 md:col-span-1 h-12 px-8 inline-flex items-center justify-center gap-1 bg-brand text-brand-foreground font-bold uppercase tracking-widest text-xs hover:bg-chrome hover:text-background transition-colors"
            >
              Search <ChevronsRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="or search by keyword…"
              className="h-10 w-full bg-transparent border-b border-border pl-6 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-brand">
              <Wand2 className="h-4 w-4" /> Or describe your ideal car
            </div>
            <AiDescribeSearch />
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
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
              onClick={() => navigate("/build")}
              className="px-7 sm:px-8 py-4 border border-brand text-brand font-bold uppercase tracking-widest text-xs hover:bg-brand hover:text-brand-foreground transition-colors"
            >
              Build Your Perfect Vehicle
              <span className="block mt-1 text-[10px] font-medium tracking-normal normal-case opacity-70">
                Takes 5 minutes
              </span>
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-7 sm:px-8 py-4 border border-border text-foreground font-bold uppercase tracking-widest text-xs hover:border-brand transition-colors"
            >
              Sell Vehicle
            </button>
          </motion.div>
        </div>

        {/* Live metric rail — backend-sourced, with loading + empty states */}
        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-background p-5 md:p-6">
                  <div className="h-2 w-20 bg-muted animate-pulse" />
                  <div className="mt-3 h-6 w-24 bg-muted animate-pulse" />
                </div>
              ))
            : tiles.map((s, i) => (
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
