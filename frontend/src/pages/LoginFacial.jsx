import React, { useState } from 'react';

function LoginFacial({ onLogin, onBack }) {
  const [faceImage, setFaceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!faceImage) {
      setError('Debes seleccionar una imagen');
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
        onLogin && onLogin(data.user);
      } else {
        setError(data.error || 'No coincide ninguna imagen registrada');
      }
    } catch (err) {
      setError('Error de red');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '2em auto', maxWidth: 400 }}>
      <h2>Login con imagen facial</h2>
      <input type="file" accept="image/*" onChange={e => setFaceImage(e.target.files[0])} required />
      <button type="submit" disabled={loading}>{loading ? 'Verificando...' : 'Ingresar'}</button>
      <button type="button" onClick={onBack} style={{marginLeft:8}}>Volver</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default LoginFacial;
