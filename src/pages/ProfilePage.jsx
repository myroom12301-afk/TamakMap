import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { LOGO_URL } from "../constants";
import { useUserBookings } from "../hooks/useUserBookings";
import TimerBadge from "../components/TimerBadge";
import ReviewModal from "../components/ReviewModal";

export default function ProfilePage({ user, onLogout, onLogin }) {
  const [bookingTab, setBookingTab] = useState("active");
  const [comingSoon, setComingSoon] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewedIds, setReviewedIds] = useState({}); // { bookingId: rating }
  const { bookings, loading } = useUserBookings(user?.id);

  const activeBookings = bookings.filter(b => b.status === "active");
  const doneBookings   = bookings.filter(b => b.status !== "active");
  const shown = bookingTab === "active" ? activeBookings : doneBookings;

  const pendingReviews = doneBookings.filter(bk =>
    !reviewedIds[bk.id] && !(bk.reviews?.length > 0)
  );

  const totalSaved = bookings.reduce((sum, bk) => {
    const saved = ((bk.deals?.price_before ?? 0) - (bk.deals?.price_after ?? 0)) * bk.qty;
    return sum + saved;
  }, 0);

  if (!user) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 32, textAlign: "center" }}>
      <img src={LOGO_URL} alt="TamakMap" style={{ width: 90, height: 90, objectFit: "contain", marginBottom: 16, borderRadius: 20 }} />
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>Войдите в TamakMap</h2>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24, lineHeight: 1.6 }}>Бронируйте акции и следите за своей экономией</p>
      <button onClick={onLogin} style={{ background: "#F5920A", color: "#fff", border: "none", borderRadius: 14, padding: "13px 36px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
        Войти / Зарегистрироваться
      </button>
    </div>
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Шапка */}
      <div style={{ background: "linear-gradient(135deg, #FEF3C7, #FFFBEB)", padding: "20px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, background: "#F5920A", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 900 }}>
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>{user.name}</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{user.email}</div>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div style={{ padding: "14px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["🛍️", bookings.length, "броней"],
            ["⭐", bookings.length > 0 ? "4.9" : "—", "надёжность"],
          ].map(([icon, val, label]) => (
            <div key={label} style={{ background: "#F8F7F4", borderRadius: 12, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#F0FDF4", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>💰</span>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>сэкономлено</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#16A34A" }}>{totalSaved} сом</div>
            </div>
          </div>
          {totalSaved > 0 && (
            <div style={{ fontSize: 11, color: "#16A34A", fontWeight: 700, background: "#DCFCE7", borderRadius: 8, padding: "4px 10px" }}>
              за {bookings.length} бро{bookings.length === 1 ? "нь" : "ней"}
            </div>
          )}
        </div>
      </div>

      {/* Баннер ожидающих отзывов */}
      {pendingReviews.length > 0 && (
        <div onClick={() => { setBookingTab("done"); setReviewBooking(pendingReviews[0]); }}
          style={{ margin: "12px 16px 0", background: "linear-gradient(135deg, #FEF3C7, #FFFBEB)", border: "1.5px solid #FDE68A", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <div style={{ fontSize: 28 }}>⭐</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#92400E" }}>
              {pendingReviews.length === 1 ? "Оставьте отзыв!" : `${pendingReviews.length} отзыва ждут вас!`}
            </div>
            <div style={{ fontSize: 12, color: "#B45309" }}>
              Ваш опыт в {pendingReviews[0].businesses?.name} поможет другим
            </div>
          </div>
          <ChevronRight size={16} color="#B45309" />
        </div>
      )}

      {/* Брони */}
      <div style={{ padding: "16px 16px 8px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>Мои брони</h2>
        <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 10, padding: 3, marginBottom: 12 }}>
          {[["active", `Активные (${activeBookings.length})`], ["done", `История (${doneBookings.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setBookingTab(id)} style={{
              flex: 1, padding: "7px 4px", border: "none", borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontWeight: 800,
              background: bookingTab === id ? "#fff" : "transparent",
              color: bookingTab === id ? "#111827" : "#9CA3AF",
              boxShadow: bookingTab === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#9CA3AF", fontSize: 14 }}>Загрузка...</div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#9CA3AF", fontSize: 14 }}>
            {bookingTab === "active" ? "Нет активных броней" : "История пуста"}
          </div>
        ) : shown.map(bk => (
          <div key={bk.id} style={{ background: "#fff", border: `1px solid ${bk.status === "active" ? "#BBF7D0" : "#E5E7EB"}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>{bk.businesses?.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{bk.businesses?.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{bk.deals?.title}</div>
                </div>
              </div>
              <span style={{ background: bk.status === "active" ? "#DCFCE7" : "#F3F4F6", color: bk.status === "active" ? "#15803D" : "#6B7280", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                {bk.status === "active" ? "✓ Активна" : "Завершена"}
              </span>
            </div>

            {bk.status === "active" && (
              <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>КОД БРОНИРОВАНИЯ</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#16A34A", letterSpacing: 2, fontFamily: "monospace" }}>{bk.code}</div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280" }}>
              <span>🕐 {bk.deals?.time_window}</span>
              <span>× {bk.qty} шт. · <strong style={{ color: "#111827" }}>{bk.total_price} сом</strong></span>
              {bk.status === "active" && bk.minutesLeft > 0 && <TimerBadge mins={bk.minutesLeft} />}
            </div>

            {/* Отзыв для завершённых броней */}
            {bk.status !== "active" && (() => {
              const existingRating = reviewedIds[bk.id] ?? bk.reviews?.[0]?.rating;
              if (existingRating) return (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, background: "#FFFBEB", borderRadius: 8, padding: "6px 10px" }}>
                  <span style={{ fontSize: 13 }}>{"⭐".repeat(existingRating)}{"☆".repeat(5 - existingRating)}</span>
                  <span style={{ fontSize: 11, color: "#92400E", fontWeight: 700 }}>Ваш отзыв</span>
                </div>
              );
              return (
                <button onClick={() => setReviewBooking(bk)}
                  style={{ marginTop: 10, width: "100%", padding: "7px", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 8, fontSize: 12, fontWeight: 800, color: "#92400E", cursor: "pointer" }}>
                  ⭐ Оставить отзыв
                </button>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Настройки */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#9CA3AF", letterSpacing: 0.5, padding: "12px 0 6px" }}>НАСТРОЙКИ</div>

        {/* Уведомления */}
        <div onClick={() => setComingSoon("notifications")}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid #F5F5F3", cursor: "pointer" }}>
          <div style={{ width: 38, height: 38, background: "#EFF6FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            🔔
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>Уведомления</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>Push-уведомления об акциях</div>
          </div>
          <span style={{ fontSize: 10, background: "#EFF6FF", color: "#1D4ED8", borderRadius: 6, padding: "2px 7px", fontWeight: 800 }}>СКОРО</span>
        </div>

        {/* Верификация — объединённая */}
        <div onClick={() => setComingSoon("verification")}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid #F5F5F3", cursor: "pointer" }}>
          <div style={{ width: 38, height: 38, background: "#FEF3C7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            🎓
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>Верификация</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>Студенческий билет · Пенсионная карта</div>
          </div>
          <span style={{ fontSize: 10, background: "#FEF3C7", color: "#92400E", borderRadius: 6, padding: "2px 7px", fontWeight: 800 }}>СКОРО</span>
        </div>
        <div onClick={() => setShowAbout(true)}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid #F5F5F3", cursor: "pointer" }}>
          <div style={{ width: 38, height: 38, background: "#F3F4F6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            ℹ️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>О приложении</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>Версия, контакты, политика</div>
          </div>
          <ChevronRight size={14} color="#9CA3AF" />
        </div>

        <button onClick={onLogout} style={{ width: "100%", padding: "12px", marginTop: 16, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Выйти из аккаунта
        </button>
      </div>

      {/* Модал отзыва */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          user={user}
          onClose={() => setReviewBooking(null)}
          onDone={(id, rating) => {
            setReviewedIds(prev => ({ ...prev, [id]: rating }));
            setReviewBooking(null);
          }}
        />
      )}

      {/* О приложении */}
      {showAbout && (
        <div onClick={() => setShowAbout(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <img src="/logo.png" alt="TamakMap" style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 18, marginBottom: 10 }} />
              <div style={{ fontSize: 22, fontWeight: 900, color: "#111827" }}>TamakMap</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Версия 0.1.0 Beta</div>
            </div>

            {[
              { icon: "🍜", title: "Что такое TamakMap?", text: "TamakMap — приложение, которое помогает находить акции и скидки в кафе и ресторанах Бишкека. Бронируйте выгодные предложения в пару кликов и экономьте на каждом приёме пищи." },
              { icon: "📍", title: "Как это работает?", text: "Заведения публикуют ограниченные по времени акции. Вы бронируете нужное количество порций, получаете код — и просто показываете его на кассе. Всё честно и прозрачно." },
              { icon: "🔒", title: "Безопасность данных", text: "Мы не передаём ваши личные данные третьим лицам. Вся информация хранится в зашифрованном виде. Используем Supabase — облачная база данных с защитой уровня enterprise." },
              { icon: "📬", title: "Связаться с нами", text: "По вопросам сотрудничества, техподдержки или предложениям пишите: support@tamakmap.kg" },
              { icon: "📄", title: "Политика конфиденциальности", text: "Используя приложение, вы соглашаетесь с условиями обработки персональных данных в соответствии с законодательством Кыргызской Республики." },
            ].map(({ icon, title, text }) => (
              <div key={title} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#111827", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{icon}</span>{title}
                </div>
                <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.65 }}>{text}</div>
              </div>
            ))}

            <div style={{ textAlign: "center", fontSize: 12, color: "#D1D5DB", marginTop: 8 }}>
              © 2024–2025 TamakMap. Все права защищены.
            </div>

            <button onClick={() => setShowAbout(false)} style={{ width: "100%", padding: 13, background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: "pointer", marginTop: 20 }}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Coming Soon попап */}
      {comingSoon && (() => {
        const cfg = {
          verification: { icon: "🎓", title: "Верификация", sub: "Студенческий билет и пенсионная карта", accent: "#F5920A", bg: "linear-gradient(135deg,#FEF3C7,#FFFBEB)", border: "#FDE68A", textColor: "#78350F", bonusText: "Все, кто зарегистрирует документы в день запуска функции — получат эксклюзивные скидки и привилегии на весь срок использования." },
          notifications: { icon: "🔔", title: "Уведомления", sub: "Push-уведомления об акциях рядом", accent: "#2563EB", bg: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", border: "#BFDBFE", textColor: "#1E3A8A", bonusText: "Включите уведомления в день запуска — и вы первыми узнаете о горящих акциях в вашем районе." },
        }[comingSoon];
        return (
          <div onClick={() => setComingSoon(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{cfg.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#111827", marginBottom: 4 }}>{cfg.title}</div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>{cfg.sub}</div>
              </div>
              <div style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: cfg.textColor, marginBottom: 6 }}>🎁 Бонус первым!</div>
                <div style={{ fontSize: 13, color: cfg.textColor, lineHeight: 1.6 }}>{cfg.bonusText}</div>
              </div>
              <button onClick={() => setComingSoon(null)} style={{ width: "100%", padding: 14, background: cfg.accent, color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                Буду первым! 🔥
              </button>
              <button onClick={() => setComingSoon(null)} style={{ width: "100%", padding: 10, background: "none", color: "#9CA3AF", border: "none", fontSize: 13, cursor: "pointer", marginTop: 4 }}>
                Закрыть
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
