import { supabase } from "../supabase";

export async function fetchBusinesses() {
  const { data, error } = await supabase
    .from("businesses")
    .select(`*, deals (*)`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const now = new Date();
  return data.map(b => ({
    ...b,
    deals: (b.deals || [])
      .filter(d => d.is_active && new Date(d.expires_at) > now)
      .map(d => ({
        ...d,
        minutesLeft: Math.max(0, Math.floor((new Date(d.expires_at) - now) / 60000)),
      })),
  }));
}
