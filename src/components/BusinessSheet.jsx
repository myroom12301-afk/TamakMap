import { MapPin, Phone } from "lucide-react";
import DiscBadge from "./DiscBadge";
import TimerBadge from "./TimerBadge";
import { S } from "../constants";

export default function BusinessSheet({ biz: b, onClose, onDeal }) {
  if (!b) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 500 }}
      />

      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, height: "62vh",
        background: "#fff", borderRadius: "20px 20px 0 0",
        zIndex: 501, display: "flex", flexDirection: "column",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
        animation: "slideUp 0.28s ease-out",
      }}>
        <style>{`
          @keyframes slideUp {
            from { transform: translateX(-50%) translateY(100%); }
            to   { transform: translateX(-50%) translateY(0); }
          }
        `}</style>

        {/* Handle */}
        <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto" }} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 24px" }}>

          {/* Шапка заведения */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 56, height: 56, background: b.bg_color, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
              {b.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>{b.name}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>⭐ {b.rating ?? 0} · {b.reviews_count ?? 0} отзывов · {b.type}</div>
              {b.description && (
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2, lineHeight: 1.4 }}>{b.description}</div>
              )}
            </div>
          </div>

          {/* Акции */}
          {(b.deals?.length ?? 0) > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
                Активные акции ({b.deals.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {b.deals.map(deal => (
                  <div key={deal.id} onClick={() => { onClose(); onDeal(deal, b); }}
                    style={{ ...S.card, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ flex: 1, marginRight: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 1 }}>{deal.title}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{deal.category}</div>
                      </div>
                      <DiscBadge pct={deal.discount} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#16A34A" }}>{deal.price_after} сом</span>
                        <span style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "line-through", marginLeft: 5 }}>{deal.price_before}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <TimerBadge mins={deal.minutesLeft} />
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>ост. {deal.remaining}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {(b.deals?.length ?? 0) === 0 && (
            <div style={{ textAlign: "center", padding: "16px 0", color: "#9CA3AF", fontSize: 13 }}>
              Нет активных акций
            </div>
          )}

          {/* Контакты */}
          <div style={{ background: "#F8F7F4", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#374151", marginBottom: 8 }}>КОНТАКТЫ</div>
            {[
              [<MapPin size={12} />, b.address],
              [<Phone size={12} />, b.phone],
              ["📸", b.instagram ? `Instagram: ${b.instagram}` : null],
              ["✈️", b.telegram ? `Telegram: ${b.telegram}` : null],
            ].filter(([, val]) => val).map(([icon, text], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151", marginBottom: 5 }}>
                <span style={{ color: "#9CA3AF" }}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
