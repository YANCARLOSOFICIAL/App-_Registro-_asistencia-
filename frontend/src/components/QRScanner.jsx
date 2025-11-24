import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [0, 1] // QR Code y código de barras
      },
      false
    );

    const onSuccess = (decodedText, decodedResult) => {
      console.log('QR escaneado:', decodedText);
      setScanning(false);
      scanner.clear();
      if (onScanSuccess) {
        onScanSuccess(decodedText, decodedResult);
      }
    };

    const onError = (errorMessage) => {
      // No hacer nada en cada frame de error, es normal
      // console.warn('Error de escaneo:', errorMessage);
    };

    scanner.render(onSuccess, onError);
    setScanning(true);

    return () => {
      if (scanner.getState() === 2) { // SCANNING
        scanner.clear().catch(console.error);
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Escanear Código QR</h3>
        <p style={styles.subtitle}>
          Apunta tu cámara al código QR del evento
        </p>
      </div>
      <div id="qr-reader" ref={scannerRef} style={styles.reader}></div>
      <div style={styles.instructions}>
        <p>Asegúrate de estar en el lugar del evento</p>
        <p>El código QR debe estar bien iluminado</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  title: {
    margin: '0 0 10px 0',
    color: '#333'
  },
  subtitle: {
    margin: '0',
    color: '#666',
    fontSize: '14px'
  },
  reader: {
    borderRadius: '8px',
    overflow: 'hidden'
  },
  instructions: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#777'
  }
};

export default QRScanner;
