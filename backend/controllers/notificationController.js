const NotificationService = require('../services/notificationService');

// Obtener notificaciones del usuario
exports.getUserNotifications = async (req, res) => {
  try {
    const onlyUnread = req.query.unread === 'true';
    const notifications = await NotificationService.getUserNotifications(
      req.user._id,
      onlyUnread
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener contador de no leídas
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(
      req.params.id,
      req.user._id
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marcar todas como leídas
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user._id);
    res.json({ 
      message: 'Todas las notificaciones marcadas como leídas',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar notificación
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await NotificationService.deleteNotification(
      req.params.id,
      req.user._id
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    
    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear notificación manual (solo admin)
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, userIds, toAllUsers } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Título y mensaje son requeridos' });
    }
    
    let notifications;
    
    if (toAllUsers) {
      // Notificar a todos los usuarios
      notifications = await NotificationService.notifyAllUsers({
        title,
        message,
        type: type || 'general'
      });
    } else if (userIds && userIds.length > 0) {
      // Notificar a usuarios específicos
      notifications = await NotificationService.createBulkNotifications({
        userIds,
        title,
        message,
        type: type || 'general',
        expiresInDays: 30
      });
    } else {
      return res.status(400).json({ 
        error: 'Debes especificar destinatarios (userIds o toAllUsers)' 
      });
    }
    
    res.status(201).json({ 
      message: 'Notificaciones creadas',
      count: notifications.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
