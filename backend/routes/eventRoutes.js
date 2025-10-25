const express = require('express');
const router = express.Router();
const multer = require('multer');
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

// Configurar Multer para almacenar la imagen en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

// Crear evento (solo admin)
router.post('/', auth.authenticate, eventController.createEvent);
// Listar eventos
router.get('/', auth.authenticate, eventController.getEvents);
// Registrar asistencia a evento (simple, sin foto)
router.post('/:id/attend', auth.authenticate, eventController.registerAttendance);
// Registrar asistencia a evento con verificación facial
router.post('/:id/attend-facial', auth.authenticate, upload.single('faceImage'), eventController.registerAttendanceWithFacial);

module.exports = router;
