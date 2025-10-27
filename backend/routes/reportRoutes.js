const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

// Reportes de asistencia
// GET /api/reports/attendance.xlsx?startDate=&endDate=&eventId=
router.get('/attendance.xlsx', auth.authenticate, reportController.attendanceExcel);
// GET /api/reports/attendance.pdf?startDate=&endDate=&eventId=
router.get('/attendance.pdf', auth.authenticate, reportController.attendancePdf);

module.exports = router;
