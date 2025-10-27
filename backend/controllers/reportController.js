const Attendance = require('../models/Attendance');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Helper para construir filtro por query params
function buildFilter(query) {
  const { startDate, endDate, eventId } = query;
  const filter = {};
  if (eventId) filter.event = eventId;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  return filter;
}

exports.attendanceExcel = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const records = await Attendance.find(filter)
      .populate('user', 'name email')
      .populate('event', 'name date')
      .lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Asistencias');

    sheet.columns = [
      { header: 'Usuario', key: 'user', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Evento', key: 'event', width: 30 },
      { header: 'Fecha de asistencia', key: 'date', width: 25 },
      { header: 'Verificado facial', key: 'verified', width: 15 }
    ];

    records.forEach(r => {
      sheet.addRow({
        user: r.user?.name || 'N/A',
        email: r.user?.email || 'N/A',
        event: r.event?.name || (r.event || 'N/A'),
        date: r.date ? new Date(r.date).toLocaleString() : '',
        verified: r.isVerifiedByFacialRecognition ? 'Sí' : 'No'
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="asistencias.xlsx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.attendancePdf = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const records = await Attendance.find(filter)
      .populate('user', 'name email')
      .populate('event', 'name date')
      .lean();

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="asistencias.pdf"');
      res.send(pdfData);
    });

    doc.fontSize(18).text('Reporte de Asistencias', { align: 'center' });
    doc.moveDown();

    // Header row
    doc.fontSize(10);
    const tableTop = doc.y;
    const itemHeight = 20;

    // Columns positions
    const colUser = 40;
    const colEmail = 200;
    const colEvent = 360;
    const colDate = 480;
    const colVerified = 560;

    doc.text('Usuario', colUser, tableTop, { bold: true });
    doc.text('Email', colEmail, tableTop);
    doc.text('Evento', colEvent, tableTop);
    doc.text('Fecha', colDate, tableTop);
    doc.text('Verif.', colVerified, tableTop);

    doc.moveDown();

    records.forEach((r, i) => {
      const y = tableTop + (i + 1) * itemHeight;
      doc.text(r.user?.name || 'N/A', colUser, y, { width: 150 });
      doc.text(r.user?.email || 'N/A', colEmail, y, { width: 150 });
      doc.text(r.event?.name || (r.event || 'N/A'), colEvent, y, { width: 120 });
      doc.text(r.date ? new Date(r.date).toLocaleString() : '', colDate, y, { width: 80 });
      doc.text(r.isVerifiedByFacialRecognition ? 'Sí' : 'No', colVerified, y);
      // Add page if near bottom
      if (y > doc.page.height - 80) doc.addPage();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
