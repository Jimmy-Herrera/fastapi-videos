import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PlayerPage from './pages/PlayerPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <Router>
      <nav style={{ padding: '15px', background: '#1a1a1a', color: '#fff', display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Inicio</Link>
        <Link to="/auth" style={{ color: '#fff', textDecoration: 'none' }}>Login / Registro</Link>
        <Link to="/profile" style={{ color: '#fff', textDecoration: 'none' }}>Mi Perfil</Link>
      </nav>

      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/video/:id" element={<PlayerPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </Router>
  );
}
