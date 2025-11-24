const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },

    // Timestamps
    date: { type: Date, default: Date.now },
    checkIn: { type: Date },
    checkOut: { type: Date },

    // Verificaciones
    isVerifiedByFacialRecognition: { type: Boolean, default: false },
    isLocationVerified: { type: Boolean, default: false },
    isQRCodeVerified: { type: Boolean, default: false },

    // Datos de geolocalización
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] } // [longitude, latitude]
    },
    distanceFromEvent: { type: Number }, // Distancia en metros

    // Datos de QR
    qrCodeUsed: { type: String }, // El código QR que usó para registrarse
    qrCodeVerifiedAt: { type: Date },

    // Evidencia
    attendancePhoto: { type: Buffer },
    deviceInfo: { type: String },

    // Validación final - solo es válida si pasa todas las verificaciones
    isValidAttendance: { type: Boolean, default: false }
});

// Índice geoespacial para búsquedas por ubicación
AttendanceSchema.index({ location: '2dsphere' });

const Attendance = mongoose.model('Attendance', AttendanceSchema);
module.exports = Attendance;
