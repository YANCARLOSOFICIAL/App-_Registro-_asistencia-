import React, { useState } from 'react';

const EventItem = ({ event }) => {
  const [showFacialForm, setShowFacialForm] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");

  const handleAttend = () => {
    fetch(`http://localhost:5000/api/events/${event._id}/attend`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(() => {
        alert('Asistencia registrada');
      });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError("");
    setVerifySuccess("");
    if (!faceImage || !faceImage.type.startsWith("image/")) {
      setVerifyError("Debes seleccionar una imagen válida");
      setVerifying(false);
      return;
    }
    const formData = new FormData();
    formData.append("faceImage", faceImage);
    formData.append("eventId", event._id);
    try {
      const res = await fetch("http://localhost:5000/api/attendance/verify", {
        method: "POST",
        body: formData,
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (res.ok) {
        setVerifySuccess(data.message || "Asistencia facial registrada correctamente");
      } else {
        setVerifyError(data.message || "Error al registrar asistencia facial");
      }
    } catch (err) {
      setVerifyError("Error de red");
    }
    setVerifying(false);
  };

  return (
    <li>
      <strong>{event.name}</strong> - {event.description} - {new Date(event.date).toLocaleDateString()}
      <button onClick={handleAttend}>Registrar asistencia</button>
      <button onClick={() => setShowFacialForm(!showFacialForm)}>
        {showFacialForm ? 'Cancelar facial' : 'Registrar asistencia facial'}
      </button>
      {showFacialForm && (
        <form onSubmit={handleVerify} style={{ marginTop: 10 }}>
          <input type="file" accept="image/*" onChange={e => setFaceImage(e.target.files[0])} required />
          <button type="submit" disabled={verifying}>Enviar facial</button>
          {verifyError && <p style={{color:'red'}}>{verifyError}</p>}
          {verifySuccess && <p style={{color:'green'}}>{verifySuccess}</p>}
        </form>
      )}
    </li>
  );
};

export default EventItem;
