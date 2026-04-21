import { supabase } from "../supabase";

function generateCode() {
  return `TM-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createBooking({ userId, deal, biz, qty }) {
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
    .select(`*, deals (title, time_window, price_after, price_before, expires_at), businesses (name, emoji)`)
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
  const { error } = await supabase
    .from("bookings")
    .update({ status: "done" })
    .eq("id", bookingId);

  if (error) throw error;
}
