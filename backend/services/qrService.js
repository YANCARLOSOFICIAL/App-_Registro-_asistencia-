const QRCode = require('qrcode');
const crypto = require('crypto');

class QRService {
  /**
   * Genera un código QR único para un evento
   * El código incluye: eventId, timestamp, y hash de seguridad
   */
  static async generateQRCode(event) {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + event.qrConfig.refreshInterval * 60000);

      // Generar código único basado en el evento, timestamp y secreto
      const secret = event.qrConfig.secret || this.generateSecret();
      const timestamp = now.getTime();
      const payload = {
        eventId: event._id.toString(),
        timestamp: timestamp,
        expires: expiresAt.getTime()
      };

      // Crear hash de seguridad
      const dataToHash = `${payload.eventId}-${payload.timestamp}-${secret}`;
      const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

      // Código QR como JSON string
      const qrData = JSON.stringify({
        ...payload,
        hash: hash.substring(0, 16) // Primeros 16 caracteres del hash
      });

      // Generar imagen QR en formato base64
      const qrImageBase64 = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300
      });

      return {
        code: qrData,
        image: qrImageBase64,
        generatedAt: now,
        expiresAt: expiresAt,
        secret: secret
      };
    } catch (error) {
      console.error('Error generando QR:', error);
      throw new Error('No se pudo generar el código QR');
    }
  }

  /**
   * Verifica si un código QR es válido para un evento
   */
  static verifyQRCode(qrCodeData, event) {
    try {
      const qrPayload = JSON.parse(qrCodeData);

      // Verificar que el evento coincida
      if (qrPayload.eventId !== event._id.toString()) {
        return { valid: false, reason: 'El código QR no pertenece a este evento' };
      }

      // Verificar que no haya expirado
      const now = Date.now();
      if (now > qrPayload.expires) {
        return { valid: false, reason: 'El código QR ha expirado' };
      }

      // Verificar el hash de seguridad
      const secret = event.qrConfig.secret;
      const dataToHash = `${qrPayload.eventId}-${qrPayload.timestamp}-${secret}`;
      const expectedHash = crypto.createHash('sha256').update(dataToHash).digest('hex').substring(0, 16);

      if (qrPayload.hash !== expectedHash) {
        return { valid: false, reason: 'Código QR inválido o falsificado' };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error verificando QR:', error);
      return { valid: false, reason: 'Formato de código QR inválido' };
    }
  }

  /**
   * Verifica si el código QR actual del evento necesita ser regenerado
   */
  static needsRefresh(event) {
    if (!event.currentQRCode || !event.currentQRCode.expiresAt) {
      return true;
    }

    const now = new Date();
    return now >= event.currentQRCode.expiresAt;
  }

  /**
   * Genera un secreto aleatorio para el evento
   */
  static generateSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
   * @param {Array} coords1 - [longitude, latitude]
   * @param {Array} coords2 - [longitude, latitude]
   * @returns {Number} Distancia en metros
   */
  static calculateDistance(coords1, coords2) {
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;

    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }

  /**
   * Verifica si una ubicación está dentro del radio permitido del evento
   */
  static verifyLocation(userCoordinates, eventCoordinates, allowedRadius) {
    const distance = this.calculateDistance(userCoordinates, eventCoordinates);

    return {
      isValid: distance <= allowedRadius,
      distance: Math.round(distance),
      allowedRadius: allowedRadius
    };
  }
}

module.exports = QRService;
