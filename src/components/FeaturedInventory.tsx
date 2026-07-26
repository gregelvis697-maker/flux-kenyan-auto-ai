import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Car, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { QuickViewModal, type QuickViewVehicle } from "@/components/QuickViewModal";

type FeaturedVehicle = QuickViewVehicle;

const FALLBACK: FeaturedVehicle[] = [
  {
    id: "sample-1",
    make: "Mercedes-Benz",
    model: "G63 AMG",
    year: 2023,
    price: 32500000,
    mileage: 12000,
    fuel_type: "petrol",
    photos: null,
    verification_status: "verified",
  },
  {
    id: "sample-2",
    make: "Toyota",
    model: "Land Cruiser 300",
    year: 2022,
    price: 18900000,
    mileage: 4500,
    fuel_type: "diesel",
    photos: null,
    verification_status: "verified",
  },
  {
    id: "sample-3",
    make: "Range Rover",
    model: "Sport SVR",
    year: 2021,
    price: 16500000,
    mileage: 22000,
    fuel_type: "petrol",
    photos: null,
    verification_status: "verified",
  },
  {
    id: "sample-4",
    make: "Porsche",
    model: "Macan GTS",
    year: 2022,
    price: 14200000,
    mileage: 18000,
    fuel_type: "petrol",
    photos: null,
    verification_status: "verified",
  },
  {
    id: "sample-5",
    make: "BMW",
    model: "X5 M Competition",
    year: 2023,
    price: 21000000,
    mileage: 9000,
    fuel_type: "petrol",
    photos: null,
    verification_status: "verified",
  },
];

const matchPct = (i: number) => [98, 95, 92, 90, 89, 87, 86, 85][i % 8];

export const FeaturedInventory = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<FeaturedVehicle[]>(FALLBACK);
  const [quickView, setQuickView] = useState<FeaturedVehicle | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase
          .from("vehicles")
          .select(
            "id, make, model, year, price, mileage, fuel_type, photos, verification_status"
          )
          .eq("verification_status", "verified")
          .order("created_at", { ascending: false })
          .limit(10);
        if (mounted && data && data.length > 0) {
          setVehicles(data as FeaturedVehicle[]);
        }
      } catch {
        /* silent fallback */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateArrows();
  }, [vehicles]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 640), behavior: "smooth" });
  };

  const fmt = (n: number | null) =>
    n && n > 0 ? `KES ${n.toLocaleString()}` : "Call for Price";

  return (
    <section className="bg-background text-foreground py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-end justify-between border-b border-border pb-6 mb-10 gap-4">
          <div>
            <div className="text-[10px] tracking-editorial uppercase text-brand font-bold mb-3">
              Section 01 · Inventory
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Featured Inventory
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:block text-muted-foreground text-xs tracking-widest uppercase mr-3">
              {String(vehicles.length).padStart(2, "0")} Listings
            </span>
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canLeft}
              aria-label="Scroll inventory left"
              className="h-10 w-10 flex items-center justify-center border border-border hover:border-brand hover:text-brand transition-colors disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={!canRight}
              aria-label="Scroll inventory right"
              className="h-10 w-10 flex items-center justify-center border border-border hover:border-brand hover:text-brand transition-colors disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          onScroll={updateArrows}
          className="no-scrollbar flex gap-5 md:gap-7 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 sm:-mx-10 sm:px-10 pb-2"
        >
          {vehicles.map((v, i) => (
            <motion.article
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: Math.min(i, 3) * 0.08 }}
              onClick={() => setQuickView(v)}
              className="group cursor-pointer snap-start shrink-0 w-[78vw] sm:w-[46vw] lg:w-[31%]"
            >
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {v.photos && v.photos[0] ? (
                  <img
                    src={v.photos[0]}
                    alt={`${v.year} ${v.make} ${v.model}`}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Car className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-brand text-brand-foreground text-[10px] font-black px-2 py-1 uppercase tracking-tighter">
                    {matchPct(i)}% Match
                  </span>
                  {v.verification_status === "verified" && (
                    <span className="bg-background/80 backdrop-blur-md border border-border text-foreground text-[10px] px-2 py-1 uppercase tracking-tighter">
                      AI Trust: High
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-background/70 to-transparent">
                  <span className="text-[10px] font-black uppercase tracking-editorial text-brand">
                    Quick View
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-display text-lg sm:text-xl font-bold uppercase truncate">
                      {v.make} {v.model}
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {v.year} ·{" "}
                      {v.mileage ? `${v.mileage.toLocaleString()} KM` : "New"}
                      {v.fuel_type ? ` · ${v.fuel_type}` : ""}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black tracking-tighter">
                  {fmt(v.price)}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate("/marketplace")}
            className="px-8 py-4 border border-border text-foreground font-bold uppercase tracking-widest text-xs hover:border-brand hover:text-brand transition-colors"
          >
            View All Inventory →
          </button>
        </div>
      </div>

      <QuickViewModal vehicle={quickView} onClose={() => setQuickView(null)} />
    </section>
  );
};
