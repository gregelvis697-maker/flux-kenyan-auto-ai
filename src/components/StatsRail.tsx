import { usePlatformStats } from "@/hooks/usePlatformStats";

/**
 * Live platform metrics rail. Never invents numbers — a metric that is 0
 * (or still loading) is simply not rendered.
 */
export const StatsRail = () => {
  const { data, isLoading } = usePlatformStats();

  const items = [
    { label: "Live listings", value: data?.liveListings },
    { label: "Verified listings", value: data?.verifiedListings },
    { label: "Verified dealers", value: data?.verifiedDealers },
    { label: "Vehicles tracked", value: data?.trackedVehicles },
  ].filter((i) => (i.value ?? 0) > 0);

  if (isLoading || items.length === 0) return null;

  return (
    <section className="border-y border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          {items.map((item) => (
            <div key={item.label} className="px-4 py-7 sm:py-9 text-center">
              <dt className="text-[10px] uppercase tracking-editorial text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {item.value?.toLocaleString()}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};
