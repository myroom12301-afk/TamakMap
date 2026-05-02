import { useState } from "react";

function generateCode() {
  return `TM-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function BookingModal({ deal, biz: b, user, onClose, onBooked }) {
  const [qty, setQty] = useState(1);
  const [booking, setBooking] = useState(null);

  const handleConfirm = () => {
    // Генерируем код локально
    const code = generateCode();
    // Показываем подтверждение
    setBooking({ code, qty });
    // Уменьшаем remaining в App.js
    if (onBooked) onBooked(qty);
  };

  if (booking) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: "32px 24px 44px", textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>Забронировано!</h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 16px" }}>
          Ваш код для получения в <strong>{b.name}</strong>
        </p>
        <div style={{ background: "#F0FDF4", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>КОД БРОНИРОВАНИЯ</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#16A34A", letterSpacing: 2, fontFamily: "monospace" }}>{booking.code}</div>
        </div>
        <div style={{ background: "#F8F7F4", borderRadius: 12, padding: "12px", marginBottom: 20, fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
          🕐 Придите с <strong>{deal.time_window}</strong><br />
          📍 {b.address?.split(",")[0] || "Адрес"}<br />
          💰 Оплата наличкой: <strong>{deal.price_after * qty} сом</strong>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 14, background: "#16A34A", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
          Отлично!
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: "16px 20px 40px" }}>
        <div style={{ width: 36, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 20px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: "0 0 4px" }}>Бронирование</h2>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px" }}>{deal.title} · {b.name}</p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 14, color: "#374151", fontWeight: 700 }}>Количество</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid #E5E7EB", background: "#F8F7F4", cursor: "pointer", fontSize: 20, fontWeight: 300 }}>−</button>
            <span style={{ fontSize: 18, fontWeight: 900, minWidth: 20, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty(Math.min(deal.remaining, qty + 1))} style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid #E5E7EB", background: "#F8F7F4", cursor: "pointer", fontSize: 20, fontWeight: 300 }}>+</button>
          </div>
        </div>

        <div style={{ background: "#F8F7F4", borderRadius: 12, padding: 12, marginBottom: 16 }}>
          {[
            ["Итого", `${deal.price_after * qty} сом`],
            ["Экономия", `${(deal.price_before - deal.price_after) * qty} сом`],
            ["Время получения", deal.time_window],
            ["Адрес", b.address?.split(",")[0] || "Адрес"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
              <span style={{ color: "#6B7280" }}>{k}</span>
              <span style={{ fontWeight: 700, color: k === "Экономия" ? "#16A34A" : "#111827" }}>{v}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", margin: "0 0 12px" }}>
          Оплата наличкой при получении. Бесплатная отмена за 2 часа.
        </p>
        <button onClick={handleConfirm} style={{ width: "100%", padding: 13, background: "#16A34A", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
          Подтвердить бронь
        </button>
      </div>
    </div>
  );
}