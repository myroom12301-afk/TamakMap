import { supabase } from "../supabase";

function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createInviteCode(businessId) {
  const code = genCode();
  const { data, error } = await supabase
    .from("staff_invites")
    .insert({ business_id: businessId, code })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchInviteCodes(businessId) {
  const { data, error } = await supabase
    .from("staff_invites")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
