const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    file: { type: Buffer, required: true },  // Documento en formato binario
    fileType: { type: String, required: true },  // Tipo de archivo (pdf, docx, etc.)
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Usuario que subió el documento
    uploadedAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', DocumentSchema);
module.exports = Document;
