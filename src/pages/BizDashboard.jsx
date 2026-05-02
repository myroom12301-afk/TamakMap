import { useState, useEffect, useRef } from "react";
import { fetchDeals, createDeal, deleteDeal } from "../api/deals";
import { addBusiness, uploadBusinessCover, uploadBusinessLogo, updateBusiness } from "../api/businesses";
import { createInviteCode, fetchInviteCodes } from "../api/invites";
import { useBusinessBookings } from "../hooks/useBusinessBookings";
import { markBookingDone } from "../api/bookings";
import AddressInput from "../components/AddressInput";

const emptyForm = { title: "", discount: "", category: "", priceBefore: "", priceAfter: "", remaining: "", timeWindow: "" };
const emptyBizForm = { name: "", type: "Пекарня", address: "", district: "Центр", description: "", whatsapp: "" };

const OWNER_TABS = [
  { id: "overview", label: "Главная" },
  { id: "deals", label: "Акции" },
  { id: "bookings", label: "Брони" },
  { id: "profile", label: "Профиль" },
  { id: "codes", label: "Коды" },
  { id: "photos", label: "Фото" },
];

function PhotoUploader({ label, hint, currentUrl, aspectSquare, onSave }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) { setError("Файл слишком большой. Максимум 3 МБ"); return; }
    setError(""); setFile(f); setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setUploading(true); setError("");
    try { await onSave(file); setFile(null); setPreview(null); }
    catch (e) { setError(e.message); }
    finally { setUploading(false); }
  };

  const url = preview || currentUrl;
  const w = aspectSquare ? 80 : "100%";
  const h = aspectSquare ? 80 : 110;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 3 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8 }}>{hint}</div>}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFile} />
      <div onClick={() => ref.current?.click()} style={{
        width: w, height: h, borderRadius: aspectSquare ? 14 : 10, overflow: "hidden",
        background: "#E5E7EB", cursor: "pointer", border: "2px dashed #D1D5DB",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", marginBottom: 8,
      }}>
        {url
          ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ textAlign: "center", color: "#9CA3AF" }}>
              <div style={{ fontSize: aspectSquare ? 22 : 26, marginBottom: 2 }}>🖼️</div>
              {!aspectSquare && <div style={{ fontSize: 11, fontWeight: 700 }}>Нажмите чтобы выбрать</div>}
            </div>
        }
        {url && <div style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.5)", color: "#fff", borderRadius: 6, padding: "2px 6px", fontSize: 10, fontWeight: 700 }}>Изменить</div>}
      </div>
      {error && <p style={{ color: "#DC2626", fontSize: 11, marginBottom: 6 }}>{error}</p>}
      {file && (
        <button onClick={handleSave} disabled={uploading} style={{
          width: w, padding: "7px", background: uploading ? "#9CA3AF" : "#16A34A",
          color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: uploading ? "not-allowed" : "pointer",
        }}>
          {uploading ? "Загрузка..." : "Сохранить"}
        </button>
      )}
    </div>
  );
}

const STAFF_TABS = [
  { id: "overview", label: "Главная" },
  { id: "deals", label: "Акции" },
  { id: "bookings", label: "Брони" },
];

