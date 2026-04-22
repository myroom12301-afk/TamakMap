import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const GEOAPIFY_KEY = "dfa9d1176a6b4cb1bfc3efdff0ed5cd8";

const pinIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#16A34A;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  className: "",
});

export default function AddressInput({ value, onChange, onCoords }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [coords, setCoords] = useState(null);
  const timer = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setCoords(null);
    onCoords(null);

    clearTimeout(timer.current);
    if (val.length < 3) { setSuggestions([]); setShowSugg(false); return; }

    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(val)}&bias=proximity:74.5698,42.8746&filter=countrycode:kg&lang=ru&limit=5&apiKey=${GEOAPIFY_KEY}`
        );
        const data = await res.json();
        const items = data.features || [];
        setSuggestions(items);
        setShowSugg(items.length > 0);
      } catch {}
    }, 450);
  };

  const select = (item) => {
    const props = item.properties;
    const label = [props.housenumber, props.street, props.city].filter(Boolean).join(", ");
    const c = { lat: props.lat, lng: props.lon };
    onChange(label || props.formatted);
    setCoords(c);
    onCoords(c);
    setSuggestions([]);
    setShowSugg(false);
  };

  return (
    <div style={{ position: "relative", marginBottom: 10 }}>
      <input
        placeholder="Адрес"
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setShowSugg(false), 150)}
        onFocus={() => suggestions.length > 0 && setShowSugg(true)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }}
      />

      {/* Подсказки */}
      {showSugg && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, zIndex: 2000, maxHeight: 180, overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={() => select(s)}
              style={{ padding: "9px 12px", fontSize: 12, cursor: "pointer", borderBottom: i < suggestions.length - 1 ? "1px solid #F3F4F6" : "none", color: "#374151", lineHeight: 1.4 }}
            >
              📍 {s.properties.formatted}
            </div>
          ))}
        </div>
      )}

      {/* Превью карты */}
      {coords && (
        <div style={{ marginTop: 8, borderRadius: 12, overflow: "hidden", border: "1.5px solid #BBF7D0" }}>
          <div style={{ height: 130 }}>
            <MapContainer
              key={`${coords.lat}-${coords.lng}`}
              center={[coords.lat, coords.lng]}
              zoom={17}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[coords.lat, coords.lng]} icon={pinIcon} />
            </MapContainer>
          </div>
          <div style={{ background: "#F0FDF4", padding: "6px 10px", fontSize: 11, color: "#16A34A", fontWeight: 700 }}>
            ✅ Локация найдена — проверьте на карте
          </div>
        </div>
      )}
    </div>
  );
}
