const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Obtener notificaciones del usuario autenticado
router.get('/', auth.authenticate, notificationController.getUserNotifications);

// Obtener contador de no leídas
router.get('/unread-count', auth.authenticate, notificationController.getUnreadCount);

// Marcar notificación como leída
router.put('/:id/read', auth.authenticate, notificationController.markAsRead);

// Marcar todas como leídas
router.put('/mark-all-read', auth.authenticate, notificationController.markAllAsRead);

// Eliminar notificación
router.delete('/:id', auth.authenticate, notificationController.deleteNotification);

// Crear notificación manual (solo admin)
router.post('/', auth.authenticate, auth.requireRole('admin'), notificationController.createNotification);

module.exports = router;
