import { supabase } from "../supabase";
import { geocodeAddress } from "./businesses";

export async function registerUser({ email, password, name }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const { error: pErr } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, name, role: "user" });
  if (pErr) throw pErr;

  return { id: data.user.id, email, name, role: "user" };
}

export async function registerOwner({ email, password, biz, coords: preCoords }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const { error: pErr } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, name: biz.name, role: "owner" });
  if (pErr) throw pErr;

  const coords = preCoords ?? (biz.address ? await geocodeAddress(biz.address) : { lat: 42.8746, lng: 74.5698 });

  const { data: bizData, error: bErr } = await supabase
    .from("businesses")
    .insert({
      owner_id: data.user.id,
      name: biz.name,
      type: biz.type,
      address: biz.address,
      district: biz.district,
      description: biz.description,
      phone: biz.whatsapp,
      emoji: "🏪",
      color: "#374151",
      bg_color: "#F3F4F6",
      lat: coords.lat,
      lng: coords.lng,
    })
    .select()
    .single();
  if (bErr) throw bErr;

  return { id: data.user.id, email, name: biz.name, role: "owner", businesses: [bizData], business: bizData };
}

export async function registerStaff({ email, password, name, inviteCode }) {
  // Проверяем код приглашения
  const { data: invite, error: iErr } = await supabase
    .from("staff_invites")
    .select("*, businesses(*)")
    .eq("code", inviteCode.toUpperCase())
    .eq("used", false)
    .single();
  if (iErr || !invite) throw new Error("Неверный или использованный код приглашения");

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const { error: pErr } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, name, role: "staff", business_id: invite.business_id });
  if (pErr) throw pErr;

  // Помечаем код как использованный
  await supabase.from("staff_invites").update({ used: true }).eq("id", invite.id);

  return { id: data.user.id, email, name, role: "staff", business: invite.businesses };
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();
  if (pErr) throw pErr;

  let business = null;
  let businesses = [];

  if (profile.role === "owner") {
    const { data: bizList } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", data.user.id)
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

  return { id: data.user.id, email: data.user.email, name: profile.name, role: profile.role, business, businesses };
}

export async function signOut() {
  await supabase.auth.signOut();
}
