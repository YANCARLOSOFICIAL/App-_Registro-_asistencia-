import React, { useState, useEffect } from 'react';
import QRScanner from './QRScanner';

const AttendanceVerified = ({ event, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: QR, 2: Location, 3: Face (opcional), 4: Confirmar
  const [qrCode, setQrCode] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Capturar geolocalización automáticamente
  useEffect(() => {
    if (step === 2) {
      captureLocation();
    }
  }, [step]);

  const captureLocation = () => {
    setLocationError('');
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setLoading(false);
          // Avanzar automáticamente al siguiente paso
          setTimeout(() => {
            if (event.requiresFacialRecognition) {
              setStep(3);
            } else {
              setStep(4);
            }
          }, 1000);
        },
        (error) => {
          setLocationError(
            'No se pudo obtener tu ubicación. Asegúrate de haber dado permisos de ubicación.'
          );
          setLoading(false);
          console.error('Error de geolocalización:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Tu navegador no soporta geolocalización');
    }
  };

  const handleQRScan = (decodedText) => {
    console.log('QR Code escaneado:', decodedText);
    setQrCode(decodedText);
    setStep(2);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar 5MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      setFaceImage(file);
      setError('');

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('qrCode', qrCode);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      formData.append('deviceInfo', navigator.userAgent);

      if (faceImage) {
        formData.append('faceImage', faceImage);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/events/${event._id}/attend-verified`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        if (onSuccess) {
          onSuccess(data);
        }
        // Resetear después de 2 segundos
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        setError(data.error || 'Error al registrar asistencia');
        if (data.details) {
          setError(data.error + ': ' + data.details.join(', '));
        }
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setStep(1);
    setQrCode(null);
    setLocation(null);
    setFaceImage(null);
    setPreview(null);
    setError('');
    setSuccess('');
  };

  const renderStepIndicator = () => {
    const steps = ['QR', 'Ubicación'];
    if (event.requiresFacialRecognition) {
      steps.push('Rostro');
    }
    steps.push('Confirmar');

    return (
      <div style={styles.stepIndicator}>
        {steps.map((stepName, index) => (
          <div
            key={index}
            style={{
              ...styles.stepItem,
              ...(index + 1 === step ? styles.stepItemActive : {}),
              ...(index + 1 < step ? styles.stepItemCompleted : {})
            }}
          >
            <div style={styles.stepNumber}>{index + 1}</div>
            <div style={styles.stepName}>{stepName}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Registrar Asistencia Verificada</h2>
      <p style={styles.subtitle}>{event.name}</p>

      {renderStepIndicator()}

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* PASO 1: Escanear QR */}
      {step === 1 && (
        <div style={styles.stepContent}>
          <QRScanner onScanSuccess={handleQRScan} />
          <button onClick={resetForm} style={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      )}

      {/* PASO 2: Capturar Ubicación */}
      {step === 2 && (
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>Verificando Ubicación</h3>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Obteniendo tu ubicación...</p>
            </div>
          ) : location ? (
            <div style={styles.successContainer}>
              <p style={styles.checkmark}>✓</p>
              <p>Ubicación capturada exitosamente</p>
              <p style={styles.locationInfo}>
                Precisión: {Math.round(location.accuracy)} metros
              </p>
            </div>
          ) : (
            <div>
              <p style={styles.error}>{locationError}</p>
              <button onClick={captureLocation} style={styles.button}>
                Reintentar
              </button>
            </div>
          )}
        </div>
      )}

      {/* PASO 3: Capturar Rostro (opcional según configuración del evento) */}
      {step === 3 && (
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>Verificación Facial</h3>
          <p style={styles.stepDescription}>
            Toma una foto de tu rostro para verificar tu identidad
          </p>

          {preview && (
            <div style={styles.previewContainer}>
              <img src={preview} alt="Preview" style={styles.preview} />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleImageChange}
            style={styles.fileInput}
          />

          <div style={styles.buttonGroup}>
            <button
              onClick={() => setStep(2)}
              style={styles.backButton}
            >
              Atrás
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!faceImage}
              style={{
                ...styles.button,
                opacity: !faceImage ? 0.5 : 1
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* PASO 4: Confirmar */}
      {step === 4 && (
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>Confirmar Asistencia</h3>

          <div style={styles.summary}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>✓ Código QR:</span>
              <span style={styles.summaryValue}>Verificado</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>✓ Ubicación:</span>
              <span style={styles.summaryValue}>
                Precisión {location?.accuracy ? Math.round(location.accuracy) : 'N/A'}m
              </span>
            </div>
            {event.requiresFacialRecognition && (
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>✓ Rostro:</span>
                <span style={styles.summaryValue}>
                  {faceImage ? 'Capturado' : 'No proporcionado'}
                </span>
              </div>
            )}
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={() => setStep(event.requiresFacialRecognition ? 3 : 2)}
              style={styles.backButton}
              disabled={loading}
            >
              Atrás
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? 'Registrando...' : 'Confirmar Asistencia'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    textAlign: 'center',
    marginBottom: '5px',
    color: '#333'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '20px'
  },
  stepIndicator: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '30px',
    padding: '0 10px'
  },
  stepItem: {
    flex: 1,
    textAlign: 'center',
    opacity: 0.5
  },
  stepItemActive: {
    opacity: 1,
    fontWeight: 'bold'
  },
  stepItemCompleted: {
    opacity: 0.8,
    color: '#4CAF50'
  },
  stepNumber: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 5px',
    fontSize: '14px'
  },
  stepName: {
    fontSize: '12px'
  },
  stepContent: {
    minHeight: '300px'
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: '10px',
    color: '#333'
  },
  stepDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '20px',
    fontSize: '14px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2196F3',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  successContainer: {
    textAlign: 'center',
    padding: '40px'
  },
  checkmark: {
    fontSize: '48px',
    color: '#4CAF50',
    margin: '0'
  },
  locationInfo: {
    fontSize: '14px',
    color: '#666',
    marginTop: '10px'
  },
  previewContainer: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  preview: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '8px',
    border: '2px solid #ddd'
  },
  fileInput: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  summary: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  },
  summaryLabel: {
    fontWeight: 'bold',
    color: '#333'
  },
  summaryValue: {
    color: '#666'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  backButton: {
    padding: '12px 24px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    display: 'block',
    margin: '20px auto'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  success: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold'
  }
};

// Agregar animación del spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AttendanceVerified;
