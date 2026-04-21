import { useState, useEffect } from "react";
import { fetchDeals, createDeal, deleteDeal } from "../api/deals";
import { useBusinessBookings } from "../hooks/useBusinessBookings";
import { markBookingDone } from "../api/bookings";

const emptyForm = { title: "", discount: "", category: "", priceBefore: "", priceAfter: "", remaining: "", timeWindow: "" };

const TABS = [
  { id: "overview", label: "Главная" },
  { id: "deals", label: "Акции" },
  { id: "bookings", label: "Брони" },
  { id: "settings", label: "Профиль" },
];

export default function BizDashboard({ biz: b, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [deals, setDeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { bookings, setBookings, loading: bookingsLoading } = useBusinessBookings(b?.id);

  useEffect(() => {
    if (b?.id) {
      fetchDeals(b.id).then(setDeals).catch(console.error);
    }
  }, [b?.id]);

  if (!b) return (
    <div style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}>
      Нет данных заведения
    </div>
  );

  const handleCreate = async () => {
    if (!form.title || !form.discount || !form.timeWindow) {
      setError("Заполните название, скидку и время выдачи");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const deal = await createDeal(b.id, form);
      setDeals([deal, ...deals]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (e) {
      setError(e.message);
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

  return (
    <div style={{ paddingBottom: 80 }}>
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
              ["🛍️", bookings.filter(b => b.status === "active").length, "Ожидают выдачи"],
              ["💰", `${bookings.reduce((s, b) => s + (b.total_price || 0), 0)} сом`, "Выручка всего"],
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

      {tab === "deals" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827" }}>Акции ({deals.length})</h2>
            <button onClick={() => { setShowForm(!showForm); setError(""); }} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {showForm ? "Скрыть" : "+ Создать"}
            </button>
          </div>

          {showForm && (
            <div style={{ background: "#F0FDF4", borderRadius: 14, padding: 14, marginBottom: 14, border: "1px solid #BBF7D0" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#15803D", marginBottom: 12 }}>Новая акция</div>
              {[
                ["Заголовок (до 40 символов)", "title", "text", 40],
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
                  style={{ width: "100%", marginBottom: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid #BBF7D0", fontSize: 13, background: "#fff", boxSizing: "border-box" }}
                />
              ))}
              {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 8 }}>{error}</p>}
              <button onClick={handleCreate} disabled={saving} style={{ width: "100%", padding: "10px", background: saving ? "#9CA3AF" : "#16A34A", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Сохранение..." : "Опубликовать"}
              </button>
            </div>
          )}

          {deals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#9CA3AF" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📢</div>
              <p style={{ fontSize: 14 }}>Нет активных акций. Создайте первую!</p>
            </div>
          ) : deals.map(deal => (
            <div key={deal.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{deal.title}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>⏰ {deal.time_window} · ост. {deal.remaining} шт. · -{deal.discount}%</div>
                </div>
                <button onClick={() => handleDelete(deal.id)} style={{ background: "#FEF2F2", border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", color: "#DC2626", fontSize: 12, fontWeight: 700 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "bookings" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827" }}>Брони</h2>
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              {bookings.filter(b => b.status === "active").length} активных
            </span>
          </div>

          {bookingsLoading ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: 14 }}>Загрузка...</div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🛍️</div>
              <p>Пока нет броней</p>
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
                <span style={{ fontSize: 12, color: "#6B7280" }}>
                  🕐 {bk.deals?.time_window} · × {bk.qty} шт. · <strong style={{ color: "#111827" }}>{bk.total_price} сом</strong>
                </span>
                {bk.status === "active" && (
                  <button onClick={() => handleMarkDone(bk.id)} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    Выдать
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "settings" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, background: "#F0FDF4", borderRadius: 14, padding: 14 }}>
            <div style={{ width: 48, height: 48, background: b.bg_color, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{b.emoji}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>{b.name}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>⭐ {b.rating ?? 0} · {b.reviews_count ?? 0} отзывов</div>
            </div>
          </div>
          {[["Адрес", b.address], ["Тип", b.type], ["Instagram", b.instagram], ["Telegram", b.telegram], ["Телефон", b.phone]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F5F5F3", fontSize: 13 }}>
              <span style={{ color: "#9CA3AF", fontWeight: 700 }}>{k}</span>
              <span style={{ color: "#374151" }}>{v}</span>
            </div>
          ))}
          <button onClick={onLogout} style={{ width: "100%", padding: "12px", marginTop: 16, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
