const Attendance = require('../models/Attendance');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

    // Header: logo (if exists), title and period
    const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
    const hasLogo = fs.existsSync(logoPath);
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 40;

    // Draw logo if available
    let cursorY = margin;
    if (hasLogo) {
      try {
        doc.image(logoPath, margin, cursorY, { width: 60 });
      } catch (e) {
        // ignore image errors
      }
    }

    // Title
    const titleX = hasLogo ? margin + 70 : margin;
    doc.font('Helvetica-Bold').fontSize(18).text('Reporte de Asistencias', titleX, cursorY, {
      align: 'left'
    });

    // Date range subtitle
    const start = req.query.startDate || '';
    const end = req.query.endDate || '';
    const periodText = start || end ? `Periodo: ${start || '...'} — ${end || '...'}` : `Generado: ${new Date().toLocaleString()}`;
    doc.font('Helvetica').fontSize(10).fillColor('#444').text(periodText, titleX, cursorY + 22, { align: 'left' });

    cursorY = Math.max(cursorY + 50, 110);

    // Table setup
    const tableTop = cursorY;
    const colX = margin;
    const colWidths = [140, 140, 140, 90, 60]; // usuario, email, evento, fecha, verif
    const cols = ['Usuario', 'Email', 'Evento', 'Fecha', 'Verificado'];

    const rowSpacing = 8;
    const usableWidth = pageWidth - margin * 2;

    // Draw table header background
    doc.fillColor('#f0f0f0').rect(margin, tableTop, usableWidth, 24).fill();
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(10);

    // Column x positions
    const colPositions = [colX];
    for (let i = 0; i < colWidths.length - 1; i++) colPositions.push(colPositions[i] + colWidths[i]);

    // Header texts
    for (let i = 0; i < cols.length; i++) {
      doc.text(cols[i], colPositions[i] + 4, tableTop + 6, { width: colWidths[i] - 8 });
    }

    // Horizontal line under header
    doc.moveTo(margin, tableTop + 28).lineTo(pageWidth - margin, tableTop + 28).strokeColor('#e0e0e0').stroke();

    let y = tableTop + 36;
    let page = 1;

    const footer = (p) => {
      const footerY = pageHeight - margin + 10;
      doc.font('Helvetica').fontSize(9).fillColor('#666');
      doc.text(`Página ${p}`, margin, footerY, { align: 'right', width: pageWidth - margin * 2 });
    };

    // Iterate rows with wrapping and pagination
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const colTexts = [r.user?.name || 'N/A', r.user?.email || 'N/A', r.event?.name || (r.event || 'N/A'), r.date ? new Date(r.date).toLocaleString() : '', r.isVerifiedByFacialRecognition ? 'Sí' : 'No'];

      // Calculate row height based on wrapped text
      let maxHeight = 0;
      for (let c = 0; c < colTexts.length; c++) {
        const h = doc.heightOfString(String(colTexts[c]), { width: colWidths[c] - 8, align: 'left' });
        if (h > maxHeight) maxHeight = h;
      }
      const rowHeight = Math.max(18, maxHeight + rowSpacing);

      // Check for page break
      if (y + rowHeight > pageHeight - margin - 30) {
        // draw footer for current page
        footer(page);
        doc.addPage();
        page += 1;
        // redraw header on new page
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000');
        doc.fillColor('#f0f0f0').rect(margin, margin, usableWidth, 24).fill();
        for (let k = 0; k < cols.length; k++) {
          doc.fillColor('#000').text(cols[k], colPositions[k] + 4, margin + 6, { width: colWidths[k] - 8 });
        }
        doc.moveTo(margin, margin + 28).lineTo(pageWidth - margin, margin + 28).strokeColor('#e0e0e0').stroke();
        y = margin + 36;
      }

      // Draw row background alternating
      if (i % 2 === 0) {
        doc.fillColor('#ffffff').rect(margin, y - 6, usableWidth, rowHeight).fill();
      } else {
        doc.fillColor('#fbfbfb').rect(margin, y - 6, usableWidth, rowHeight).fill();
      }

      // Draw texts
      doc.font('Helvetica').fontSize(10).fillColor('#111');
      for (let c = 0; c < colTexts.length; c++) {
        doc.text(String(colTexts[c]), colPositions[c] + 4, y - 2, { width: colWidths[c] - 8 });
      }

      // Divider line
      doc.moveTo(margin, y + rowHeight - 6).lineTo(pageWidth - margin, y + rowHeight - 6).strokeColor('#f0f0f0').stroke();

      y += rowHeight;
    }

    // Footer for last page
    footer(page);

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
