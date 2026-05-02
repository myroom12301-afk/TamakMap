import { useState } from "react";
import { registerStaff } from "../api/auth";

export default function InvitePage({ code }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Заполните все поля");
      return;
    }
    if (form.password.length < 6) {
      setError("Пароль минимум 6 символов");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await registerStaff({ ...form, inviteCode: code });
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 320 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#111827", marginBottom: 8 }}>Готово!</div>
        <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
          Аккаунт создан. Войдите в TamakMap с вашим email и паролем.
        </div>
        <a
          href="/"
          style={{ display: "block", padding: "14px", background: "#16A34A", color: "#fff", borderRadius: 14, fontSize: 15, fontWeight: 800, textDecoration: "none" }}
        >
          Открыть TamakMap
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🍽️</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#111827", marginBottom: 4 }}>Регистрация сотрудника</div>
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>Код приглашения: <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#374151" }}>{code}</span></div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          {[
            ["Ваше имя", "name", "text"],
            ["Email", "email", "email"],
            ["Пароль", "password", "password"],
          ].map(([placeholder, key, type]) => (
            <input
              key={key}
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, marginBottom: 12, boxSizing: "border-box", fontFamily: "inherit" }}
            />
          ))}

          {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", padding: "13px", background: loading ? "#9CA3AF" : "#16A34A", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </div>
      </div>
    </div>
  );
}
