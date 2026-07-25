import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Car } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FeaturedVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string | null;
  photos: string[] | null;
  verification_status?: string | null;
}

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
];

const matchPct = (i: number) => [98, 92, 89][i] ?? 90;

export const FeaturedInventory = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<FeaturedVehicle[]>(FALLBACK);

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
          .limit(3);
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

  const fmt = (n: number) => `KES ${n.toLocaleString()}`;

  return (
    <section className="bg-background text-foreground py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-end justify-between border-b border-border pb-6 mb-10">
          <div>
            <div className="text-[10px] tracking-editorial uppercase text-[#00d4ff] font-bold mb-3">
              Section 01 · Inventory
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Featured Inventory
            </h2>
          </div>
          <span className="hidden sm:block text-muted-foreground text-xs tracking-widest uppercase">
            Showing 01 — {String(vehicles.length).padStart(2, "0")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {vehicles.map((v, i) => (
            <motion.article
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onClick={() => navigate(`/vehicles/${v.id}`)}
              className="group cursor-pointer"
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
                  <span className="bg-[#00d4ff] text-background text-[10px] font-black px-2 py-1 uppercase tracking-tighter">
                    {matchPct(i)}% Match
                  </span>
                  {v.verification_status === "verified" && (
                    <span className="bg-background/80 backdrop-blur-md border border-white/10 text-foreground text-[10px] px-2 py-1 uppercase tracking-tighter">
                      AI Trust: High
                    </span>
                  )}
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
                  <CheckCircle2 className="w-5 h-5 text-[#00d4ff] shrink-0" />
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
            className="px-8 py-4 border border-border text-foreground font-bold uppercase tracking-widest text-xs hover:border-chrome hover:bg-muted transition-colors"
          >
            View Full Marketplace →
          </button>
        </div>
      </div>
    </section>
  );
};
