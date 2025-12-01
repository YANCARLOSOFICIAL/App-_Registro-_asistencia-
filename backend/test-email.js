/**
 * Script de prueba para verificar que el sistema de emails funciona correctamente
 *
 * Uso: node test-email.js
 *
 * IMPORTANTE: Antes de ejecutar este script:
 * 1. Configura RESEND_API_KEY en el archivo .env
 * 2. Si usas el plan gratuito, solo podrás enviar a emails verificados en tu cuenta de Resend
 */

require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailService() {
  console.log('\n🧪 Iniciando pruebas del servicio de email...\n');

  // Verificar configuración
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
    console.error('❌ ERROR: RESEND_API_KEY no está configurada en el archivo .env');
    console.log('\n📝 Para configurar:');
    console.log('1. Ve a https://resend.com/api-keys');
    console.log('2. Crea una API key');
    console.log('3. Actualiza RESEND_API_KEY en backend/.env\n');
    process.exit(1);
  }

  // Email de prueba (cámbialo por tu email verificado en Resend)
  const testEmail = 'tu-email@ejemplo.com';

  console.log('📧 Email de destino:', testEmail);
  console.log('⚠️  IMPORTANTE: Cambia "tu-email@ejemplo.com" por tu email verificado en Resend\n');

  try {
    // Prueba 1: Email de recordatorio de evento
    console.log('1️⃣  Probando email de recordatorio de evento...');
    await emailService.sendEventReminderEmail(
      testEmail,
      'Reunión de Equipo',
      new Date(Date.now() + 24 * 60 * 60 * 1000) // Mañana
    );
    console.log('✅ Email de recordatorio enviado\n');

    // Prueba 2: Email de asistencia registrada
    console.log('2️⃣  Probando email de asistencia registrada...');
    await emailService.sendAttendanceNotificationEmail(
      testEmail,
      'Juan Pérez',
      'Conferencia Anual',
      true
    );
    console.log('✅ Email de asistencia enviado\n');

    // Prueba 3: Email de nuevo documento
    console.log('3️⃣  Probando email de nuevo documento...');
    await emailService.sendDocumentUploadedEmail(
      testEmail,
      'Manual de Usuario v2.0'
    );
    console.log('✅ Email de documento enviado\n');

    // Prueba 4: Email de nuevo usuario
    console.log('4️⃣  Probando email de nuevo usuario...');
    await emailService.sendUserCreatedEmail(
      testEmail,
      'María González',
      'maria@ejemplo.com'
    );
    console.log('✅ Email de nuevo usuario enviado\n');

    // Prueba 5: Email genérico
    console.log('5️⃣  Probando email genérico...');
    await emailService.sendGeneralNotificationEmail(
      testEmail,
      '🎉 Bienvenido al Sistema',
      'Este es un mensaje de prueba del sistema de notificaciones por email.'
    );
    console.log('✅ Email genérico enviado\n');

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('📬 Revisa tu bandeja de entrada\n');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error.message);
    console.log('\n📋 Posibles causas:');
    console.log('- API key incorrecta');
    console.log('- Email de destino no verificado (plan gratuito)');
    console.log('- Límite de emails excedido');
    console.log('- Problemas de conexión\n');
    process.exit(1);
  }
}

testEmailService();
