import { useState, useEffect } from "react";
import { supabase } from "../supabase";

async function loadUser(authUser) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) return null;

  let business = null;
  let businesses = [];

  if (profile.role === "owner") {
    const { data: bizList } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", authUser.id)
      .order("created_at", { ascending: true });
    businesses = bizList || [];
    business = businesses[0] || null;
  }

  if (profile.role === "staff") {
    const { data: biz } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", profile.business_id)
      .single();
    business = biz;
  }

  return { id: authUser.id, email: authUser.email, name: profile.name, role: profile.role, business, businesses, banned_until: profile.banned_until ?? null, consecutive_misses: profile.consecutive_misses ?? 0 };
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const u = await loadUser(session.user);
        setUser(u);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, setUser, loading };
}
