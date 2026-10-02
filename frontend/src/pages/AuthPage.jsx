import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://18.118.49.114:8000";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegister ? `${API_URL}/register` : `${API_URL}/login`;
    const bodyData = isRegister 
      ? { username, email, password }
      : { username, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.detail || 'Ocurrió un error'}`);
        return;
      }

      if (isRegister) {
        alert('Usuario registrado con éxito. Ahora inicia sesión.');
        setIsRegister(false);
      } else {
        localStorage.setItem('token', data.access_token);
        alert('Inicio de sesión exitoso');
        window.location.href = '/';
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor backend');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input 
            type="text" 
            placeholder="Nombre de usuario" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <br />
        {isRegister && (
          <>
            <div>
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <br />
          </>
        )}
        <div>
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <br />
        <button type="submit">{isRegister ? 'Registrarse' : 'Ingresar'}</button>
      </form>
      <br />
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); }}
      >
        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </a>
    </div>
  );
}