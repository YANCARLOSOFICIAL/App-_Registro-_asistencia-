const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');

// Configurar Multer para almacenar la imagen en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para registrar al usuario con su imagen de rostro
router.post('/register', upload.single('faceImage'), userController.registerUser);

// Ruta para verificar la asistencia del usuario (comparando el rostro)
router.post('/verify-attendance', upload.single('faceImage'), userController.verifyAttendance);

module.exports = router;
