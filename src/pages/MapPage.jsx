import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DiscBadge from "../components/DiscBadge";

const BISHKEK = [42.8746, 74.5698];

function createEmojiMarker(emoji, hasDeals) {
  return L.divIcon({
    html: `
      <div style="
        width:44px; height:44px; border-radius:50%;
        background:#fff; border:3px solid ${hasDeals ? "#F59E0B" : "#E5E7EB"};
        display:flex; align-items:center; justify-content:center;
        font-size:22px; box-shadow:0 2px 8px rgba(0,0,0,0.25);
        cursor:pointer;
      ">${emoji}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
    className: "",
  });
}

function FitBounds({ businesses }) {
  const map = useMap();
  useEffect(() => {
    if (businesses.length === 0) return;
    const valid = businesses.filter(b => b.lat && b.lng);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 15);
    } else {
      const bounds = L.latLngBounds(valid.map(b => [b.lat, b.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [businesses, map]);
  return null;
}

export default function MapPage({ businesses, onBusiness }) {
  const withCoords = businesses.filter(b => b.lat && b.lng);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 112px)" }}>

      {/* Карта сверху */}
      <div style={{ flex: "0 0 55%", position: "relative", padding: "12px 12px 0", background: "#fff" }}>
        <MapContainer
          center={BISHKEK}
          zoom={13}
          style={{ width: "100%", height: "100%", borderRadius: 16, border: "1.5px solid #E5E7EB", overflow: "hidden" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <FitBounds businesses={withCoords} />
          {withCoords.map(b => (
            <Marker
              key={b.id}
              position={[b.lat, b.lng]}
              icon={createEmojiMarker(b.emoji, b.deals?.length > 0)}
            >
              <Popup>
                <div style={{ minWidth: 140, fontFamily: "Nunito, sans-serif" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>{b.type}</div>
                  {b.deals?.length > 0 && (
                    <div style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>
                      {b.deals.length} акц. · до -{Math.max(...b.deals.map(d => d.discount))}%
                    </div>
                  )}
                  <button
                    onClick={() => onBusiness(b)}
                    style={{ marginTop: 8, width: "100%", padding: "5px", background: "#16A34A", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Подробнее
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#374151", whiteSpace: "nowrap", zIndex: 999, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          📍 {businesses.length} заведений рядом с вами
        </div>
      </div>

      {/* Разделитель */}
      <div style={{ background: "#fff", padding: "10px 12px", flexShrink: 0 }}>
        <div style={{ height: 1, background: "#D1D5DB" }} />
      </div>

      {/* Список снизу */}
      <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
        <div style={{ padding: "10px 16px 4px", fontSize: 12, fontWeight: 800, color: "#9CA3AF", letterSpacing: 0.5 }}>
          РЯДОМ С ВАМИ
        </div>
        {businesses.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: 14 }}>
            Нет заведений рядом
          </div>
        )}
        {businesses.map(b => (
          <div key={b.id} onClick={() => onBusiness(b)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid #F8F7F4", cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, background: b.bg_color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {b.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{b.name}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                {b.deals?.length ?? 0} акций · {b.address?.split(",")[0]}
              </div>
            </div>
            {b.deals?.length > 0 && (
              <DiscBadge pct={Math.max(...b.deals.map(d => d.discount))} />
            )}
          </div>
        ))}
        <div style={{ height: 56 }} />
      </div>
    </div>
  );
}
