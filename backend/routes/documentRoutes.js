const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');

// Configurar Multer para manejar los archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Subir un nuevo documento (cualquier usuario autenticado)
router.post('/upload', auth.authenticate, upload.single('file'), documentController.uploadDocument);

// Obtener todos los documentos (requiere autenticación)
router.get('/', auth.authenticate, documentController.getAllDocuments);

// Descargar un documento por ID (requiere autenticación)
router.get('/:id/download', auth.authenticate, documentController.getDocumentById);

// Actualizar un documento (dueño del documento o admin)
router.put('/:id', auth.authenticate, upload.single('file'), documentController.updateDocument);

// Eliminar un documento (dueño del documento o admin)
router.delete('/:id', auth.authenticate, documentController.deleteDocument);

module.exports = router;
