import { ArrowLeft } from "lucide-react";
import { fmtTime } from "../utils";
import DiscBadge from "../components/DiscBadge";
import TimerBadge from "../components/TimerBadge";

export default function DealDetail({ deal, biz: b, onBack, onBook, isLoggedIn }) {
  const saved = deal.price_before - deal.price_after;

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ position: "relative", height: 130, background: b.bg_color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>
        {b.emoji}
        <button onClick={onBack} style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.92)", border: "none", borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, color: "#374151" }}>
          <ArrowLeft size={13} /> Назад
        </button>
      </div>

      <div style={{ padding: "20px 16px" }}>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>{b.name} · {deal.category}</div>
        <h1 style={{ margin: "0 0 10px", fontSize: 21, fontWeight: 900, color: "#111827" }}>{deal.title}</h1>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, margin: "0 0 16px" }}>{deal.description}</p>

        <div style={{ background: "#F0FDF4", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>Цена со скидкой</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#16A34A" }}>{deal.price_after} сом</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "line-through", marginBottom: 4 }}>{deal.price_before} сом</div>
              <DiscBadge pct={deal.discount} />
            </div>
          </div>
          <div style={{ borderTop: "1px solid #BBF7D0", paddingTop: 8, fontSize: 13, color: "#15803D", fontWeight: 700 }}>
            💰 Вы экономите {saved} сом
          </div>
        </div>

        <div style={{ background: "#F8F7F4", borderRadius: 14, padding: "14px", marginBottom: 14 }}>
          {[
            ["🕐 Время выдачи", deal.time_window],
            ["📦 Осталось", `${deal.remaining} из ${deal.total}`],
            ["⏱ Истекает", `через ${fmtTime(deal.minutesLeft)}`],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #EBEBEB", fontSize: 13 }}>
              <span style={{ color: "#6B7280" }}>{label}</span>
              <span style={{ fontWeight: 700, color: "#111827" }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "#1D4ED8", fontWeight: 600 }}>
          📍 Самовывоз: {b.address}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 56, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, padding: "10px 16px", background: "rgba(255,255,255,0.97)", borderTop: "1px solid #F0F0F0" }}>
        <button onClick={onBook} style={{
          width: "100%", padding: "14px",
          background: deal.remaining === 0 ? "#9CA3AF" : "#16A34A",
          color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800,
          cursor: deal.remaining === 0 ? "not-allowed" : "pointer",
        }}>
          {deal.remaining === 0 ? "Нет в наличии" : isLoggedIn ? "Забронировать" : "Войти и забронировать"}
        </button>
      </div>
    </div>
  );
}
