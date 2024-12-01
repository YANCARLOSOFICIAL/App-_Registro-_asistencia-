const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const multer = require('multer');

// Configuración de multer
const storage = multer.memoryStorage(); // Guardar en memoria para procesar directamente
const upload = multer({ storage });

// Ruta para registrar asistencia
router.post('/register', attendanceController.registerAttendance);

// Ruta para obtener todas las asistencias
router.get('/', attendanceController.getAllAttendance);

// Ruta para verificar asistencia mediante reconocimiento facial
router.post('/verify', upload.single('faceImage'), attendanceController.verifyAttendance);

module.exports = router;
