import { useState } from "react";
import { submitReview } from "../api/reviews";

export default function ReviewModal({ booking, user, onClose, onDone }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const biz = booking.businesses;

  const handleSubmit = async () => {
    if (!rating) { setError("Поставьте оценку"); return; }
    setSaving(true);
    setError("");
    try {
      await submitReview({
        bookingId: booking.id,
        businessId: booking.business_id,
        userId: user.id,
        rating,
        comment,
      });
      onDone(booking.id, rating);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480 }}>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{biz?.emoji}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>
            Как вам поход в {biz?.name}?
          </div>
          <div style={{ fontSize: 13, color: "#6B7280" }}>{booking.deals?.title}</div>
        </div>

        {/* Звёзды */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              style={{ fontSize: 38, cursor: "pointer", transition: "transform 0.1s", transform: (hovered || rating) >= n ? "scale(1.2)" : "scale(1)", userSelect: "none" }}
            >
              {(hovered || rating) >= n ? "⭐" : "☆"}
            </span>
          ))}
        </div>

        {rating > 0 && (
          <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: "#F5920A", marginBottom: 14 }}>
            {["", "Плохо 😞", "Так себе 😐", "Нормально 🙂", "Хорошо 😊", "Отлично! 🔥"][rating]}
          </div>
        )}

        {/* Комментарий */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Расскажите подробнее (необязательно)..."
          maxLength={300}
          rows={3}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", resize: "none", boxSizing: "border-box", outline: "none", marginBottom: 4, color: "#374151" }}
        />
        <div style={{ fontSize: 11, color: "#D1D5DB", textAlign: "right", marginBottom: 14 }}>{comment.length}/300</div>

        {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 10, textAlign: "center" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 13, background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            Позже
          </button>
          <button onClick={handleSubmit} disabled={saving || !rating} style={{
            flex: 2, padding: 13, border: "none", borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: saving || !rating ? "not-allowed" : "pointer",
            background: !rating ? "#E5E7EB" : saving ? "#9CA3AF" : "#F5920A",
            color: !rating ? "#9CA3AF" : "#fff",
          }}>
            {saving ? "Отправка..." : "Отправить отзыв"}
          </button>
        </div>
      </div>
    </div>
  );
}
