import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { LOGO_URL } from "../constants";
import { useUserBookings } from "../hooks/useUserBookings";
import TimerBadge from "../components/TimerBadge";

export default function ProfilePage({ user, onLogout, onLogin }) {
  const [bookingTab, setBookingTab] = useState("active");
  const { bookings, loading } = useUserBookings(user?.id);

  const activeBookings = bookings.filter(b => b.status === "active");
  const doneBookings   = bookings.filter(b => b.status !== "active");
  const shown = bookingTab === "active" ? activeBookings : doneBookings;

  const totalSaved = bookings.reduce((sum, bk) => {
    const saved = ((bk.deals?.price_before ?? 0) - (bk.deals?.price_after ?? 0)) * bk.qty;
    return sum + saved;
  }, 0);
  const foodSaved = (bookings.length * 0.3).toFixed(1);

  if (!user) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 32, textAlign: "center" }}>
      <img src={LOGO_URL} alt="TamakMap" style={{ width: 90, height: 90, objectFit: "contain", marginBottom: 16, borderRadius: 20 }} />
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>Войдите в TamakMap</h2>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24, lineHeight: 1.6 }}>Бронируйте акции и следите за своей экономией</p>
      <button onClick={onLogin} style={{ background: "#F5920A", color: "#fff", border: "none", borderRadius: 14, padding: "13px 36px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
        Войти / Зарегистрироваться
      </button>
    </div>
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Шапка */}
      <div style={{ background: "linear-gradient(135deg, #FEF3C7, #FFFBEB)", padding: "20px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, background: "#F5920A", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 900 }}>
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>{user.name}</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{user.email}</div>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "14px 16px 0" }}>
        {[
          ["🌱", `${foodSaved} кг`, "еды спасено"],
          ["💰", `${totalSaved} сом`, "сэкономлено"],
          ["🛍️", bookings.length, "броней"],
          ["⭐", bookings.length > 0 ? "4.9" : "—", "надёжность"],
        ].map(([icon, val, label]) => (
          <div key={label} style={{ background: "#F8F7F4", borderRadius: 12, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>{val}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Брони */}
      <div style={{ padding: "16px 16px 8px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>Мои брони</h2>
        <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 10, padding: 3, marginBottom: 12 }}>
          {[["active", `Активные (${activeBookings.length})`], ["done", `История (${doneBookings.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setBookingTab(id)} style={{
              flex: 1, padding: "7px 4px", border: "none", borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontWeight: 800,
              background: bookingTab === id ? "#fff" : "transparent",
              color: bookingTab === id ? "#111827" : "#9CA3AF",
              boxShadow: bookingTab === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#9CA3AF", fontSize: 14 }}>Загрузка...</div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#9CA3AF", fontSize: 14 }}>
            {bookingTab === "active" ? "Нет активных броней" : "История пуста"}
          </div>
        ) : shown.map(bk => (
          <div key={bk.id} style={{ background: "#fff", border: `1px solid ${bk.status === "active" ? "#BBF7D0" : "#E5E7EB"}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>{bk.businesses?.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{bk.businesses?.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{bk.deals?.title}</div>
                </div>
              </div>
              <span style={{ background: bk.status === "active" ? "#DCFCE7" : "#F3F4F6", color: bk.status === "active" ? "#15803D" : "#6B7280", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                {bk.status === "active" ? "✓ Активна" : "Завершена"}
              </span>
            </div>

            {bk.status === "active" && (
              <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>КОД БРОНИРОВАНИЯ</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#16A34A", letterSpacing: 2, fontFamily: "monospace" }}>{bk.code}</div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280" }}>
              <span>🕐 {bk.deals?.time_window}</span>
              <span>× {bk.qty} шт. · <strong style={{ color: "#111827" }}>{bk.total_price} сом</strong></span>
              {bk.status === "active" && bk.minutesLeft > 0 && <TimerBadge mins={bk.minutesLeft} />}
            </div>
          </div>
        ))}
      </div>

      {/* Настройки */}
      <div style={{ padding: "0 16px" }}>
        {[["📍 Мой район", "Центр"], ["🔔 Уведомления", "Включены"], ["🎓 Верификация", "Добавить студ. билет"]].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid #F5F5F3", fontSize: 14 }}>
            <span style={{ color: "#374151" }}>{label}</span>
            <span style={{ color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 }}>{val} <ChevronRight size={13} /></span>
          </div>
        ))}
        <button onClick={onLogout} style={{ width: "100%", padding: "12px", marginTop: 16, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
