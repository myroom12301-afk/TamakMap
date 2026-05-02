import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { registerUser, registerOwner, signIn } from "../api/auth";
import AddressInput from "./AddressInput";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #E5E7EB",
  fontSize: 14,
  marginBottom: 10,
  boxSizing: "border-box",
};

export default function AuthModal({ onClose, onLogin, context }) {
  const [step, setStep] = useState("role");
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [biz, setBiz] = useState({ name: "", type: "Пекарня", address: "", district: "Центр", description: "", whatsapp: "", email: "", password: "" });
  const [bizCoords, setBizCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const back = (to = "role") => { setStep(to); setError(""); };

  const handleUserSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Заполните email и пароль"); return; }
    if (mode === "register" && !form.name) { setError("Введите имя"); return; }
    setLoading(true);
    try {
      const userData = mode === "register"
        ? await registerUser({ email: form.email, password: form.password, name: form.name })
        : await signIn({ email: form.email, password: form.password });
      onLogin(userData);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerSubmit = async () => {
    setError("");
    if (!biz.name || !biz.email || !biz.password) { setError("Заполните название, email и пароль"); return; }
    setLoading(true);
    try {
      const userData = await registerOwner({ email: biz.email, password: biz.password, biz, coords: bizCoords });
      onLogin(userData);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", padding: "16px 20px 36px" }}>
        <div style={{ width: 36, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 20px" }} />

        {/* Баннер контекста — показывается когда открыт из брони */}
        {context === "deal" && step === "role" && (
          <div style={{ background: "#FEF3C7", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#92400E", fontWeight: 600 }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <span>Войдите или зарегистрируйтесь, чтобы забронировать акцию</span>
          </div>
        )}

        {/* Выбор роли */}
        {step === "role" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900, color: "#111827" }}>Добро пожаловать</h2>
              <p style={{ margin: 0, fontSize: 14, color: "#6B7280" }}>Выберите тип аккаунта</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["👤", "Пользователь", "Ищу акции и скидки рядом", "user-form", "#F0FDF4", "#BBF7D0"],
                ["🏪", "Заведение / Партнёр", "Хочу продавать остатки со скидкой", "owner-form", "#EFF6FF", "#BFDBFE"],
              ].map(([icon, title, desc, next, bg, border]) => (
                <button key={next} onClick={() => setStep(next)}
                  style={{ padding: 16, background: bg, border: `2px solid ${border}`, borderRadius: 14, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{desc}</div>
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Уже есть аккаунт? </span>
              <button onClick={() => { setStep("login"); setMode("login"); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#16A34A", fontWeight: 800, fontSize: 13 }}>
                Войти
              </button>
            </div>
          </>
        )}

        {/* Вход */}
        {step === "login" && (
          <>
            <button onClick={() => back()} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
              <ArrowLeft size={13} /> Назад
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: "0 0 4px" }}>Вход</h2>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px" }}>В существующий аккаунт</p>
            <input type="email" placeholder="Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            <input type="password" placeholder="Пароль" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ ...inputStyle, marginBottom: 16 }} />
            {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button onClick={handleUserSubmit} disabled={loading}
              style={{ width: "100%", padding: 13, background: loading ? "#9CA3AF" : "#16A34A", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Загрузка..." : "Войти"}
            </button>
          </>
        )}

        {/* Регистрация пользователя */}
        {step === "user-form" && (
          <>
            <button onClick={() => back()} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
              <ArrowLeft size={13} /> Назад
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: "0 0 4px" }}>Регистрация</h2>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px" }}>Аккаунт пользователя</p>
            <input placeholder="Имя / Ник" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input type="email" placeholder="Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            <input type="password" placeholder="Пароль" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ ...inputStyle, marginBottom: 16 }} />
            {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button onClick={handleUserSubmit} disabled={loading}
              style={{ width: "100%", padding: 13, background: loading ? "#9CA3AF" : "#16A34A", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Загрузка..." : "Зарегистрироваться"}
            </button>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Уже есть аккаунт? </span>
              <button onClick={() => { setStep("login"); setMode("login"); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#16A34A", fontWeight: 800, fontSize: 13 }}>
                Войти
              </button>
            </div>
          </>
        )}

        {/* Регистрация заведения */}
        {step === "owner-form" && (
          <>
            <button onClick={() => back()} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
              <ArrowLeft size={13} /> Назад
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: "0 0 4px" }}>Регистрация заведения</h2>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 16px" }}>Станьте партнёром TamakMap</p>
            {[["Название заведения", "name"], ["Описание «О нас»", "description"], ["Номер WhatsApp", "whatsapp"]].map(([ph, key]) => (
              <input key={key} placeholder={ph} value={biz[key]}
                onChange={e => setBiz({ ...biz, [key]: e.target.value })} style={inputStyle} />
            ))}
            <AddressInput
              value={biz.address}
              onChange={v => setBiz({ ...biz, address: v })}
              onCoords={c => setBizCoords(c)}
            />
            <select value={biz.type} onChange={e => setBiz({ ...biz, type: e.target.value })}
              style={{ ...inputStyle, background: "#fff" }}>
              {["Пекарня", "Кофейня", "Кафе", "Ресторан", "Буфет"].map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={biz.district} onChange={e => setBiz({ ...biz, district: e.target.value })}
              style={{ ...inputStyle, marginBottom: 14, background: "#fff" }}>
              {["Центр", "Свердловский", "Ленинский", "Октябрьский", "Первомайский"].map(d => <option key={d}>{d}</option>)}
            </select>
            <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 14, marginBottom: 4 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 10 }}>Данные для входа</p>
              <input type="email" placeholder="Email" value={biz.email}
                onChange={e => setBiz({ ...biz, email: e.target.value })} style={inputStyle} />
              <input type="password" placeholder="Пароль" value={biz.password}
                onChange={e => setBiz({ ...biz, password: e.target.value })}
                style={{ ...inputStyle, marginBottom: 16 }} />
            </div>
            {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button onClick={handleOwnerSubmit} disabled={loading}
              style={{ width: "100%", padding: 13, background: loading ? "#9CA3AF" : "#2563EB", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Загрузка..." : "Зарегистрировать"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}