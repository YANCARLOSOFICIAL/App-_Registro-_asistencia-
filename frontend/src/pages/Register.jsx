import React, { useState } from 'react';

function Register({ onRegistered, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
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
        setSuccess('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
        setName(''); setEmail(''); setPassword(''); setFaceImage(null);
        onRegistered && onRegistered();
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error de red');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '2em auto', maxWidth: 400 }}>
      <h2>Registrarse</h2>
      <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
      <input type="file" accept="image/*" onChange={e => setFaceImage(e.target.files[0])} />
      <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
      <button type="button" onClick={onBack} style={{marginLeft:8}}>Volver</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
}

export default Register;
