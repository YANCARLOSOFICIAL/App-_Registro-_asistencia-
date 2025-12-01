const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    this.appName = process.env.APP_NAME || 'Sistema de Registro de Asistencia';
  }

  /**
   * Generar HTML base para emails
   */
  generateEmailHTML(title, content, actionButton = null) {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .notification-title {
            font-size: 20px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 15px;
          }
          .notification-message {
            font-size: 16px;
            color: #4a5568;
            line-height: 1.8;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #5568d3;
          }
          .footer {
            background-color: #f7fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #718096;
          }
          .divider {
            border-top: 1px solid #e2e8f0;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.appName}</h1>
          </div>
          <div class="content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${content}</div>
            ${actionButton || ''}
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} ${this.appName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
    `;
  }

  /**
   * Enviar email usando Resend
   */
  async sendEmail({ to, subject, html }) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️  RESEND_API_KEY not configured. Email not sent.');
        return null;
      }

      console.log(`📧 Intentando enviar email:`);
      console.log(`   De: ${this.fromEmail}`);
      console.log(`   Para: ${to}`);
      console.log(`   Asunto: ${subject}`);

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html
      });

      // Debug: Ver estructura completa de la respuesta
      console.log('📋 Respuesta de Resend:', JSON.stringify(result, null, 2));

      // La respuesta de Resend viene en result.data o directamente en result
      const emailId = result.data?.id || result.id || 'No ID';
      const error = result.error;

      if (error) {
        console.log(`❌ Error en respuesta de Resend:`);
        console.log(`   ${JSON.stringify(error, null, 2)}`);
        throw new Error(error.message || 'Error desconocido de Resend');
      }

      console.log(`✅ Email aceptado por Resend!`);
      console.log(`   ID: ${emailId}`);

      if (this.fromEmail === 'onboarding@resend.dev') {
        console.log(`   ⚠️  NOTA: Con onboarding@resend.dev solo se envía a emails verificados en Resend`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error al enviar email:');
      console.error(`   Mensaje: ${error.message}`);
      console.error(`   Detalles completos:`, error);

      if (error.message.includes('domain') || error.message.includes('Domain')) {
        console.error('\n💡 SUGERENCIA: El dominio no está verificado en Resend.');
        console.error('   Soluciones:');
        console.error('   1. Verifica el dominio en https://resend.com/domains');
        console.error('   2. O usa EMAIL_FROM=onboarding@resend.dev para testing\n');
      }

      throw error;
    }
  }

  /**
   * Enviar notificación de recordatorio de evento
   */
  async sendEventReminderEmail(userEmail, eventName, eventDate) {
    const title = '📅 Recordatorio de Evento';
    const content = `
      <p>Hola,</p>
      <p>Te recordamos que el evento <strong>"${eventName}"</strong> se llevará a cabo mañana.</p>
      <p><strong>Fecha:</strong> ${new Date(eventDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      <p>¡No olvides asistir y registrar tu asistencia!</p>
    `;

    const html = this.generateEmailHTML(title, content);

    return await this.sendEmail({
      to: userEmail,
      subject: `Recordatorio: ${eventName} es mañana`,
      html
    });
  }

  /**
   * Enviar notificación de asistencia registrada (a admins)
   */
  async sendAttendanceNotificationEmail(adminEmail, userName, eventName, isVerified) {
    const title = '✓ Nueva Asistencia Registrada';
    const verifiedText = isVerified
      ? '<span style="color: #48bb78;">con verificación facial exitosa</span>'
      : '<span style="color: #ed8936;">sin verificación facial</span>';

    const content = `
      <p>Hola,</p>
      <p>El usuario <strong>${userName}</strong> ha registrado su asistencia al evento <strong>"${eventName}"</strong> ${verifiedText}.</p>
      <p>Puedes revisar los detalles en el sistema.</p>
    `;

    const html = this.generateEmailHTML(title, content);

    return await this.sendEmail({
      to: adminEmail,
      subject: `Nueva asistencia: ${userName} - ${eventName}`,
      html
    });
  }

  /**
   * Enviar notificación de nuevo documento
   */
  async sendDocumentUploadedEmail(userEmail, documentTitle) {
    const title = '📄 Nuevo Documento Disponible';
    const content = `
      <p>Hola,</p>
      <p>Se ha subido un nuevo documento: <strong>"${documentTitle}"</strong></p>
      <p>Ya está disponible para su consulta en el sistema.</p>
    `;

    const html = this.generateEmailHTML(title, content);

    return await this.sendEmail({
      to: userEmail,
      subject: `Nuevo documento: ${documentTitle}`,
      html
    });
  }

  /**
   * Enviar notificación de nuevo usuario (a admins)
   */
  async sendUserCreatedEmail(adminEmail, newUserName, newUserEmail) {
    const title = '👤 Nuevo Usuario Registrado';
    const content = `
      <p>Hola,</p>
      <p>Un nuevo usuario se ha registrado en el sistema:</p>
      <ul>
        <li><strong>Nombre:</strong> ${newUserName}</li>
        <li><strong>Email:</strong> ${newUserEmail}</li>
      </ul>
      <p>Puedes revisar y gestionar la cuenta desde el panel de administración.</p>
    `;

    const html = this.generateEmailHTML(title, content);

    return await this.sendEmail({
      to: adminEmail,
      subject: `Nuevo usuario: ${newUserName}`,
      html
    });
  }

  /**
   * Enviar notificación general personalizada
   */
  async sendGeneralNotificationEmail(userEmail, title, message) {
    const html = this.generateEmailHTML(title, `<p>${message}</p>`);

    return await this.sendEmail({
      to: userEmail,
      subject: title,
      html
    });
  }

  /**
   * Enviar email a múltiples destinatarios
   */
  async sendBulkEmails(emails, subject, html) {
    const promises = emails.map(email =>
      this.sendEmail({ to: email, subject, html })
        .catch(error => {
          console.error(`Failed to send email to ${email}:`, error);
          return null;
        })
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;

    console.log(`Bulk email sent: ${successful}/${emails.length} successful`);
    return { successful, total: emails.length, results };
  }
}

module.exports = new EmailService();
