const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['event_reminder', 'attendance_registered', 'document_uploaded', 'user_created', 'general'],
    default: 'general'
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  relatedEvent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event' 
  },
  relatedDocument: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document' 
  },
  relatedUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date 
  }
});

// Índice para búsquedas eficientes
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Índice TTL para auto-eliminar notificaciones antiguas
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
