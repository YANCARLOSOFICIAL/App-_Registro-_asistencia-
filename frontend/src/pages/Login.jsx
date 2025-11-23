import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success(`Bienvenido, ${data.user.name}!`);
        navigate(data.user.role === 'admin' ? '/dashboard' : '/events');
      } else {
        toast.error(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      toast.error('Error de conexión. Verifica tu internet.');
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🔐</div>
        <h2 className="form-title">Iniciar Sesión</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            className="form-input"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Contraseña <span className="required">*</span>
          </label>
          <input
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="form-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div>
              Ingresando...
            </>
          ) : (
            <>
              🚀 Ingresar
            </>
          )}
        </button>
      </form>

      <div className="form-footer">
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-lg)',
          flexWrap: 'wrap'
        }}>
          <Link
            to="/register"
            className="btn btn-primary"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            ✨ Crear cuenta
          </Link>
          <Link
            to="/login-facial"
            className="btn btn-secondary"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            📷 Login facial
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
