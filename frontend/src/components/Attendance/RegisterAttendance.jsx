import React, { useState } from 'react';
import API from '../../api';

const RegisterAttendance = () => {
  const [faceImage, setFaceImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (e) => {
    setFaceImage(e.target.files[0]);
  };

  const handleVerifyFace = async () => {
    if (!faceImage) {
      alert('Por favor, carga una imagen del rostro');
      return;
    }

    const formData = new FormData();
    formData.append('faceImage', faceImage);

    try {
      const response = await API.post('/attendance/verify', formData);

      if (response.data.message === 'Asistencia verificada correctamente') {
        setStatusMessage(`✅ Asistencia registrada para: ${response.data.user.name}`);
      } else {
        setStatusMessage('⚠️ Verificación facial fallida. Usuario no encontrado.');
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('❌ Error al verificar asistencia');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-center text-primary mb-4">Registro de Asistencia</h2>
          <form>
            <div className="mb-3">
              <label htmlFor="faceImage" className="form-label">
                Cargar imagen del rostro:
              </label>
              <input
                type="file"
                id="faceImage"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="form-control"
              />
            </div>
            <button
              type="button"
              onClick={handleVerifyFace}
              className="btn btn-primary w-100"
            >
              Registrar Asistencia
            </button>
          </form>
          {statusMessage && (
            <p className="mt-4 text-center alert alert-info">{statusMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterAttendance;
