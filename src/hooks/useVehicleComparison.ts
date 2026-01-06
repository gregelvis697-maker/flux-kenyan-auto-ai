import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const MAX_COMPARE = 3;

export function useVehicleComparison() {
  const [compareList, setCompareList] = useState<string[]>([]);
  const { toast } = useToast();

  const addToCompare = useCallback((vehicleId: string) => {
    setCompareList((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId);
      }
      if (prev.length >= MAX_COMPARE) {
        toast({
          title: 'Comparison limit reached',
          description: `You can compare up to ${MAX_COMPARE} vehicles at a time`,
          variant: 'destructive',
        });
        return prev;
      }
      return [...prev, vehicleId];
    });
  }, [toast]);

  const removeFromCompare = useCallback((vehicleId: string) => {
    setCompareList((prev) => prev.filter((id) => id !== vehicleId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback((vehicleId: string) => {
    return compareList.includes(vehicleId);
  }, [compareList]);

  return {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddMore: compareList.length < MAX_COMPARE,
  };
}
