import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Gauge, Fuel, Calendar, ShieldCheck, ArrowRight, Car } from "lucide-react";
import { useEffect } from "react";

export interface QuickViewVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number | null;
  mileage: number | null;
  fuel_type: string | null;
  photos: string[] | null;
  verification_status?: string | null;
}

interface Props {
  vehicle: QuickViewVehicle | null;
  onClose: () => void;
}

export const QuickViewModal = ({ vehicle, onClose }: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const price = (p: number | null) =>
    p && p > 0 ? `KES ${p.toLocaleString()}` : "Call for Price";

  return (
    <AnimatePresence>
      {vehicle && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${vehicle.make} ${vehicle.model} quick view`}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-card border border-border shadow-elevated"
          >
            <button
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute top-3 right-3 z-10 h-10 w-10 flex items-center justify-center bg-background/70 backdrop-blur border border-border text-foreground hover:text-brand transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative aspect-[16/9] bg-muted overflow-hidden">
              {vehicle.photos && vehicle.photos[0] ? (
                <img
                  src={vehicle.photos[0]}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <Car className="w-16 h-16" />
                </div>
              )}
              {vehicle.verification_status === "verified" && (
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-brand text-brand-foreground text-[10px] font-black px-2 py-1 uppercase tracking-tighter">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              <div>
                <div className="text-[10px] tracking-editorial uppercase text-brand font-bold mb-2">
                  Quick View
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tighter">
                  {vehicle.make} {vehicle.model}
                </h3>
                <div className="mt-2 font-display text-xl sm:text-2xl font-black">
                  {price(vehicle.price)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-px bg-border border border-border">
                {[
                  { icon: Calendar, label: "Year", value: String(vehicle.year) },
                  {
                    icon: Gauge,
                    label: "Mileage",
                    value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} KM` : "New",
                  },
                  {
                    icon: Fuel,
                    label: "Fuel",
                    value: vehicle.fuel_type || "—",
                  },
                ].map((s) => (
                  <div key={s.label} className="bg-card p-4">
                    <s.icon className="h-4 w-4 text-brand mb-2" />
                    <div className="text-[10px] uppercase tracking-editorial text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="mt-1 font-display font-bold text-sm capitalize truncate">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-chrome text-background font-bold uppercase tracking-widest text-xs hover:bg-brand hover:text-brand-foreground transition-colors"
                >
                  View Full Details <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-4 border border-border font-bold uppercase tracking-widest text-xs hover:border-brand transition-colors"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
