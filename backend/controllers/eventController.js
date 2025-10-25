const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const sharp = require('sharp');

// Crear evento
exports.createEvent = async (req, res) => {
  try {
    const { name, description, date } = req.body;
    
    // Validación básica
    if (!name || !date) {
      return res.status(400).json({ error: 'Nombre y fecha son requeridos' });
    }
    
    const event = new Event({
      name,
      description,
      date,
      createdBy: req.user._id
    });
    await event.save();
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
    
    // Crear registro de asistencia
    const attendance = new Attendance({
      user: req.user._id,
      event: event._id,
      isVerifiedByFacialRecognition: false
    });
    await attendance.save();
    
    // Agregar a la lista de asistentes del evento
    if (!event.attendees.includes(req.user._id)) {
      event.attendees.push(req.user._id);
      await event.save();
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
        isVerifiedByFacialRecognition: false
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
      isVerifiedByFacialRecognition: true
    });
    await attendance.save();
    
    // Agregar a la lista de asistentes del evento
    if (!event.attendees.includes(req.user._id)) {
      event.attendees.push(req.user._id);
      await event.save();
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