export default function BizDashboard({ user, onLogout, onBusinessAdded, onBusinessUpdated }) {
  const isOwner = user?.role === "owner";
  const isStaff = user?.role === "staff";
  const businesses = isOwner ? (user?.businesses || (user?.business ? [user.business] : [])) : (user?.business ? [user.business] : []);
  const TABS = isOwner ? OWNER_TABS : STAFF_TABS;
  const [selIdx, setSelIdx] = useState(0);
  const b = businesses[selIdx] || null;

  const [tab, setTab] = useState("overview");
  const [deals, setDeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [codes, setCodes] = useState([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [confirmBooking, setConfirmBooking] = useState(null);

  const [pickedBiz, setPickedBiz] = useState(null);
  const [showBizPicker, setShowBizPicker] = useState(false);

  const [showAddBiz, setShowAddBiz] = useState(false);
  const [bizForm, setBizForm] = useState(emptyBizForm);
  const [bizCoords, setBizCoords] = useState(null);
  const [bizSaving, setBizSaving] = useState(false);
  const [bizError, setBizError] = useState("");

  const [profileForm, setProfileForm] = useState({});
  const [profileCoords, setProfileCoords] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [copiedId, setCopiedId] = useState(null);

  const { bookings, setBookings, loading: bookingsLoading } = useBusinessBookings(b?.id);

  useEffect(() => {
    if (b?.id) {
      fetchDeals(b.id).then(setDeals).catch(console.error);
    }
  }, [b?.id]);

  useEffect(() => {
    if (tab === "codes" && b?.id) {
      setCodesLoading(true);
      fetchInviteCodes(b.id).then(c => { setCodes(c); setCodesLoading(false); });
    }
  }, [tab, b?.id]);

  useEffect(() => {
    if (b) {
      setProfileForm({
        name: b.name || "",
        type: b.type || "Пекарня",
        address: b.address || "",
        district: b.district || "Центр",
        description: b.description || "",
        whatsapp: b.phone || "",
      });
      setProfileCoords(b.lat && b.lng ? { lat: b.lat, lng: b.lng } : null);
      setProfileError("");
      setProfileSaved(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b?.id]);

  if (!b) return (
    <div style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}>
      Нет данных заведения
    </div>
  );

  const handleCreate = async () => {
    if (!form.title || !form.discount || !form.timeWindow) {
      setFormError("Заполните название, скидку и время выдачи");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const deal = await createDeal(b.id, form);
      setDeals([deal, ...deals]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dealId) => {
    await deleteDeal(dealId);
    setDeals(deals.filter(d => d.id !== dealId));
  };

  const handleMarkDone = async (bookingId) => {
    await markBookingDone(bookingId);
    setBookings(bookings.map(bk => bk.id === bookingId ? { ...bk, status: "done" } : bk));
  };

  const handleGenCode = async () => {
    try {
      const code = await createInviteCode(b.id);
      setCodes([code, ...codes]);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAddBiz = async () => {
    if (!bizForm.name) { setBizError("Введите название"); return; }
    setBizSaving(true);
    setBizError("");
    try {
      const newBiz = await addBusiness(user.id, bizForm, bizCoords);
      onBusinessAdded(newBiz);
      setBizForm(emptyBizForm);
      setBizCoords(null);
      setShowAddBiz(false);
    } catch (e) {
      setBizError(e.message);
    } finally {
      setBizSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name) { setProfileError("Введите название"); return; }
    setProfileSaving(true);
    setProfileError("");
    setProfileSaved(false);
    try {
      const updated = await updateBusiness(b.id, profileForm, profileCoords);
      onBusinessUpdated?.(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (e) {
      setProfileError(e.message);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* Переключатель точек — только для владельца */}
      {isOwner && <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "10px 16px" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {businesses.map((biz, i) => (
            <button key={biz.id} onClick={() => { setSelIdx(i); setTab("overview"); }}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800,
                background: i === selIdx ? "#16A34A" : "#F3F4F6",
                color: i === selIdx ? "#fff" : "#374151",
              }}>
              {biz.emoji} {biz.name.split(" ")[0]}
            </button>
          ))}
          <button onClick={() => setShowAddBiz(!showAddBiz)}
            style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "2px dashed #D1D5DB", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "#9CA3AF" }}>
            + Точка
          </button>
        </div>

        {/* Форма новой точки */}
        {showAddBiz && (
          <div style={{ marginTop: 12, background: "#F8F7F4", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 10 }}>Новая точка</div>
            {[["Название", "name"], ["Описание", "description"], ["WhatsApp", "whatsapp"]].map(([ph, key]) => (
              <input key={key} placeholder={ph} value={bizForm[key]}
                onChange={e => setBizForm({ ...bizForm, [key]: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, marginBottom: 8, boxSizing: "border-box", fontFamily: "inherit" }}
              />
            ))}
            <AddressInput value={bizForm.address} onChange={v => setBizForm({ ...bizForm, address: v })} onCoords={c => setBizCoords(c)} />
            <select value={bizForm.type} onChange={e => setBizForm({ ...bizForm, type: e.target.value })}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, marginBottom: 8, background: "#fff", fontFamily: "inherit" }}>
              {["Пекарня", "Кофейня", "Кафе", "Ресторан", "Буфет"].map(t => <option key={t}>{t}</option>)}
            </select>
            {bizError && <p style={{ color: "#DC2626", fontSize: 12, marginBottom: 8 }}>{bizError}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowAddBiz(false)}
                style={{ flex: 1, padding: "8px", background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#374151" }}>
                Отмена
              </button>
              <button onClick={handleAddBiz} disabled={bizSaving}
                style={{ flex: 2, padding: "8px", background: bizSaving ? "#9CA3AF" : "#16A34A", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: bizSaving ? "not-allowed" : "pointer", color: "#fff" }}>
                {bizSaving ? "Создание..." : "Добавить точку"}
              </button>
            </div>
          </div>
        )}
      </div>}

      {/* Баннер сотрудника */}
      {isStaff && (
        <div style={{ background: "#FEF3C7", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: b.bg_color, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{b.emoji}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#92400E" }}>{b.name}</div>
            <div style={{ fontSize: 11, color: "#B45309" }}>👨‍🍳 Сотрудник · {b.address?.split(",")[0]}</div>
          </div>
        </div>
      )}

      {/* Табы */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #F0F0F0" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "12px 4px", border: "none", background: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 800,
            color: tab === t.id ? "#16A34A" : "#9CA3AF",
            borderBottom: `2px solid ${tab === t.id ? "#16A34A" : "transparent"}`,
            marginBottom: -2,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Главная */}
      {tab === "overview" && (
        <div style={{ padding: 16 }}>
          {!b.address && (
            <div style={{ background: "#FEF9C3", border: "1px solid #FDE68A", borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#92400E", fontWeight: 700 }}>⚠️ Заполните профиль заведения</span>
              <button onClick={() => setTab("profile")} style={{ background: "#D97706", color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
                Заполнить →
              </button>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, background: "#F0FDF4", borderRadius: 14, padding: 12 }}>
            <div style={{ width: 42, height: 42, background: b.bg_color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{b.emoji}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#111827" }}>{b.name}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{b.type} · {b.address?.split(",")[0]}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              ["📢", deals.length, "Активных акций"],
              ["🛍️", bookings.filter(bk => bk.status === "active").length, "Ожидают выдачи"],
              ["💰", `${bookings.reduce((s, bk) => s + (bk.total_price || 0), 0)} сом`, "Выручка"],
              ["✅", bookings.filter(bk => bk.status === "done").length, "Выдано"],
            ].map(([icon, val, label]) => (
              <div key={label} style={{ background: "#F8F7F4", borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>{val}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>{label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { setTab("deals"); setShowForm(true); }} style={{ width: "100%", padding: "14px", background: "#16A34A", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            + Создать акцию
          </button>
        </div>
      )}

      {/* Акции */}
      {tab === "deals" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827" }}>Акции ({deals.length})</h2>
            <button onClick={() => { setShowForm(!showForm); setFormError(""); }} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {showForm ? "Скрыть" : "+ Создать"}
            </button>
          </div>
          {showForm && (
            <div style={{ background: "#F0FDF4", borderRadius: 14, padding: 14, marginBottom: 14, border: "1px solid #BBF7D0" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#15803D", marginBottom: 12 }}>Новая акция</div>
              {[
                ["Заголовок", "title", "text", 40],
                ["Скидка %", "discount", "number", null],
                ["Категория", "category", "text", null],
                ["Цена ДО (сом)", "priceBefore", "number", null],
                ["Цена ПОСЛЕ (сом)", "priceAfter", "number", null],
                ["Количество штук", "remaining", "number", null],
                ["Время выдачи (19:00–21:00)", "timeWindow", "text", null],
              ].map(([ph, key, type, max]) => (
                <input key={key} type={type} placeholder={ph} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  maxLength={max || undefined}
                  style={{ width: "100%", marginBottom: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid #BBF7D0", fontSize: 13, background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              ))}
              {formError && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 8 }}>{formError}</p>}
              <button onClick={handleCreate} disabled={saving} style={{ width: "100%", padding: "10px", background: saving ? "#9CA3AF" : "#16A34A", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Сохранение..." : "Опубликовать"}
              </button>
            </div>
          )}
          {deals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#9CA3AF" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📢</div>
              <p style={{ fontSize: 14 }}>Нет активных акций</p>
            </div>
          ) : deals.map(deal => (
            <div key={deal.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{deal.title}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>⏰ {deal.time_window} · ост. {deal.remaining} · -{deal.discount}%</div>
                </div>
                <button onClick={() => handleDelete(deal.id)} style={{ background: "#FEF2F2", border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", color: "#DC2626", fontSize: 12, fontWeight: 700 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Брони */}
      {tab === "bookings" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827" }}>Брони</h2>
            <span style={{ fontSize: 12, color: "#6B7280" }}>{bookings.filter(bk => bk.status === "active").length} активных</span>
          </div>
          {bookingsLoading ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF" }}>Загрузка...</div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🛍️</div>
              <p style={{ fontSize: 14 }}>Пока нет броней</p>
            </div>
          ) : bookings.map(bk => (
            <div key={bk.id} style={{ background: "#fff", border: `1px solid ${bk.status === "active" ? "#BBF7D0" : "#E5E7EB"}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{bk.profiles?.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{bk.deals?.title}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginTop: 3 }}>#{bk.code}</div>
                </div>
                <span style={{ background: bk.status === "active" ? "#FEF9C3" : "#DCFCE7", color: bk.status === "active" ? "#92400E" : "#15803D", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                  {bk.status === "active" ? "⏳ Ожидает" : "✓ Выдано"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#6B7280" }}>🕐 {bk.deals?.time_window} · ×{bk.qty} · <strong style={{ color: "#111827" }}>{bk.total_price} сом</strong></span>
                {bk.status === "active" && (
                  <button onClick={() => setConfirmBooking(bk)} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Выдать</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Профиль */}
      {tab === "profile" && (
        <div style={{ padding: 16 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#111827" }}>Профиль заведения</h2>

          <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 4 }}>Название</div>
          <input
            placeholder="Название"
            value={profileForm.name || ""}
            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, marginBottom: 12, boxSizing: "border-box", fontFamily: "inherit" }}
          />

          <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 4 }}>Тип</div>
          <select
            value={profileForm.type || "Пекарня"}
            onChange={e => setProfileForm({ ...profileForm, type: e.target.value })}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, marginBottom: 12, background: "#fff", fontFamily: "inherit" }}
          >
            {["Пекарня", "Кофейня", "Кафе", "Ресторан", "Буфет"].map(t => <option key={t}>{t}</option>)}
          </select>

          <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 4 }}>Район</div>
          <select
            value={profileForm.district || "Центр"}
            onChange={e => setProfileForm({ ...profileForm, district: e.target.value })}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, marginBottom: 12, background: "#fff", fontFamily: "inherit" }}
          >
            {["Центр", "Восток-5", "Джал", "Южные магистрали", "Аламедин", "Асанбай"].map(d => <option key={d}>{d}</option>)}
          </select>

          <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 4 }}>Адрес</div>
          <AddressInput
            value={profileForm.address || ""}
            onChange={v => setProfileForm({ ...profileForm, address: v })}
            onCoords={c => setProfileCoords(c)}
          />

          <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 4, marginTop: 4 }}>Описание</div>
          <textarea
            placeholder="Коротко о заведении"
            value={profileForm.description || ""}
            onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
            rows={3}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, marginBottom: 12, boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }}
          />

          <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 4 }}>WhatsApp</div>
          <input
            placeholder="+996 700 000 000"
            value={profileForm.whatsapp || ""}
            onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, marginBottom: 16, boxSizing: "border-box", fontFamily: "inherit" }}
          />

          {profileError && <p style={{ color: "#DC2626", fontSize: 12, marginBottom: 10 }}>{profileError}</p>}
          {profileSaved && <p style={{ color: "#16A34A", fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Сохранено ✓</p>}

          <button
            onClick={handleSaveProfile}
            disabled={profileSaving}
            style={{ width: "100%", padding: "13px", background: profileSaving ? "#9CA3AF" : "#16A34A", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: profileSaving ? "not-allowed" : "pointer" }}
          >
            {profileSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      )}

      {/* Коды приглашений */}
      {tab === "codes" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827" }}>Коды для сотрудников</h2>
            <button onClick={handleGenCode} style={{ background: "#D97706", color: "#fff", border: "none", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              + Создать
            </button>
          </div>
          <div style={{ background: "#FEF3C7", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#92400E" }}>
            🔑 Сгенерируйте код и отправьте сотруднику ссылку — он регистрируется по одному клику.
          </div>
          {codesLoading ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF" }}>Загрузка...</div>
          ) : codes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: 14 }}>Нет кодов — создайте первый</div>
          ) : codes.map(c => (
            <div key={c.id} style={{ background: "#fff", border: `1px solid ${c.used ? "#E5E7EB" : "#FDE68A"}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: c.used ? 0 : 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", letterSpacing: 3, color: c.used ? "#9CA3AF" : "#111827" }}>{c.code}</span>
                <span style={{ fontSize: 11, fontWeight: 800, background: c.used ? "#F3F4F6" : "#FEF3C7", color: c.used ? "#9CA3AF" : "#92400E", borderRadius: 20, padding: "4px 10px" }}>
                  {c.used ? "Использован" : "Активен"}
                </span>
              </div>
              {!c.used && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://tamakmap.kg/invite/${c.code}`)
                      .then(() => {
                        setCopiedId(c.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      })
                      .catch(() => {});
                  }}
                  style={{ width: "100%", padding: "7px", background: copiedId === c.id ? "#DCFCE7" : "#F3F4F6", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", color: copiedId === c.id ? "#15803D" : "#374151" }}
                >
                  {copiedId === c.id ? "Скопировано ✓" : "Скопировать ссылку"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Фото */}
      {tab === "photos" && (
        <div style={{ padding: 16 }}>

          {/* Для всех точек */}
          <div style={{ background: "#F8F7F4", borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 2 }}>🌐 Для всех точек</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>
              Фото применится ко всем {businesses.length} точк{businesses.length === 1 ? "е" : businesses.length < 5 ? "ам" : "ам"} сразу
            </div>
            <PhotoUploader
              label="📸 Обложка (баннер)"
              hint="800 × 400 px · JPG, PNG · до 3 МБ"
              onSave={(file) => Promise.all(businesses.map(biz => uploadBusinessCover(biz.id, file)))}
            />
            <PhotoUploader
              label="🏷️ Логотип"
              hint="400 × 400 px · JPG, PNG · до 3 МБ"
              aspectSquare
              onSave={(file) => Promise.all(businesses.map(biz => uploadBusinessLogo(biz.id, file)))}
            />
          </div>

          {/* Для отдельной точки */}
          <div style={{ background: "#F8F7F4", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 2 }}>📍 Для отдельной точки</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 10 }}>Загрузите отдельные фото для конкретного заведения</div>

            <button
              onClick={() => setShowBizPicker(p => !p)}
              style={{ width: "100%", padding: "9px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#374151", marginBottom: 10, textAlign: "left" }}
            >
              {pickedBiz ? `✏️ ${pickedBiz.name}` : "Выбрать точку →"}
            </button>

            {showBizPicker && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {businesses.map(biz => (
                  <button key={biz.id} onClick={() => { setPickedBiz(biz); setShowBizPicker(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                      background: pickedBiz?.id === biz.id ? "#F0FDF4" : "#fff",
                      border: `1px solid ${pickedBiz?.id === biz.id ? "#BBF7D0" : "#E5E7EB"}`,
                      borderRadius: 10, cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <div style={{ width: 36, height: 36, background: biz.bg_color, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, overflow: "hidden" }}>
                      {biz.logo_image ? <img src={biz.logo_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : biz.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{biz.name}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{biz.address?.split(",")[0]}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {pickedBiz && !showBizPicker && (
              <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 12, marginTop: 4 }}>
                <PhotoUploader
                  key={`cover-${pickedBiz.id}`}
                  label="📸 Обложка"
                  hint="800 × 400 px · JPG, PNG · до 3 МБ"
                  currentUrl={pickedBiz.cover_image}
                  onSave={(file) => uploadBusinessCover(pickedBiz.id, file)}
                />
                <PhotoUploader
                  key={`logo-${pickedBiz.id}`}
                  label="🏷️ Логотип"
                  hint="400 × 400 px · JPG, PNG · до 3 МБ"
                  aspectSquare
                  currentUrl={pickedBiz.logo_image}
                  onSave={(file) => uploadBusinessLogo(pickedBiz.id, file)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Подтверждение выдачи */}
      {confirmBooking && (
        <div onClick={() => setConfirmBooking(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 6 }}>Подтвердить выдачу?</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>{confirmBooking.profiles?.name} · {confirmBooking.deals?.title}</div>
            </div>
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "12px 16px", marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>КОД КЛИЕНТА</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#16A34A", letterSpacing: 3, fontFamily: "monospace" }}>{confirmBooking.code}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>×{confirmBooking.qty} шт. · {confirmBooking.total_price} сом</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmBooking(null)} style={{ flex: 1, padding: 14, background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                Отмена
              </button>
              <button onClick={() => { handleMarkDone(confirmBooking.id); setConfirmBooking(null); }}
                style={{ flex: 2, padding: 14, background: "#16A34A", color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                Выдать ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Кнопка выхода */}
      <div style={{ padding: "0 16px" }}>
        <button onClick={onLogout} style={{ width: "100%", padding: "12px", marginTop: 8, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Выйти
        </button>
      </div>
    </div>
  );
}
