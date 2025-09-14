import React, { useEffect, useState } from 'react';

function Attendance() {
  const [faceImage, setFaceImage] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError("");
    setVerifySuccess("");
    // Validación
    if (!faceImage || !faceImage.type.startsWith("image/")) {
      setVerifyError("Debes seleccionar una imagen válida");
      setVerifying(false);
      return;
    }
    const formData = new FormData();
    formData.append("faceImage", faceImage);
    try {
      const res = await fetch("http://localhost:5000/api/attendance/verify", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setVerifySuccess(data.message || "Asistencia verificada correctamente");
      } else {
        setVerifyError(data.message || "Error al verificar asistencia");
      }
    } catch (err) {
      setVerifyError("Error de red");
    }
    setVerifying(false);
  };
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch('http://localhost:5000/api/attendance')
      .then(res => res.json())
      .then(data => {
        setAttendance(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>Asistencias</h2>
      <form onSubmit={handleVerify} style={{ marginBottom: 20 }}>
        <input type="file" accept="image/*" onChange={e => setFaceImage(e.target.files[0])} required />
        <button type="submit" disabled={verifying}>Registrar Asistencia Facial</button>
        {verifyError && <p style={{color:'red'}}>{verifyError}</p>}
        {verifySuccess && <p style={{color:'green'}}>{verifySuccess}</p>}
      </form>
      {loading ? <p>Cargando...</p> : (
        <ul>
          {attendance.map(record => (
            <li key={record._id}>{record.user?.name || 'Sin nombre'} - {record.isVerifiedByFacialRecognition ? 'Verificado' : 'No verificado'}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Attendance;
