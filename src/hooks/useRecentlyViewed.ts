import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recently_viewed_vehicles';
const MAX_ITEMS = 5;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch {
        setRecentlyViewed([]);
      }
    }
  }, []);

  const addToRecentlyViewed = useCallback((vehicleId: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== vehicleId);
      const updated = [vehicleId, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewed([]);
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
}
