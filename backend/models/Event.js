const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  endDate: { type: Date }, // Fecha/hora de finalización del evento
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Ubicación del evento
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  locationName: { type: String }, // Nombre legible del lugar (ej: "Auditorio Principal")
  allowedRadius: { type: Number, default: 100 }, // Radio permitido en metros (default 100m)

  // Configuración de QR dinámico
  qrConfig: {
    enabled: { type: Boolean, default: true },
    refreshInterval: { type: Number, default: 5 }, // Minutos antes de generar nuevo código
    secret: { type: String } // Secreto para generar códigos QR
  },

  // Código QR actual (cambia periódicamente)
  currentQRCode: {
    code: { type: String },
    generatedAt: { type: Date },
    expiresAt: { type: Date }
  },

  // Configuración de verificación
  requiresFacialRecognition: { type: Boolean, default: false },
  requiresQRCode: { type: Boolean, default: true },
  requiresLocation: { type: Boolean, default: true },
  minimumStayMinutes: { type: Number, default: 0 } // Tiempo mínimo de permanencia
});

// Índice geoespacial para búsquedas por ubicación
eventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Event', eventSchema);