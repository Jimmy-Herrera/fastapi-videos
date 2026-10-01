import { useState } from 'react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>{isLogin ? 'Iniciar Sesion' : 'Crear Cuenta'}</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        {!isLogin && <input type="text" placeholder="Nombre completo" style={{ display: 'block', width: '100%', marginBottom: '10px' }} />}
        <input type="email" placeholder="Correo electronico" style={{ display: 'block', width: '100%', marginBottom: '10px' }} />
        <input type="password" placeholder="Contraseña" style={{ display: 'block', width: '100%', marginBottom: '10px' }} />
        <button type="submit">{isLogin ? 'Entrar' : 'Registrarse'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: '10px', background: 'none', border: 'none', color: 'blue' }}>
        {isLogin ? '¿No tienes cuenta? Registrate' : '¿Ya tienes cuenta? Inicia sesion'}
      </button>
    </div>
  );
}
