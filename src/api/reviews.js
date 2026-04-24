import { supabase } from "../supabase";

export async function submitReview({ bookingId, businessId, userId, rating, comment }) {
  const { error } = await supabase
    .from("reviews")
    .insert({ booking_id: bookingId, business_id: businessId, user_id: userId, rating, comment: comment.trim() || null });
  if (error) throw error;
}

export async function fetchBusinessReviews(businessId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles (name)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
