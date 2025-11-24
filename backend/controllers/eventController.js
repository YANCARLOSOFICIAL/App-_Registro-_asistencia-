const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const sharp = require('sharp');
const NotificationService = require('../services/notificationService');
const QRService = require('../services/qrService');

// Crear evento
exports.createEvent = async (req, res) => {
  try {
    const { name, description, date, endDate, location, locationName, allowedRadius,
            requiresFacialRecognition, requiresQRCode, requiresLocation, minimumStayMinutes } = req.body;

    // Validación básica
    if (!name || !date) {
      return res.status(400).json({ error: 'Nombre y fecha son requeridos' });
    }

    // Validar ubicación solo si se requiere verificación de ubicación
    const locationRequired = requiresLocation !== false;
    if (locationRequired && (!location || !location.coordinates || location.coordinates.length !== 2)) {
      return res.status(400).json({
        error: 'Ubicación requerida. Proporciona coordenadas [longitude, latitude]'
      });
    }

    const event = new Event({
      name,
      description,
      date,
      endDate,
      createdBy: req.user._id,
      locationName,
      allowedRadius: allowedRadius || 100,
      requiresFacialRecognition: requiresFacialRecognition || false,
      requiresQRCode: requiresQRCode !== false,
      requiresLocation: requiresLocation !== false,
      minimumStayMinutes: minimumStayMinutes || 0,
      qrConfig: {
        enabled: true,
        refreshInterval: 5,
        secret: QRService.generateSecret()
      }
    });

    // Solo agregar ubicación si se proporciona
    if (location && location.coordinates && location.coordinates.length === 2) {
      event.location = {
        type: 'Point',
        coordinates: location.coordinates
      };
    }

    // Generar el primer código QR
    if (event.qrConfig.enabled) {
      const qrData = await QRService.generateQRCode(event);
      event.currentQRCode = {
        code: qrData.code,
        generatedAt: qrData.generatedAt,
        expiresAt: qrData.expiresAt
      };
      event.qrConfig.secret = qrData.secret;
    }

    await event.save();
    
    // Notificar a todos los usuarios sobre el nuevo evento
    try {
      await NotificationService.notifyAllUsers({
        title: '📅 Nuevo Evento Creado',
        message: `Se ha creado el evento "${name}". ¡Regístrate ahora!`,
        type: 'general',
        relatedEvent: event._id
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }
    
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar eventos
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: -1 }); // Ordenar por fecha descendente
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Registrar asistencia simple (sin foto)
exports.registerAttendance = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Verificar si ya registró asistencia
    const existingAttendance = await Attendance.findOne({
      user: req.user._id,
      event: event._id
    });
    
    if (existingAttendance) {
      return res.status(400).json({ error: 'Ya registraste asistencia a este evento' });
    }
    
    // Crear registro de asistencia (método simple, sin verificaciones)
    const attendance = new Attendance({
      user: req.user._id,
      event: event._id,
      checkIn: new Date(),
      isVerifiedByFacialRecognition: false,
      isLocationVerified: false,
      isQRCodeVerified: false,
      isValidAttendance: true // Método antiguo - se considera válido por compatibilidad
    });
    await attendance.save();
    
    // Agregar a la lista de asistentes del evento
    if (!event.attendees.includes(req.user._id)) {
      event.attendees.push(req.user._id);
      await event.save();
    }
    
    // Notificar a administradores
    try {
      await NotificationService.notifyAttendanceRegistered(
        req.user._id,
        event.name,
        false
      );
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }
    
    res.json({ 
      message: 'Asistencia registrada correctamente',
      attendance 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Registrar asistencia con verificación facial
exports.registerAttendanceWithFacial = async (req, res) => {
  try {
    const faceImage = req.file;
    
    if (!faceImage) {
      return res.status(400).json({ error: 'Imagen de rostro requerida' });
    }
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Verificar si ya registró asistencia
    const existingAttendance = await Attendance.findOne({
      user: req.user._id,
      event: event._id
    });
    
    if (existingAttendance) {
      return res.status(400).json({ 
        error: 'Ya registraste asistencia a este evento',
        isVerified: existingAttendance.isVerifiedByFacialRecognition 
      });
    }
    
    // Obtener el usuario actual
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar que el usuario tenga imagen facial registrada
    if (!user.faceImage) {
      return res.status(400).json({ 
        error: 'No tienes una imagen facial registrada. Registra asistencia sin verificación facial o actualiza tu perfil.' 
      });
    }
    
    // Comparar imágenes (método actual - comparación simple de buffers)
    // Procesar la imagen capturada
    const capturedImageBuffer = await sharp(faceImage.buffer)
      .resize(200, 200)
      .toBuffer();
    
    // Obtener imagen del usuario
    const userImageBuffer = Buffer.from(user.faceImage, 'base64');
    
    // Comparar imágenes
    const isMatch = capturedImageBuffer.equals(userImageBuffer);
    
    if (!isMatch) {
      // Registrar asistencia pero sin verificación facial
      const attendance = new Attendance({
        user: req.user._id,
        event: event._id,
        checkIn: new Date(),
        isVerifiedByFacialRecognition: false,
        isLocationVerified: false,
        isQRCodeVerified: false,
        isValidAttendance: false // Falló la verificación facial
      });
      await attendance.save();
      
      if (!event.attendees.includes(req.user._id)) {
        event.attendees.push(req.user._id);
        await event.save();
      }
      
      return res.status(200).json({ 
        message: 'Asistencia registrada, pero la imagen facial no coincide',
        verified: false,
        attendance
      });
    }
    
    // Crear registro de asistencia con verificación facial
    const attendance = new Attendance({
      user: req.user._id,
      event: event._id,
      checkIn: new Date(),
      isVerifiedByFacialRecognition: true,
      isLocationVerified: false,
      isQRCodeVerified: false,
      isValidAttendance: true // Método antiguo con verificación facial exitosa
    });
    await attendance.save();
    
    // Agregar a la lista de asistentes del evento
    if (!event.attendees.includes(req.user._id)) {
      event.attendees.push(req.user._id);
      await event.save();
    }
    
    // Notificar a administradores con verificación facial
    try {
      await NotificationService.notifyAttendanceRegistered(
        req.user._id,
        event.name,
        true
      );
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }
    
    res.json({ 
      message: 'Asistencia registrada y verificada con éxito',
      verified: true,
      attendance 
    });
  } catch (err) {
    console.error('Error en registerAttendanceWithFacial:', err);
    res.status(500).json({ error: err.message });
  }
};

// Registrar asistencia con QR y geolocalización (NUEVO MÉTODO PRINCIPAL)
exports.registerAttendanceWithQRAndLocation = async (req, res) => {
  try {
    const { qrCode, latitude, longitude, deviceInfo } = req.body;
    const faceImage = req.file;

    // Validaciones básicas
    if (!qrCode) {
      return res.status(400).json({ error: 'Código QR requerido' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Verificar si ya registró asistencia
    const existingAttendance = await Attendance.findOne({
      user: req.user._id,
      event: event._id
    });

    if (existingAttendance) {
      return res.status(400).json({
        error: 'Ya registraste asistencia a este evento',
        attendance: existingAttendance
      });
    }

    // Validar tiempo del evento
    const now = new Date();
    if (event.endDate && now > event.endDate) {
      return res.status(400).json({ error: 'El evento ya finalizó' });
    }
    if (now < event.date) {
      return res.status(400).json({ error: 'El evento aún no ha comenzado' });
    }

    // Objeto para almacenar resultados de verificación
    const verification = {
      qr: false,
      location: false,
      facial: false,
      errors: []
    };

    // 1. VERIFICAR CÓDIGO QR
    if (event.requiresQRCode) {
      const qrVerification = QRService.verifyQRCode(qrCode, event);
      verification.qr = qrVerification.valid;

      if (!qrVerification.valid) {
        verification.errors.push(`QR: ${qrVerification.reason}`);
      }
    } else {
      verification.qr = true; // No requerido
    }

    // 2. VERIFICAR UBICACIÓN
    let distanceFromEvent = null;
    if (event.requiresLocation) {
      if (!latitude || !longitude) {
        verification.errors.push('Ubicación: Coordenadas GPS requeridas');
      } else {
        const userCoordinates = [parseFloat(longitude), parseFloat(latitude)];
        const locationVerification = QRService.verifyLocation(
          userCoordinates,
          event.location.coordinates,
          event.allowedRadius
        );

        verification.location = locationVerification.isValid;
        distanceFromEvent = locationVerification.distance;

        if (!locationVerification.isValid) {
          verification.errors.push(
            `Ubicación: Estás a ${distanceFromEvent}m del evento (máximo ${event.allowedRadius}m permitidos)`
          );
        }
      }
    } else {
      verification.location = true; // No requerido
    }

    // 3. VERIFICAR RECONOCIMIENTO FACIAL (si se requiere)
    let attendancePhoto = null;
    if (event.requiresFacialRecognition) {
      if (!faceImage) {
        verification.errors.push('Facial: Foto de rostro requerida');
      } else {
        const user = await User.findById(req.user._id);

        if (!user.faceImage) {
          verification.errors.push('Facial: No tienes imagen facial registrada en tu perfil');
        } else {
          // Procesar y comparar imagen
          const capturedImageBuffer = await sharp(faceImage.buffer)
            .resize(200, 200)
            .toBuffer();

          attendancePhoto = capturedImageBuffer;
          const userImageBuffer = Buffer.from(user.faceImage, 'base64');
          const isMatch = capturedImageBuffer.equals(userImageBuffer);

          verification.facial = isMatch;

          if (!isMatch) {
            verification.errors.push('Facial: La imagen no coincide con tu perfil');
          }
        }
      }
    } else {
      verification.facial = true; // No requerido
      // Capturar foto si se proporciona aunque no sea requerida
      if (faceImage) {
        attendancePhoto = await sharp(faceImage.buffer).resize(200, 200).toBuffer();
      }
    }

    // DETERMINAR SI LA ASISTENCIA ES VÁLIDA
    const isValidAttendance = verification.qr && verification.location && verification.facial;

    // Si alguna verificación requerida falló, rechazar el registro
    if (!isValidAttendance && verification.errors.length > 0) {
      return res.status(403).json({
        error: 'No se pudo verificar tu asistencia',
        details: verification.errors,
        verification: verification
      });
    }

    // CREAR REGISTRO DE ASISTENCIA
    const attendance = new Attendance({
      user: req.user._id,
      event: event._id,
      checkIn: new Date(),
      isVerifiedByFacialRecognition: verification.facial,
      isLocationVerified: verification.location,
      isQRCodeVerified: verification.qr,
      location: latitude && longitude ? {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      } : undefined,
      distanceFromEvent: distanceFromEvent,
      qrCodeUsed: qrCode,
      qrCodeVerifiedAt: verification.qr ? new Date() : undefined,
      attendancePhoto: attendancePhoto,
      deviceInfo: deviceInfo,
      isValidAttendance: isValidAttendance
    });

    await attendance.save();

    // Agregar a la lista de asistentes del evento
    if (!event.attendees.includes(req.user._id)) {
      event.attendees.push(req.user._id);
      await event.save();
    }

    // Notificar a administradores
    try {
      await NotificationService.notifyAttendanceRegistered(
        req.user._id,
        event.name,
        isValidAttendance
      );
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.json({
      message: isValidAttendance
        ? 'Asistencia registrada y verificada exitosamente'
        : 'Asistencia registrada con verificaciones parciales',
      attendance,
      verification,
      isValid: isValidAttendance
    });
  } catch (err) {
    console.error('Error en registerAttendanceWithQRAndLocation:', err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener código QR del evento
exports.getEventQRCode = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Verificar si el usuario tiene permiso (solo creador o admin)
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para ver el código QR de este evento' });
    }

    // Verificar si necesita regenerar el QR
    if (QRService.needsRefresh(event)) {
      const qrData = await QRService.generateQRCode(event);
      event.currentQRCode = {
        code: qrData.code,
        generatedAt: qrData.generatedAt,
        expiresAt: qrData.expiresAt
      };
      await event.save();

      return res.json({
        qrCode: qrData.code,
        qrImage: qrData.image,
        generatedAt: qrData.generatedAt,
        expiresAt: qrData.expiresAt,
        refreshed: true
      });
    }

    // Generar imagen del QR actual
    const QRCode = require('qrcode');
    const qrImage = await QRCode.toDataURL(event.currentQRCode.code, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300
    });

    res.json({
      qrCode: event.currentQRCode.code,
      qrImage: qrImage,
      generatedAt: event.currentQRCode.generatedAt,
      expiresAt: event.currentQRCode.expiresAt,
      refreshed: false
    });
  } catch (err) {
    console.error('Error obteniendo QR:', err);
    res.status(500).json({ error: err.message });
  }
};

// Regenerar código QR manualmente
exports.refreshEventQRCode = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Verificar permisos
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para regenerar el código QR' });
    }

    // Generar nuevo QR
    const qrData = await QRService.generateQRCode(event);
    event.currentQRCode = {
      code: qrData.code,
      generatedAt: qrData.generatedAt,
      expiresAt: qrData.expiresAt
    };
    await event.save();

    res.json({
      message: 'Código QR regenerado exitosamente',
      qrCode: qrData.code,
      qrImage: qrData.image,
      generatedAt: qrData.generatedAt,
      expiresAt: qrData.expiresAt
    });
  } catch (err) {
    console.error('Error regenerando QR:', err);
    res.status(500).json({ error: err.message });
  }
};

// Registrar check-out (salida del evento)
exports.checkOutAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      user: req.user._id,
      event: req.params.id
    });

    if (!attendance) {
      return res.status(404).json({ error: 'No tienes registro de asistencia a este evento' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ error: 'Ya registraste tu salida de este evento' });
    }

    attendance.checkOut = new Date();

    // Validar tiempo mínimo de permanencia si está configurado
    const event = await Event.findById(req.params.id);
    if (event.minimumStayMinutes > 0) {
      const stayMinutes = (attendance.checkOut - attendance.checkIn) / 60000;
      if (stayMinutes < event.minimumStayMinutes) {
        attendance.isValidAttendance = false;
      }
    }

    await attendance.save();

    res.json({
      message: 'Check-out registrado exitosamente',
      attendance
    });
  } catch (err) {
    console.error('Error en check-out:', err);
    res.status(500).json({ error: err.message });
  }
};
