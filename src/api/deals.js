import { supabase } from "../supabase";

function calcExpiresAt(timeWindow) {
  const end = timeWindow.split("–")[1] || timeWindow.split("-")[1];
  if (!end) return new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

  const [h, m] = end.trim().split(":").map(Number);
  const expires = new Date();
  expires.setHours(h, m, 0, 0);
  if (expires <= new Date()) expires.setDate(expires.getDate() + 1);
  return expires.toISOString();
}

export async function fetchDeals(businessId) {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const now = new Date();
  return data.map(d => ({
    ...d,
    minutesLeft: Math.max(0, Math.floor((new Date(d.expires_at) - now) / 60000)),
  }));
}

export async function createDeal(businessId, form) {
  const { data, error } = await supabase
    .from("deals")
    .insert({
      business_id: businessId,
      title: form.title,
      category: form.category,
      discount: Number(form.discount),
      price_before: Number(form.priceBefore),
      price_after: Number(form.priceAfter),
      total: Number(form.remaining),
      remaining: Number(form.remaining),
      time_window: form.timeWindow,
      expires_at: calcExpiresAt(form.timeWindow),
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;

  const now = new Date();
  return { ...data, minutesLeft: Math.max(0, Math.floor((new Date(data.expires_at) - now) / 60000)) };
}

export async function deleteDeal(dealId) {
  const { error } = await supabase
    .from("deals")
    .update({ is_active: false })
    .eq("id", dealId);

  if (error) throw error;
}
