import React, { useState, useEffect } from 'react';

function UserForm({ onUserCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(stored);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }
      
      setFaceImage(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFaceImage(null);
    setPreview(null);
    setRole('user');
    setError('');
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
    
    if (currentUser?.role === 'admin') {
      formData.append('role', role);
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('✓ Usuario creado exitosamente');
        resetForm();
        onUserCreated && onUserCreated(data.user);
        
        setTimeout(() => {
          setSuccess('');
          setShowForm(false);
        }, 3000);
      } else {
        setError(data.error || 'Error al crear usuario');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    }
    
    setLoading(false);
  };

  if (!showForm) {
    return (
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          ➕ Crear nuevo usuario
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>
          ➕ Crear Nuevo Usuario
        </h3>
        <button
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
          className="btn btn-ghost btn-sm"
        >
          ✕ Cerrar
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
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
              placeholder="juan@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
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
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Confirmar contraseña <span className="required">*</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {currentUser?.role === 'admin' && (
          <div className="form-group">
            <label className="form-label">
              🏷️ Rol
            </label>
            <select
              className="form-input"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            📷 Foto facial (opcional)
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
            marginTop: 'var(--spacing-sm)',
            marginBottom: 0
          }}>
            💡 Sube una foto para permitir login facial al usuario
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
                maxWidth: '150px',
                maxHeight: '150px',
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
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            className="btn btn-outline"
            style={{ flex: 1 }}
            disabled={loading}
          >
            Cancelar
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
                Creando...
              </>
            ) : (
              <>
                ➕ Crear usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;
