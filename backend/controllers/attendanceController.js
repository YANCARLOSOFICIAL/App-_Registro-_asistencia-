// Listar eventos a los que ha asistido el usuario
const Event = require('../models/Event');
exports.getUserEvents = async (req, res) => {
    try {
        const events = await Event.find({ attendees: req.user._id });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const fs = require('fs');
const sharp = require('sharp');
const imageHash = require('image-hash');
const path = require('path');

// Registrar asistencia de un usuario
exports.registerAttendance = async (req, res) => {
    const { userId, isVerifiedByFacialRecognition } = req.body;
    
    try {
        const attendance = new Attendance({
            user: userId,
            isVerifiedByFacialRecognition
        });
        
        await attendance.save();
        res.status(201).json({ message: 'Asistencia registrada exitosamente', attendance });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener la asistencia de todos los usuarios
exports.getAllAttendance = async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find().populate('user', 'name email');
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verificación facial para registrar la asistencia
exports.verifyAttendance = async (req, res) => {
    console.log('Endpoint /attendance/verify alcanzado');
    const faceImage = req.file;

    try {
        if (!faceImage) {
            return res.status(400).json({ message: 'Imagen de rostro no proporcionada' });
        }

        const users = await User.find(); // Obtener todos los usuarios con imágenes registradas
        let matchedUser = null;

        for (const user of users) {
            if (user.faceImage) {
                const userImageBuffer = Buffer.from(user.faceImage, 'base64');
                const capturedImageBuffer = await sharp(faceImage.buffer).resize(200, 200).toBuffer();

                if (capturedImageBuffer.equals(userImageBuffer)) {
                    matchedUser = user;
                    break;
                }
            }
        }

        if (!matchedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Registrar la asistencia
        const attendance = new Attendance({
            user: matchedUser._id,
            isVerifiedByFacialRecognition: true,
            event: req.body.eventId || req.body.event || null
        });

        await attendance.save();
        res.status(200).json({
            message: 'Asistencia verificada correctamente',
            user: { id: matchedUser._id, name: matchedUser.name },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar la asistencia', error: error.message });
    }
};
