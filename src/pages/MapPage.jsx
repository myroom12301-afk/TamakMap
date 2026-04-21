import DiscBadge from "../components/DiscBadge";

export default function MapPage({ businesses, onBusiness }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      <div style={{ flex: "0 0 58%", position: "relative" }}>
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=74.56,42.855,74.63,42.895&layer=mapnik"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Карта Бишкека"
        />
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>
          📍 {businesses.length} заведений рядом с вами
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "#fff", borderTop: "2px solid #F0F0F0" }}>
        <div style={{ padding: "10px 16px 4px", fontSize: 12, fontWeight: 800, color: "#9CA3AF", letterSpacing: 0.5 }}>РЯДОМ С ВАМИ</div>
        {businesses.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: 14 }}>
            Нет заведений рядом
          </div>
        )}
        {businesses.map(b => (
          <div key={b.id} onClick={() => onBusiness(b)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid #F8F7F4", cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, background: b.bg_color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{b.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{b.name}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{b.deals?.length ?? 0} акций · {b.address.split(",")[0]}</div>
            </div>
            {b.deals?.[0] && <DiscBadge pct={Math.max(...b.deals.map(d => d.discount))} />}
          </div>
        ))}
        <div style={{ height: 56 }} />
      </div>
    </div>
  );
}
