import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { S } from "../constants";
import TimerBadge from "../components/TimerBadge";
import DiscBadge from "../components/DiscBadge";

export default function BusinessDetail({ biz: b, onBack, onDeal }) {
  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ position: "relative" }}>
        <div style={{ height: 110, background: b.bg_color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>{b.emoji}</div>
        <button onClick={onBack} style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.92)", border: "none", borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, color: "#374151" }}>
          <ArrowLeft size={13} /> Назад
        </button>
      </div>

      <div style={{ padding: "16px 16px 8px" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 21, fontWeight: 900, color: "#111827" }}>{b.name}</h1>
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 10 }}>⭐ {b.rating} · {b.reviews_count} отзывов · {b.type}</div>
        <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>{b.description}</p>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginBottom: 10 }}>Активные акции ({b.deals?.length ?? 0})</h2>
        {(b.deals ?? []).map(deal => (
          <div key={deal.id} onClick={() => onDeal(deal, b)} style={{ ...S.card, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ flex: 1, marginRight: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 2 }}>{deal.title}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{deal.category}</div>
              </div>
              <DiscBadge pct={deal.discount} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 17, fontWeight: 800, color: "#16A34A" }}>{deal.price_after} сом</span>
                <span style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "line-through", marginLeft: 6 }}>{deal.price_before}</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <TimerBadge mins={deal.minutesLeft} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>ост. {deal.remaining}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: "4px 16px", background: "#F8F7F4", borderRadius: 14, padding: "14px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 10 }}>КОНТАКТЫ</div>
        {[
          [<MapPin size={13} />, b.address],
          [<Phone size={13} />, b.phone],
          ["📸", `Instagram: ${b.instagram}`],
          ["✈️", `Telegram: ${b.telegram}`],
        ].filter(([, val]) => val).map(([icon, text], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginBottom: 6 }}>
            <span style={{ color: "#9CA3AF" }}>{icon}</span>{text}
          </div>
        ))}
      </div>
    </div>
  );
}
