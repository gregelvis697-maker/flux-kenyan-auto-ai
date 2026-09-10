import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { GUEST_STORAGE_KEY, type PreferenceAnswers } from '@/lib/buildQuestions';

export interface BuyerPreference extends PreferenceAnswers {
  id: string;
  buyer_id: string;
  profile_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const table = () => (supabase as any).from('buyer_preferences');

export const readGuestAnswers = (): PreferenceAnswers | null => {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PreferenceAnswers) : null;
  } catch {
    return null;
  }
};

export const writeGuestAnswers = (answers: PreferenceAnswers) => {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* storage unavailable — answers stay in memory */
  }
};

export const clearGuestAnswers = () => {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    /* noop */
  }
};

/** Loads the signed-in buyer's saved preference profiles and keeps them in sync. */
export function useBuyerPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<BuyerPreference[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setPreferences([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await table()
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPreferences((data || []) as BuyerPreference[]);
    } catch (e) {
      console.error('Unable to load saved preferences', e);
      setPreferences([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (answers: PreferenceAnswers, id?: string) => {
      if (!user) return null;
      const payload = { ...answers, buyer_id: user.id };
      try {
        if (id) {
          const { data, error } = await table().update(payload).eq('id', id).select().maybeSingle();
          if (error) throw error;
          await load();
          return data as BuyerPreference | null;
        }
        const { data, error } = await table().insert(payload).select().maybeSingle();
        if (error) throw error;
        await load();
        return data as BuyerPreference | null;
      } catch (e) {
        console.error('Unable to save preferences', e);
        return null;
      }
    },
    [user, load],
  );

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        await table().update({ is_active: isActive }).eq('id', id);
        await load();
      } catch (e) {
        console.error('Unable to update preference', e);
      }
    },
    [load],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await table().delete().eq('id', id);
        await load();
      } catch (e) {
        console.error('Unable to delete preference', e);
      }
    },
    [load],
  );

  return { preferences, loading, reload: load, save, toggleActive, remove };
}

/** Flushes questionnaire answers captured before sign-up into the buyer's account. */
export function useFlushGuestPreferences() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const pending = readGuestAnswers();
    if (!pending) return;
    (async () => {
      try {
        const { count } = await table().select('id', { count: 'exact', head: true }).eq('buyer_id', user.id);
        if ((count ?? 0) === 0) {
          await table().insert({ ...pending, buyer_id: user.id });
        }
        clearGuestAnswers();
      } catch (e) {
        console.error('Unable to transfer saved answers', e);
      }
    })();
  }, [user]);
}
