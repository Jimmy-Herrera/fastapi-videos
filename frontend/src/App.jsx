import { useState } from "react";
import { HashRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth.jsx";
import Avatar from "./components/Avatar.jsx";
import Auth from "./pages/Auth.jsx";
import Home from "./pages/Home.jsx";
import Watch from "./pages/Watch.jsx";
import Profile from "./pages/Profile.jsx";

function Private({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

function Logo() {
  return (
    <Link to="/" className="brand">
      <svg width="30" height="21" viewBox="0 0 30 21" aria-hidden="true">
        <rect width="30" height="21" rx="6" fill="#d9251d" />
        <path d="M12 6l8 4.5-8 4.5z" fill="#fff" />
      </svg>
      <span>Videoteca</span>
    </Link>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const nav = useNavigate();

  function search(e) {
    e.preventDefault();
    nav(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
  }

  return (
    <header className="nav">
      <Logo />
      <form className="search" onSubmit={search}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" aria-label="Buscar videos" />
        <button aria-label="Buscar">Buscar</button>
      </form>
      <nav>
        {user ? (
          <>
            <Link to={`/profile/${user.id}`} className="pill">+ Subir video</Link>
            <Link to={`/profile/${user.id}`} title={user.name}><Avatar name={user.name} id={user.id} size={34} /></Link>
            <button className="link" onClick={logout}>Salir</button>
          </>
        ) : (
          <Link to="/auth" className="pill outline">Iniciar sesión</Link>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/profile/:id" element={<Private><Profile /></Private>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </HashRouter>
    </AuthProvider>
  );
}
