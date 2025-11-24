import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventQRDisplay = ({ eventId }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/events/${eventId}/qr-code`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQrData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener el código QR');
      setLoading(false);
    }
  };

  const refreshQRCode = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/qr-code/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQrData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al regenerar el código QR');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, [eventId]);

  // Actualizar el tiempo restante cada segundo
  useEffect(() => {
    if (!qrData) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(qrData.expiresAt).getTime();
      const remaining = Math.max(0, expiresAt - now);

      setTimeLeft(remaining);

      // Si expiró, recargar automáticamente
      if (remaining === 0) {
        fetchQRCode();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData]);

  const formatTimeLeft = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Cargando código QR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>{error}</p>
        <button onClick={fetchQRCode} style={styles.button}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Código QR del Evento</h3>

      {qrData && (
        <>
          <div style={styles.qrContainer}>
            <img
              src={qrData.qrImage}
              alt="Código QR del evento"
              style={styles.qrImage}
            />
          </div>

          <div style={styles.infoContainer}>
            <p style={styles.timeInfo}>
              Tiempo restante: <strong>{formatTimeLeft(timeLeft)}</strong>
            </p>
            <p style={styles.subtitle}>
              Este código cambia cada 5 minutos por seguridad
            </p>
            {qrData.refreshed && (
              <p style={styles.refreshedBadge}>Código actualizado</p>
            )}
          </div>

          <button onClick={refreshQRCode} style={styles.button}>
            Regenerar Código QR
          </button>

          <div style={styles.instructions}>
            <h4 style={styles.instructionsTitle}>Instrucciones:</h4>
            <ol style={styles.instructionsList}>
              <li>Muestra este código QR en una pantalla visible</li>
              <li>Los asistentes deben escanear el código con su teléfono</li>
              <li>También necesitan estar físicamente en el lugar del evento</li>
              <li>El código expira automáticamente cada 5 minutos</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '20px auto'
  },
  title: {
    marginBottom: '20px',
    color: '#333'
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'inline-block',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  qrImage: {
    width: '300px',
    height: '300px',
    display: 'block'
  },
  infoContainer: {
    marginBottom: '20px'
  },
  timeInfo: {
    fontSize: '18px',
    marginBottom: '5px',
    color: '#555'
  },
  subtitle: {
    fontSize: '14px',
    color: '#777',
    marginBottom: '10px'
  },
  refreshedBadge: {
    display: 'inline-block',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    marginTop: '5px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '20px'
  },
  instructions: {
    backgroundColor: '#e3f2fd',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '20px',
    textAlign: 'left'
  },
  instructionsTitle: {
    marginTop: '0',
    marginBottom: '10px',
    color: '#1976D2'
  },
  instructionsList: {
    margin: '0',
    paddingLeft: '20px',
    color: '#555'
  },
  error: {
    color: 'red',
    marginBottom: '10px'
  }
};

export default EventQRDisplay;
