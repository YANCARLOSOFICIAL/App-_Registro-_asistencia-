const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

// Crear evento (solo admin)
router.post('/', auth.authenticate, eventController.createEvent);
// Listar eventos
router.get('/', auth.authenticate, eventController.getEvents);
// Registrar asistencia a evento
router.post('/:id/attend', auth.authenticate, eventController.registerAttendance);

module.exports = router;
