import { useState, useEffect } from "react";
import { fetchBusinesses } from "../api/businesses";
import { supabase } from "../supabase";

export function useBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses()
      .then(setBusinesses)
      .catch(console.error)
      .finally(() => setLoading(false));

    const channel = supabase
      .channel("deals-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "deals" },
        (payload) => {
          const updated = payload.new;
          const now = new Date();
          setBusinesses(prev =>
            prev.map(b => ({
              ...b,
              deals: b.deals
                .map(d => d.id === updated.id ? { ...d, remaining: updated.remaining, is_active: updated.is_active } : d)
                .filter(d => d.is_active && new Date(d.expires_at) > now),
            }))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "deals" },
        () => { fetchBusinesses().then(setBusinesses).catch(console.error); }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return { businesses, loading };
}
