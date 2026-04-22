import { useState, useEffect } from "react";
import { fetchDeals, createDeal, deleteDeal } from "../api/deals";
import { addBusiness } from "../api/businesses";
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
  { id: "codes", label: "Коды" },
];

const STAFF_TABS = [
  { id: "overview", label: "Главная" },
  { id: "deals", label: "Акции" },
  { id: "bookings", label: "Брони" },
];

export default function BizDashboard({ user, onLogout, onBusinessAdded }) {
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

  const [showAddBiz, setShowAddBiz] = useState(false);
  const [bizForm, setBizForm] = useState(emptyBizForm);
  const [bizCoords, setBizCoords] = useState(null);
  const [bizSaving, setBizSaving] = useState(false);
  const [bizError, setBizError] = useState("");

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
              ["🌱", `${(bookings.length * 0.3).toFixed(1)} кг`, "Спасено еды"],
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
                  <button onClick={() => handleMarkDone(bk.id)} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Выдать</button>
                )}
              </div>
            </div>
          ))}
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
            🔑 Передайте код сотруднику — он вводит его при регистрации. Каждый код одноразовый.
          </div>
          {codesLoading ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF" }}>Загрузка...</div>
          ) : codes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: 14 }}>Нет кодов — создайте первый</div>
          ) : codes.map(c => (
            <div key={c.id} style={{ background: "#fff", border: `1px solid ${c.used ? "#E5E7EB" : "#FDE68A"}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", letterSpacing: 3, color: c.used ? "#9CA3AF" : "#111827" }}>{c.code}</span>
              <span style={{ fontSize: 11, fontWeight: 800, background: c.used ? "#F3F4F6" : "#FEF3C7", color: c.used ? "#9CA3AF" : "#92400E", borderRadius: 20, padding: "4px 10px" }}>
                {c.used ? "Использован" : "Активен"}
              </span>
            </div>
          ))}
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
