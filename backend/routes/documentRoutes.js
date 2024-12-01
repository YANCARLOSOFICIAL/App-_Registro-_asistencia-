const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/documentController');

// Configurar Multer para manejar los archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Subir un nuevo documento
router.post('/upload', upload.single('file'), documentController.uploadDocument);

// Obtener todos los documentos
router.get('/', documentController.getAllDocuments);

// Descargar un documento por ID
router.get('/:id/download', documentController.getDocumentById);

module.exports = router;
