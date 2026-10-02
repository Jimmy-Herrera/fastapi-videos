import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "register") await api.register(f);
      const r = await api.login({ email: f.email, password: f.password });
      login(r.access_token, r.user);
      nav("/");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth" onSubmit={submit}>
      <h1>{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h1>
      <p className="muted">
        {mode === "login" ? "para subir videos y comentar" : "solo necesitas nombre, correo y contraseña"}
      </p>
      {mode === "register" && (
        <label>Nombre
          <input name="name" value={f.name} onChange={set} required maxLength={100} autoComplete="name" />
        </label>
      )}
      <label>Correo
        <input name="email" type="email" value={f.email} onChange={set} required autoComplete="email" />
      </label>
      <label>Contraseña
        <input
          name="password" type="password" value={f.password} onChange={set} required
          minLength={6} maxLength={72} placeholder="Mínimo 6 caracteres"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>
      {err && <p className="error">{err}</p>}
      <div className="row between">
        <button type="button" className="link" onClick={() => { setErr(""); setMode(mode === "login" ? "register" : "login"); }}>
          {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
        </button>
        <button className="pill" disabled={loading}>
          {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Registrarme"}
        </button>
      </div>
    </form>
  );
}
