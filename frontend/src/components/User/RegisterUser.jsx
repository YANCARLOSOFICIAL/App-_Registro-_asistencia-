import React, { useState } from 'react';
import API from '../../api';

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [faceImage, setFaceImage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFaceImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataWithFile = new FormData();
    formDataWithFile.append('name', formData.name);
    formDataWithFile.append('email', formData.email);
    formDataWithFile.append('password', formData.password);
    formDataWithFile.append('faceImage', faceImage);

    try {
      const response = await API.post('/users/register', formDataWithFile);
      alert('Usuario registrado con éxito');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      alert('Error al registrar usuario');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-center text-primary mb-4">Registrar Usuario</h2>
          <form onSubmit={handleSubmit}>
            {/* Nombre */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Nombre"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
            {/* Contraseña */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Contraseña"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
            {/* Subir Imagen */}
            <div className="mb-3">
              <label htmlFor="faceImage" className="form-label">
                Subir Imagen de Rostro
              </label>
              <input
                id="faceImage"
                type="file"
                className="form-control"
                onChange={handleFileChange}
                required
              />
            </div>
            {/* Botón de Enviar */}
            <button type="submit" className="btn btn-primary w-100">
              Registrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
