const Document = require('../models/Document');

// Subir un documento
exports.uploadDocument = async (req, res) => {
    const { title, description } = req.body;

    try {
        const document = new Document({
            title,
            description,
            file: req.file.buffer,  // Guardar el archivo como Buffer
            fileType: req.file.mimetype
        });

        await document.save();
        res.status(201).json({ message: 'Documento subido con éxito', document });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los documentos
exports.getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find();
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Descargar un documento por ID
exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }

        // Configurar encabezados para servir el archivo
        res.set('Content-Type', document.fileType);
        res.send(document.file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
