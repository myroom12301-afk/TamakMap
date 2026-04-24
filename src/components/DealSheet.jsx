import DiscBadge from "./DiscBadge";
import TimerBadge from "./TimerBadge";

export default function DealSheet({ deal, biz: b, onClose, onBook, isLoggedIn }) {
  if (!deal || !b) return null;
  const saved = deal.price_before - deal.price_after;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400 }}
      />
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, height: "50vh",
        background: "#fff", borderRadius: "20px 20px 0 0",
        zIndex: 401, display: "flex", flexDirection: "column",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.18)",
        animation: "dealSlideUp 0.26s ease-out",
      }}>
        <style>{`
          @keyframes dealSlideUp {
            from { transform: translateX(-50%) translateY(100%); }
            to   { transform: translateX(-50%) translateY(0); }
          }
        `}</style>

        <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto" }} />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 16px" }}>
          {b.cover_image && (
            <div style={{ margin: "-14px -16px 14px", height: 140, overflow: "hidden" }}>
              <img src={b.cover_image} alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, background: b.bg_color, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {b.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{b.name} · {deal.category}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>{deal.title}</div>
            </div>
            <DiscBadge pct={deal.discount} />
          </div>

          <div style={{ background: "#F0FDF4", borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 2 }}>Цена со скидкой</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#16A34A" }}>{deal.price_after} сом</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "line-through" }}>{deal.price_before} сом</div>
                <div style={{ fontSize: 12, color: "#16A34A", fontWeight: 700, marginTop: 2 }}>💰 -{saved} сом</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#374151", flexWrap: "wrap" }}>
              <span>🕐 {deal.time_window}</span>
              <span>📦 Осталось: {deal.remaining}</span>
              <TimerBadge mins={deal.minutesLeft} />
            </div>
          </div>

          <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "9px 12px", marginBottom: 12, fontSize: 12, color: "#1D4ED8", fontWeight: 600 }}>
            📍 {b.address}
          </div>

          <button
            onClick={onBook}
            disabled={deal.remaining === 0}
            style={{
              width: "100%", padding: "13px",
              background: deal.remaining === 0 ? "#9CA3AF" : "#16A34A",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 800,
              cursor: deal.remaining === 0 ? "not-allowed" : "pointer",
            }}
          >
            {deal.remaining === 0 ? "Нет в наличии" : isLoggedIn ? "Забронировать" : "Войти и забронировать"}
          </button>
        </div>
      </div>
    </>
  );
}
