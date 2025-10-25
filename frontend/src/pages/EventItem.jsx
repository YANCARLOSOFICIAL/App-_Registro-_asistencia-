import React, { useState } from 'react';

const EventItem = ({ event }) => {
  const [showFacialForm, setShowFacialForm] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");
  const [registering, setRegistering] = useState(false);

  // Registrar asistencia simple (sin foto)
  const handleAttend = async () => {
    setRegistering(true);
    setVerifyError("");
    setVerifySuccess("");
    
    try {
      const res = await fetch(`http://localhost:5000/api/events/${event._id}/attend`, {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setVerifySuccess('✓ Asistencia registrada correctamente');
        setTimeout(() => setVerifySuccess(""), 3000);
      } else {
        setVerifyError(data.error || 'Error al registrar asistencia');
      }
    } catch (err) {
      setVerifyError('Error de conexión');
    }
    
    setRegistering(false);
  };

  // Manejar selección de imagen con preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaceImage(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Registrar asistencia con verificación facial
  const handleVerifyFacial = async (e) => {
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
    
    // Validar tamaño (5MB max)
    if (faceImage.size > 5 * 1024 * 1024) {
      setVerifyError("La imagen no debe superar los 5MB");
      setVerifying(false);
      return;
    }
    
    const formData = new FormData();
    formData.append("faceImage", faceImage);
    
    try {
      const res = await fetch(`http://localhost:5000/api/events/${event._id}/attend-facial`, {
        method: "POST",
        body: formData,
        headers: { 
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.verified) {
          setVerifySuccess(`✓ ${data.message} - ¡Imagen verificada!`);
        } else {
          setVerifySuccess(`✓ ${data.message}`);
        }
        // Limpiar formulario
        setFaceImage(null);
        setPreview(null);
        setShowFacialForm(false);
        setTimeout(() => setVerifySuccess(""), 5000);
      } else {
        setVerifyError(data.error || "Error al registrar asistencia facial");
      }
    } catch (err) {
      setVerifyError("Error de red. Intenta de nuevo.");
    }
    
    setVerifying(false);
  };

  // Formatear fecha
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar si el evento ya pasó
  const isPastEvent = new Date(event.date) < new Date();

  return (
    <li style={{ 
      background: isPastEvent ? '#333' : '#222',
      opacity: isPastEvent ? 0.7 : 1,
      marginBottom: '1rem',
      padding: '1.5rem',
      borderRadius: '10px',
      border: '1px solid #444'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>
          {event.name}
          {isPastEvent && <span style={{ color: '#888', fontSize: '0.9rem', marginLeft: '0.5rem' }}>(Finalizado)</span>}
        </h3>
        <p style={{ margin: '0.3rem 0', color: '#ccc' }}>{event.description}</p>
        <p style={{ margin: '0.3rem 0', color: '#aaa', fontSize: '0.95rem' }}>
          📅 {formatDate(event.date)}
        </p>
        {event.attendees && event.attendees.length > 0 && (
          <p style={{ margin: '0.5rem 0', color: '#4CAF50', fontSize: '0.9rem' }}>
            👥 {event.attendees.length} asistente{event.attendees.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      {/* Mensajes de éxito/error */}
      {verifySuccess && (
        <div style={{ 
          background: '#27ae60', 
          color: 'white', 
          padding: '0.7rem', 
          borderRadius: '6px', 
          marginBottom: '0.5rem',
          fontWeight: 'bold'
        }}>
          {verifySuccess}
        </div>
      )}
      
      {verifyError && (
        <div style={{ 
          background: '#e74c3c', 
          color: 'white', 
          padding: '0.7rem', 
          borderRadius: '6px', 
          marginBottom: '0.5rem',
          fontWeight: 'bold'
        }}>
          {verifyError}
        </div>
      )}
      
      {/* Botones de acción */}
      {!isPastEvent && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleAttend} 
            disabled={registering}
            style={{
              background: '#646cff',
              color: '#fff',
              border: 'none',
              padding: '0.7em 1.2em',
              borderRadius: '6px',
              cursor: registering ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: registering ? 0.6 : 1
            }}
          >
            {registering ? 'Registrando...' : '✓ Registrar asistencia'}
          </button>
          
          <button 
            onClick={() => {
              setShowFacialForm(!showFacialForm);
              if (!showFacialForm) {
                setVerifyError("");
                setVerifySuccess("");
              }
            }}
            style={{
              background: showFacialForm ? '#e74c3c' : '#27ae60',
              color: '#fff',
              border: 'none',
              padding: '0.7em 1.2em',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showFacialForm ? '✕ Cancelar' : '📷 Verificar con foto'}
          </button>
        </div>
      )}
      
      {/* Formulario de verificación facial */}
      {showFacialForm && !isPastEvent && (
        <form 
          onSubmit={handleVerifyFacial} 
          style={{ 
            marginTop: '1rem', 
            padding: '1rem',
            background: '#1a1a1a',
            borderRadius: '8px',
            border: '2px dashed #27ae60'
          }}
        >
          <h4 style={{ margin: '0 0 0.8rem 0', color: '#27ae60' }}>
            📸 Verificación Facial
          </h4>
          
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
            Sube una foto de tu rostro para verificar tu identidad
          </p>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            required 
            style={{
              marginBottom: '1rem',
              padding: '0.5rem',
              width: '100%',
              background: '#222',
              border: '1px solid #444',
              borderRadius: '6px',
              color: '#fff'
            }}
          />
          
          {/* Preview de la imagen */}
          {preview && (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Vista previa:
              </p>
              <img 
                src={preview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px',
                  borderRadius: '8px',
                  border: '2px solid #27ae60'
                }} 
              />
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={verifying || !faceImage}
            style={{
              background: verifying || !faceImage ? '#888' : '#27ae60',
              color: '#fff',
              border: 'none',
              padding: '0.8em 1.5em',
              borderRadius: '6px',
              cursor: verifying || !faceImage ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              width: '100%',
              fontSize: '1rem'
            }}
          >
            {verifying ? '⏳ Verificando...' : '✓ Enviar y verificar'}
          </button>
          
          <p style={{ 
            color: '#888', 
            fontSize: '0.8rem', 
            marginTop: '0.8rem',
            textAlign: 'center' 
          }}>
            💡 Tip: Usa una foto clara de tu rostro para mejor verificación
          </p>
        </form>
      )}
      
      {isPastEvent && (
        <p style={{ 
          color: '#888', 
          fontStyle: 'italic',
          marginTop: '0.5rem',
          fontSize: '0.9rem'
        }}>
          Este evento ya finalizó. No se pueden registrar más asistencias.
        </p>
      )}
    </li>
  );
};

export default EventItem;
