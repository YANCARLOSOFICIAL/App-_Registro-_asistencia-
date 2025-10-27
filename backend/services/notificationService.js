const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  /**
   * Crear una notificación para un usuario específico
   */
  static async createNotification({ userId, title, message, type, relatedEvent, relatedDocument, relatedUser, expiresInDays }) {
    try {
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const notification = new Notification({
        user: userId,
        title,
        message,
        type,
        relatedEvent,
        relatedDocument,
        relatedUser,
        expiresAt
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Crear notificaciones para múltiples usuarios
   */
  static async createBulkNotifications({ userIds, title, message, type, relatedEvent, relatedDocument, expiresInDays }) {
    try {
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const notifications = userIds.map(userId => ({
        user: userId,
        title,
        message,
        type,
        relatedEvent,
        relatedDocument,
        expiresAt
      }));

      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Notificar a todos los usuarios (excepto uno opcional)
   */
  static async notifyAllUsers({ title, message, type, excludeUserId, relatedEvent, relatedDocument }) {
    try {
      const query = excludeUserId ? { _id: { $ne: excludeUserId } } : {};
      const users = await User.find(query, '_id');
      const userIds = users.map(u => u._id);

      if (userIds.length === 0) return [];

      return await this.createBulkNotifications({
        userIds,
        title,
        message,
        type,
        relatedEvent,
        relatedDocument,
        expiresInDays: 30
      });
    } catch (error) {
      console.error('Error notifying all users:', error);
      throw error;
    }
  }

  /**
   * Notificar a administradores solamente
   */
  static async notifyAdmins({ title, message, type, relatedEvent, relatedDocument, relatedUser }) {
    try {
      const admins = await User.find({ role: 'admin' }, '_id');
      const adminIds = admins.map(a => a._id);

      if (adminIds.length === 0) return [];

      return await this.createBulkNotifications({
        userIds: adminIds,
        title,
        message,
        type,
        relatedEvent,
        relatedDocument,
        relatedUser,
        expiresInDays: 30
      });
    } catch (error) {
      console.error('Error notifying admins:', error);
      throw error;
    }
  }

  /**
   * Recordatorio de evento próximo (24 horas antes)
   */
  static async sendEventReminder(event) {
    try {
      // Notificar a todos los usuarios sobre el evento próximo
      return await this.notifyAllUsers({
        title: '📅 Recordatorio de Evento',
        message: `El evento "${event.name}" es mañana. ¡No olvides asistir!`,
        type: 'event_reminder',
        relatedEvent: event._id
      });
    } catch (error) {
      console.error('Error sending event reminder:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando alguien registra asistencia
   */
  static async notifyAttendanceRegistered(userId, eventName, isVerified) {
    try {
      const verifiedText = isVerified ? ' con verificación facial' : '';
      
      // Notificar a administradores
      return await this.notifyAdmins({
        title: '✓ Nueva Asistencia Registrada',
        message: `Un usuario ha registrado su asistencia al evento "${eventName}"${verifiedText}.`,
        type: 'attendance_registered',
        relatedUser: userId
      });
    } catch (error) {
      console.error('Error notifying attendance:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando se sube un nuevo documento
   */
  static async notifyDocumentUploaded(documentTitle, documentId, uploadedBy) {
    try {
      // Notificar a todos los usuarios excepto quien lo subió
      return await this.notifyAllUsers({
        title: '📄 Nuevo Documento Disponible',
        message: `Se ha subido un nuevo documento: "${documentTitle}". ¡Revísalo ahora!`,
        type: 'document_uploaded',
        excludeUserId: uploadedBy,
        relatedDocument: documentId
      });
    } catch (error) {
      console.error('Error notifying document upload:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando se crea un nuevo usuario
   */
  static async notifyUserCreated(userName, userId) {
    try {
      // Notificar a administradores
      return await this.notifyAdmins({
        title: '👤 Nuevo Usuario Registrado',
        message: `${userName} se ha registrado en el sistema.`,
        type: 'user_created',
        relatedUser: userId
      });
    } catch (error) {
      console.error('Error notifying user creation:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones de un usuario
   */
  static async getUserNotifications(userId, onlyUnread = false) {
    try {
      const query = { user: userId };
      if (onlyUnread) {
        query.read = false;
      }

      const notifications = await Notification.find(query)
        .populate('relatedEvent', 'name date')
        .populate('relatedDocument', 'title')
        .populate('relatedUser', 'name email')
        .sort({ createdAt: -1 })
        .limit(50);

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { read: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
      );
      return result;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Eliminar notificación
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId
      });
      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Contar notificaciones no leídas
   */
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        user: userId,
        read: false
      });
      return count;
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      throw error;
    }
  }

  /**
   * Tarea programada: Enviar recordatorios de eventos próximos
   * Se debe ejecutar diariamente
   */
  static async sendUpcomingEventReminders() {
    try {
      const Event = require('../models/Event');
      
      // Buscar eventos que ocurrirán en 24 horas
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const upcomingEvents = await Event.find({
        date: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        }
      });

      console.log(`Found ${upcomingEvents.length} upcoming events for reminders`);

      for (const event of upcomingEvents) {
        await this.sendEventReminder(event);
      }

      return upcomingEvents.length;
    } catch (error) {
      console.error('Error sending upcoming event reminders:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
