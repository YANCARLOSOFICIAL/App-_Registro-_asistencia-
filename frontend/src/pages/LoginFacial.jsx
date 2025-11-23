import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function LoginFacial() {
  const navigate = useNavigate();
  const [faceImage, setFaceImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
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

    if (!faceImage) {
      toast.error('Debes seleccionar una imagen');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('faceImage', faceImage);

    try {
      const res = await fetch('http://localhost:5000/api/users/login-facial', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success(`Bienvenido, ${data.user.name}!`);
        navigate(data.user.role === 'admin' ? '/dashboard' : '/events');
      } else {
        toast.error(data.error || 'No se encontró ningún usuario con esta imagen');
      }
    } catch (err) {
      toast.error('Error de conexión. Verifica tu internet.');
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>📷</div>
        <h2 className="form-title">Login Facial</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Sube una foto de tu rostro para ingresar
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Imagen facial <span className="required">*</span>
          </label>
          <input
            type="file"
            className="form-input"
            accept="image/*"
            onChange={handleImageChange}
            required
            style={{ padding: '0.5em' }}
          />
          <p style={{ 
            color: 'var(--text-tertiary)', 
            fontSize: 'var(--text-xs)', 
            marginTop: 'var(--spacing-sm)' 
          }}>
            💡 Asegúrate de que tu rostro sea claramente visible
          </p>
        </div>

        {preview && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 'var(--spacing-lg)',
            padding: 'var(--spacing-lg)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--border-color)'
          }}>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: 'var(--text-sm)', 
              marginBottom: 'var(--spacing-md)' 
            }}>
              Vista previa:
            </p>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '250px',
                maxHeight: '250px',
                borderRadius: 'var(--radius-md)',
                border: '3px solid var(--secondary)',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-lg)'
        }}>
          <Link
            to="/login"
            className="btn btn-outline"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            ← Volver
          </Link>
          <button
            type="submit"
            className="btn btn-secondary"
            style={{ flex: 2 }}
            disabled={loading || !faceImage}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div>
                Verificando...
              </>
            ) : (
              <>
                📷 Ingresar con foto
              </>
            )}
          </button>
        </div>
      </form>

      <div className="form-footer" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ 
            margin: 0, 
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
            lineHeight: 1.6
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>💡 Consejo:</strong>
            <br />
            Para mejores resultados, usa una foto con:
          </p>
          <ul style={{ 
            marginTop: 'var(--spacing-sm)', 
            paddingLeft: 'var(--spacing-lg)',
            color: 'var(--text-tertiary)',
            fontSize: 'var(--text-sm)'
          }}>
            <li>Buena iluminación</li>
            <li>Rostro completamente visible</li>
            <li>Sin accesorios que cubran tu cara</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginFacial;
