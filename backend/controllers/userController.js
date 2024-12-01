const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const imageHash = require('image-hash');

// Controlador para registrar un usuario
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Cifrar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Procesar y almacenar la imagen de rostro (si fue cargada)
        let faceImageBuffer = null;
        if (req.file) {
            faceImageBuffer = await sharp(req.file.buffer)
                .resize(200, 200) // Redimensionar a 200x200 px
                .toBuffer();
        }

        // Crear un nuevo usuario
        const user = new User({
            name,
            email,
            password: hashedPassword,
            faceImage: faceImageBuffer // Almacenamos el Buffer de la imagen
        });

        // Guardar en la base de datos
        await user.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controlador para obtener la imagen de perfil de un usuario
exports.getProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.profileImage) {
            return res.status(404).json({ message: 'Imagen no encontrada' });
        }

        // Configurar el tipo de contenido como imagen
        res.set('Content-Type', 'image/jpeg');  // o 'image/png'
        res.send(user.profileImage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controlador para verificar la asistencia del usuario usando su rostro
exports.verifyAttendance = async (req, res) => {
    const { userId, faceImage } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || !user.faceImagePath) {
            return res.status(404).json({ message: 'Usuario o imagen de rostro no encontrada' });
        }

        // Guardamos la imagen temporal en el servidor
        const tempFaceImagePath = path.join('uploads', `${userId}-temp-face.png`);
        await sharp(faceImage)
            .resize(200, 200)
            .toFile(tempFaceImagePath);

        // Comparamos la imagen del rostro capturada con la registrada
        imageHash.hash(tempFaceImagePath, 16, true, async (error, hashCaptured) => {
            if (error) {
                return res.status(500).json({ message: 'Error al procesar la imagen' });
            }

            const hashRegistered = await imageHash.hash(user.faceImagePath, 16, true);

            if (hashCaptured === hashRegistered) {
                res.status(200).json({ message: 'Asistencia verificada correctamente' });
            } else {
                res.status(400).json({ message: 'Verificación facial fallida' });
            }

            // Eliminamos la imagen temporal
            fs.unlinkSync(tempFaceImagePath);
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al verificar la asistencia', error: error.message });
    }
};
