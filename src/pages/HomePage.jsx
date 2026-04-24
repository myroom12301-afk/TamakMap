import { useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, S } from "../constants";
import TimerBadge from "../components/TimerBadge";
import DiscBadge from "../components/DiscBadge";

const catEmoji   = { "Пекарня": "🥐", "Кофейня": "☕", "Кафе": "🍽️", "Ресторан": "🏮", "Буфет": "🥗" };
const catPlural  = { "Пекарня": "Пекарни", "Кофейня": "Кофейни", "Кафе": "Кафе", "Ресторан": "Рестораны", "Буфет": "Буфеты" };

export default function HomePage({ businesses, onBusiness, onDeal }) {
  const [filter, setFilter] = useState("Все");
  const [query, setQuery] = useState("");

  const allDeals = businesses.flatMap(b => b.deals.map(d => ({ ...d, business: b })));
  const urgentDeals = allDeals.filter(d => d.minutesLeft < 60);

  const q = query.trim().toLowerCase();
  const afterSearch = q
    ? businesses.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.deals?.some(d => d.title.toLowerCase().includes(q))
      )
    : businesses;

  const filtered = filter === "Все" ? afterSearch : afterSearch.filter(b => b.type === filter);
  const grouped = {};
  filtered.forEach(b => { if (!grouped[b.type]) grouped[b.type] = []; grouped[b.type].push(b); });

  return (
    <div>
      <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #F5F5F3" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8F7F4", borderRadius: 12, padding: "9px 13px" }}>
          <Search size={15} color="#9CA3AF" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Заведения и акции рядом..."
            style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#111827", outline: "none" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ padding: "10px 16px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", background: "#fff", borderBottom: "1px solid #F5F5F3" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            flexShrink: 0, padding: "6px 15px", borderRadius: 20, fontSize: 13, fontWeight: 700,
            border: "none", cursor: "pointer",
            background: filter === cat ? "#16A34A" : "#F3F4F6",
            color: filter === cat ? "#fff" : "#374151",
          }}>{cat}</button>
        ))}
      </div>

      {urgentDeals.length > 0 && filter === "Все" && (
        <div style={{ margin: "14px 16px 0", background: "#FFFBEB", borderRadius: 14, padding: "12px 14px", border: "1px solid #FDE68A" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E", marginBottom: 8 }}>🔥 Заканчивается скоро</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none" }}>
            {urgentDeals.map(d => (
              <div key={d.id} onClick={() => onDeal(d, d.business)} style={{ flexShrink: 0, background: "#fff", borderRadius: 10, padding: "10px 12px", cursor: "pointer", minWidth: 160, border: "1px solid #FEF3C7" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 2 }}>{d.business.emoji} {d.business.name}</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6, lineHeight: 1.3 }}>{d.title}</div>
                <TimerBadge mins={d.minutesLeft} />
              </div>
            ))}
          </div>
        </div>
      )}

      {businesses.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 32px", color: "#9CA3AF" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
          <p style={{ fontSize: 15, fontWeight: 700 }}>Пока нет заведений</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Скоро здесь появятся акции</p>
        </div>
      )}

      {businesses.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 32px", color: "#9CA3AF" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 15, fontWeight: 700 }}>Ничего не найдено</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Попробуйте другой запрос</p>
        </div>
      )}

      <div style={{ paddingBottom: 80, marginTop: 8 }}>
        {Object.entries(grouped).map(([type, bizList]) => (
          <div key={type} style={{ marginBottom: 6 }}>
            <div style={{ padding: "14px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>{catEmoji[type] || "🍴"} {catPlural[type] || type}</h2>
              <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>{bizList.length}</span>
            </div>
            <div style={{ paddingLeft: 16, paddingRight: 4, display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none" }}>
              {bizList.map(b => (
                <div key={b.id} onClick={() => onBusiness(b)} style={{ ...S.card, flexShrink: 0, width: 155 }}>
                  <div style={{ height: 64, background: b.bg_color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, overflow: "hidden", position: "relative" }}>
                    {b.cover_image
                      ? <img src={b.cover_image} alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : b.logo_image
                        ? <img src={b.logo_image} alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : b.emoji}
                  </div>
                  <div style={{ padding: "8px 10px 10px" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>{b.rating ? `⭐ ${b.rating}` : "Новое"} · {b.deals?.length ?? 0} акц.</div>
                    {b.deals?.[0] && <DiscBadge pct={b.deals[0].discount} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
