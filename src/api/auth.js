import { supabase } from "../supabase";

export async function registerUser({ email, password, name }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const { error: pErr } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, name, role: "user" });
  if (pErr) throw pErr;

  return { id: data.user.id, email, name, role: "user" };
}

export async function registerBusiness({ email, password, biz }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const { error: pErr } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, name: biz.name, role: "business" });
  if (pErr) throw pErr;

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
    })
    .select()
    .single();
  if (bErr) throw bErr;

  return { id: data.user.id, email, name: biz.name, role: "business", business: bizData };
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
  if (profile.role === "business") {
    const { data: biz } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", data.user.id)
      .single();
    business = biz;
  }

  return { id: data.user.id, email: data.user.email, name: profile.name, role: profile.role, business };
}

export async function signOut() {
  await supabase.auth.signOut();
}
