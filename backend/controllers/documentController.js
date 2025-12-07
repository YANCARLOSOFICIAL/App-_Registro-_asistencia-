const Document = require('../models/Document');
const NotificationService = require('../services/notificationService');

// Subir un documento
exports.uploadDocument = async (req, res) => {
    const { title, description } = req.body;

    try {
        const document = new Document({
            title,
            description,
            file: req.file.buffer,  // Guardar el archivo como Buffer
            fileType: req.file.mimetype,
            uploadedBy: req.user._id  // Agregar el usuario que subió el documento
        });

        await document.save();

        // Notificar a todos los usuarios sobre el nuevo documento
        try {
            await NotificationService.notifyDocumentUploaded(
                title,
                document._id,
                req.user._id
            );
        } catch (notifError) {
            console.error('Error sending notification:', notifError);
        }

        res.status(201).json({ message: 'Documento subido con éxito', document });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los documentos
exports.getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find().populate('uploadedBy', 'name email');
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

// Actualizar un documento (admin o dueño del documento)
exports.updateDocument = async (req, res) => {
    const { title, description } = req.body;

    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }

        // Verificar permisos: solo el dueño del documento o admin pueden editar
        const ownerId = document.uploadedBy ? document.uploadedBy.toString() : null;
        const requesterId = req.user && req.user._id ? req.user._id.toString() : null;
        if (ownerId !== requesterId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para editar este documento' });
        }

        // Si por alguna razón histórica el documento no tiene `uploadedBy`, asignarlo
        // al usuario que realiza la petición para evitar el error de validación.
        if (!document.uploadedBy) {
            document.uploadedBy = req.user._id;
        }

        // Actualizar campos
        if (title) document.title = title;
        if (description !== undefined) document.description = description;

        // Si se proporciona un nuevo archivo, actualizarlo
        if (req.file) {
            document.file = req.file.buffer;
            document.fileType = req.file.mimetype;
        }

        await document.save();

        res.status(200).json({ message: 'Documento actualizado con éxito', document });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un documento (admin o dueño del documento)
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }

        // Verificar permisos: solo el dueño del documento o admin pueden eliminar
        const ownerIdDel = document.uploadedBy ? document.uploadedBy.toString() : null;
        const requesterIdDel = req.user && req.user._id ? req.user._id.toString() : null;
        if (ownerIdDel !== requesterIdDel && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este documento' });
        }

        await Document.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Documento eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
