import { supabase } from "../supabase";

function generateCode() {
  return `TM-${Math.floor(1000 + Math.random() * 9000)}`;
}

const BAN_DURATIONS = [
  24 * 60 * 60 * 1000,       // 1 miss  → 24 ч
  3  * 24 * 60 * 60 * 1000,  // 2 misses → 3 дня
  7  * 24 * 60 * 60 * 1000,  // 3+ misses → 7 дней
];

function banDuration(consecutiveMisses) {
  const idx = Math.min(consecutiveMisses - 1, BAN_DURATIONS.length - 1);
  return BAN_DURATIONS[idx];
}

export async function processExpiredBookings(userId) {
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("bookings")
    .select("id, deals(expires_at)")
    .eq("user_id", userId)
    .eq("status", "active");

  if (!data?.length) return;

  const missedIds = data
    .filter(bk => bk.deals?.expires_at && bk.deals.expires_at < now)
    .map(bk => bk.id);

  if (!missedIds.length) return;

  await supabase.from("bookings").update({ status: "missed" }).in("id", missedIds);

  const { data: profile } = await supabase
    .from("profiles")
    .select("consecutive_misses")
    .eq("id", userId)
    .single();

  const newMisses = (profile?.consecutive_misses || 0) + missedIds.length;
  const bannedUntil = new Date(Date.now() + banDuration(newMisses)).toISOString();

  await supabase
    .from("profiles")
    .update({ consecutive_misses: newMisses, banned_until: bannedUntil })
    .eq("id", userId);
}

export async function createBooking({ userId, deal, biz, qty }) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("banned_until, consecutive_misses")
    .eq("id", userId)
    .single();

  if (profile?.banned_until && new Date(profile.banned_until) > new Date()) {
    const h = Math.ceil((new Date(profile.banned_until) - Date.now()) / 3600000);
    const days = Math.floor(h / 24);
    const timeStr = days >= 1 ? `${days} дн.` : `${h} ч.`;
    throw new Error(`Аккаунт временно заблокирован. Разблокировка через ${timeStr}`);
  }

  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("user_id", userId)
    .eq("deal_id", deal.id)
    .eq("status", "active")
    .maybeSingle();

  if (existing) throw new Error("Вы уже забронировали эту акцию");

  const code = generateCode();

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      deal_id: deal.id,
      business_id: biz.id,
      qty,
      total_price: deal.price_after * qty,
      code,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;

  const { error: dealError } = await supabase
    .from("deals")
    .update({ remaining: deal.remaining - qty })
    .eq("id", deal.id);

  if (dealError) throw dealError;

  return data;
}

export async function fetchUserBookings(userId) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`*, deals (title, time_window, price_after, price_before, expires_at), businesses (name, emoji), reviews (id, rating, comment)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const now = new Date();
  return data.map(bk => ({
    ...bk,
    minutesLeft: bk.deals?.expires_at
      ? Math.max(0, Math.floor((new Date(bk.deals.expires_at) - now) / 60000))
      : 0,
  }));
}

export async function fetchBusinessBookings(businessId) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`*, deals (title, time_window), profiles (name)`)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function markBookingDone(bookingId) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "done" })
    .eq("id", bookingId)
    .select("user_id")
    .single();

  if (error) throw error;

  if (data?.user_id) {
    await supabase
      .from("profiles")
      .update({ consecutive_misses: 0, banned_until: null })
      .eq("id", data.user_id);
  }
}
