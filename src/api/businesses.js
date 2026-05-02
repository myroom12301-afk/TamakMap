import { supabase } from "../supabase";

const GEOAPIFY_KEY = "dfa9d1176a6b4cb1bfc3efdff0ed5cd8";

export async function geocodeAddress(address) {
  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address + ", Бишкек")}&filter=countrycode:kg&lang=ru&limit=1&apiKey=${GEOAPIFY_KEY}`
    );
    const data = await res.json();
    const item = data.features?.[0];
    if (item) return { lat: item.properties.lat, lng: item.properties.lon };
  } catch {}
  return { lat: 42.8746, lng: 74.5698 };
}

export async function addBusiness(ownerId, biz, coords) {
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      owner_id: ownerId,
      name: biz.name,
      type: biz.type,
      address: biz.address,
      district: biz.district,
      description: biz.description,
      phone: biz.whatsapp,
      emoji: "🏪",
      color: "#374151",
      bg_color: "#F3F4F6",
      lat: coords?.lat ?? 42.8746,
      lng: coords?.lng ?? 74.5698,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadBusinessCover(businessId, file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `${businessId}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("business-covers")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from("business-covers").getPublicUrl(path);
  const url = data.publicUrl;
  const { error: updErr } = await supabase.from("businesses").update({ cover_image: url }).eq("id", businessId);
  if (updErr) throw updErr;
  return url;
}

export async function uploadBusinessLogo(businessId, file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `logo-${businessId}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("business-covers")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from("business-covers").getPublicUrl(path);
  const url = data.publicUrl;
  const { error: updErr } = await supabase.from("businesses").update({ logo_image: url }).eq("id", businessId);
  if (updErr) throw updErr;
  return url;
}

export async function updateBusiness(bizId, fields, coords) {
  const patch = {
    name: fields.name,
    type: fields.type,
    address: fields.address,
    district: fields.district,
    description: fields.description,
    phone: fields.whatsapp,
  };
  if (coords) { patch.lat = coords.lat; patch.lng = coords.lng; }
  const { data, error } = await supabase
    .from("businesses")
    .update(patch)
    .eq("id", bizId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchBusinesses() {
  // best-effort: деактивируем просроченные (молча, если нет прав)
  supabase
    .from("deals")
    .update({ is_active: false })
    .eq("is_active", true)
    .lt("expires_at", new Date().toISOString())
    .then(() => {}).catch(() => {});

  const { data, error } = await supabase
    .from("businesses")
    .select(`*, deals (*), reviews (rating)`)
    .not("address", "is", null)
    .neq("address", "")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const now = new Date();
  return data.map(b => {
    const reviews = b.reviews || [];
    const reviews_count = reviews.length;
    const rating = reviews_count > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews_count) * 10) / 10
      : null;

    return {
      ...b,
      rating,
      reviews_count,
      deals: (b.deals || [])
        .filter(d => d.is_active && new Date(d.expires_at) > now)
        .map(d => ({
          ...d,
          minutesLeft: Math.max(0, Math.floor((new Date(d.expires_at) - now) / 60000)),
        })),
    };
  });
}
