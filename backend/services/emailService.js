const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    this.appName = process.env.APP_NAME || 'Sistema de Registro de Asistencia';
    this.logoUrl = process.env.APP_LOGO_URL || '';
    this.supportEmail = process.env.SUPPORT_EMAIL || '';
  }

  /**
   * Generar HTML base para emails
   */
  createActionButton(url, label = 'Ver') {
    if (!url) return '';
    return `
      <div style="text-align:center;margin:24px 0;">
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="button" style="display:inline-block;padding:12px 26px;background:linear-gradient(90deg,#6366f1 0%,#8b5cf6 100%);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;box-shadow:0 8px 20px rgba(99,102,241,0.12);letter-spacing:0.2px;">${label}</a>
      </div>
    `;
  }

  generatePlainText(html) {
    if (!html) return '';
    // Simple plain-text extraction: remove tags and decode basic entities
    const withoutTags = html.replace(/<\/?[^>]+(>|$)/g, '');
    const decoded = withoutTags.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    return decoded.replace(/\s{2,}/g, ' ').trim();
  }

  /**
   * Generar HTML base para emails (mejorado)
   * actionButton: HTML string producido por createActionButton
   * preheader: texto corto que se muestra como preheader en clientes de correo
   */
  generateEmailHTML(title, content, actionButton = null, preheader = '') {
    const logoImg = this.logoUrl ? `<img src="${this.logoUrl}" alt="${this.appName} logo" style="max-height:48px;margin-bottom:8px;" />` : '';
    const safePreheader = preheader ? `<span class="preheader" style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${preheader}</span>` : '';

    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f7fb;
            color: #111827;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif;
          }

          .container {
            max-width: 640px;
            margin: 28px auto;
            background: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid rgba(15,23,42,0.04);
            box-shadow: 0 10px 30px rgba(2,6,23,0.06);
          }

          .header {
            padding: 28px 20px;
            text-align: center;
            background: linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%);
          }

          .brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
          }

          .logo-wrap {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            background: linear-gradient(135deg,#eef2ff,#f3e8ff);
            display:flex;
            align-items:center;
            justify-content:center;
            box-shadow: 0 6px 18px rgba(99,102,241,0.06);
          }

          .brand h1 {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
          }

          .content {
            padding: 26px 28px;
          }

          .title {
            font-size: 20px;
            font-weight: 800;
            margin: 0 0 8px 0;
            color: #0b1220;
          }

          .subtitle {
            margin: 0 0 18px 0;
            color: #475569;
            font-size: 14px;
          }

          .message {
            font-size: 15px;
            color: #334155;
            line-height: 1.7;
            margin-bottom: 18px;
          }

          .meta {
            font-size: 13px;
            color: #6b7280;
            margin-top: 10px;
          }

          .footer {
            background: #fbfdff;
            padding: 18px 20px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
          }

          a { color: #4f46e5; }

          @media (max-width: 520px) {
            .container { margin: 16px; }
            .content { padding: 18px; }
            .brand h1 { font-size: 16px; }
            .title { font-size: 18px; }
          }
        </style>
      </head>
      <body>
        ${safePreheader}
        <div class="container">
          <div class="header">
            <div class="brand">
              ${logoImg}
              <h1>${this.appName}</h1>
            </div>
          </div>
          <div class="content">
            <div class="title">${title}</div>
            <div class="message">${content}</div>
            ${actionButton || ''}
          </div>
          <div class="footer">
            <div class="small">Este es un correo automático enviado por ${this.appName}.</div>
            ${this.supportEmail ? `<div class="small">¿Necesitas ayuda? Escríbenos a <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></div>` : ''}
            <div style="margin-top:8px;" class="small">&copy; ${new Date().getFullYear()} ${this.appName}. Todos los derechos reservados.</div>
          </div>
        </div>
      </body>
    </html>`;
  }

  /**
   * Enviar email usando Resend
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️  RESEND_API_KEY not configured. Email not sent.');
        return null;
      }

      console.log(`📧 Intentando enviar email:`);
      console.log(`   De: ${this.fromEmail}`);
      console.log(`   Para: ${to}`);
      console.log(`   Asunto: ${subject}`);

      // Ensure we have a plain-text fallback for better deliverability and accessibility
      const fallbackText = text || this.generatePlainText(html);

      const result = await this.resend.emails.send({
        from: `${this.appName} <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: fallbackText
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
