import React, { useState } from 'react';
import API from '../../api';

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [faceImage, setFaceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [fail, setFail] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';
    if (!formData.password.trim()) newErrors.password = 'La contraseña es obligatoria';
    if (!faceImage) newErrors.faceImage = 'Debes subir una imagen de rostro';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleFileChange = (e) => {
    setFaceImage(e.target.files[0]);
    setErrors({ ...errors, faceImage: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setFail('');
    if (!validate()) return;
    setLoading(true);
    const formDataWithFile = new FormData();
    formDataWithFile.append('name', formData.name);
    formDataWithFile.append('email', formData.email);
    formDataWithFile.append('password', formData.password);
    formDataWithFile.append('faceImage', faceImage);
    try {
      await API.post('/users/register', formDataWithFile);
      setSuccess('Usuario registrado con éxito');
      setFormData({ name: '', email: '', password: '' });
      setFaceImage(null);
    } catch (error) {
      setFail('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <h2 className="text-2xl font-extrabold text-center mb-7 text-purple-700 tracking-tight drop-shadow-lg">Registrar Usuario</h2>

        {success && (
          <div className="mb-5 p-2 bg-green-100 text-green-700 rounded text-center font-medium shadow animate-fade-in">
            {success}
          </div>
        )}
        {fail && (
          <div className="mb-5 p-2 bg-red-100 text-red-700 rounded text-center font-medium shadow animate-fade-in">
            {fail}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block font-semibold mb-2 text-base text-gray-700">
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Nombre
            </span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Nombre"
            className={`w-full px-4 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50 transition-all duration-200 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name}</span>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block font-semibold mb-2 text-base text-gray-700">
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12A4 4 0 118 12a4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v2m0 0h-4a2 2 0 01-2-2v-2a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2h-4z" /></svg>
              Email
            </span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            className={`w-full px-4 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50 transition-all duration-200 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block font-semibold mb-2 text-base text-gray-700">
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 11V7a5 5 0 00-10 0v4a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2z" /></svg>
              Contraseña
            </span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Contraseña"
            className={`w-full px-4 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50 transition-all duration-200 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <span className="text-red-500 text-sm mt-1 block">{errors.password}</span>}
        </div>

        <div className="mb-6">
          <label htmlFor="faceImage" className="block font-semibold mb-2 text-base text-gray-700">
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 15.232a4 4 0 01-6.464 0M9 10a3 3 0 116 0 3 3 0 01-6 0z" /></svg>
              Imagen de Rostro
            </span>
          </label>
          <input
            id="faceImage"
            type="file"
            className={`w-full px-4 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50 transition-all duration-200 ${errors.faceImage ? 'border-red-400' : 'border-gray-300'}`}
            onChange={handleFileChange}
            required
          />
          {errors.faceImage && <span className="text-red-500 text-sm mt-1 block">{errors.faceImage}</span>}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 via-blue-500 to-blue-400 text-white py-2 rounded-xl font-bold text-base shadow-lg hover:scale-105 hover:from-purple-700 hover:to-blue-500 transition-all duration-200"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;
