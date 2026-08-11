import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface PlatformStats {
  liveListings: number;
  verifiedListings: number;
  verifiedDealers: number;
  trackedVehicles: number;
}

const countOf = async (
  table: string,
  build?: (q: any) => any,
): Promise<number> => {
  let query: any = supabase
    .from(table as any)
    .select("id", { count: "exact", head: true });
  if (build) query = build(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
};

const fetchPlatformStats = async (): Promise<PlatformStats> => {
  const [liveListings, verifiedListings, verifiedDealers, trackedVehicles] =
    await Promise.all([
      countOf("vehicles", (q) => q.eq("is_sold", false)),
      countOf("vehicles", (q) =>
        q.eq("is_sold", false).eq("verification_status", "verified"),
      ),
      countOf("public_dealer_profiles").catch(() => 0),
      countOf("vehicle_tracking", (q) => q.eq("tracking_enabled", true)).catch(
        () => 0,
      ),
    ]);

  return { liveListings, verifiedListings, verifiedDealers, trackedVehicles };
};

/**
 * Live platform metrics sourced entirely from the backend.
 * Never returns placeholder / invented numbers — consumers should render
 * a loading state while `isLoading` and hide any metric that is 0.
 */
export const usePlatformStats = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["platform-stats"],
    queryFn: fetchPlatformStats,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });

  // Realtime: refresh whenever inventory or tracking changes.
  useEffect(() => {
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: ["platform-stats"] });

    const channel = supabase
      .channel("platform-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicles" },
        invalidate,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicle_tracking" },
        invalidate,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};
