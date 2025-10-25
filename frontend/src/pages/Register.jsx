import React, { useState } from 'react';

function Register({ onRegistered, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }
      
      setFaceImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validaciones
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Email inválido');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    if (faceImage) formData.append('faceImage', faceImage);
    
    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('✓ Usuario registrado exitosamente. Redirigiendo...');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFaceImage(null);
        setPreview(null);
        
        setTimeout(() => {
          onRegistered && onRegistered();
        }, 2000);
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    }
    
    setLoading(false);
  };

  return (
    <div className="form-container">
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>✨</div>
        <h2 className="form-title">Crear Cuenta</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Completa tus datos para registrarte
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Nombre completo <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Juan Pérez"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Confirmar contraseña <span className="required">*</span>
          </label>
          <input
            type="password"
            className="form-input"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Foto facial (opcional)
          </label>
          <input
            type="file"
            className="form-input"
            accept="image/*"
            onChange={handleImageChange}
            style={{ padding: '0.5em' }}
          />
          <p style={{ 
            color: 'var(--text-tertiary)', 
            fontSize: 'var(--text-xs)', 
            marginTop: 'var(--spacing-sm)' 
          }}>
            💡 Sube una foto clara de tu rostro para usar el login facial
          </p>
        </div>

        {preview && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--border-color)'
          }}>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: 'var(--text-sm)', 
              marginBottom: 'var(--spacing-sm)' 
            }}>
              Vista previa:
            </p>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--primary)'
              }}
            />
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)', 
          marginTop: 'var(--spacing-lg)' 
        }}>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-outline"
            style={{ flex: 1 }}
            disabled={loading}
          >
            ← Volver
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 2 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div>
                Registrando...
              </>
            ) : (
              <>
                ✨ Crear cuenta
              </>
            )}
          </button>
        </div>
      </form>

      <div className="form-footer">
        <p style={{ margin: 0, color: 'var(--text-tertiary)' }}>
          Al registrarte, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}

export default Register;
