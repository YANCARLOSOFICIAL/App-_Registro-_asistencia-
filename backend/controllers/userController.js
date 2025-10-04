// Login por imagen facial
exports.loginFacial = async (req, res) => {
    const faceImage = req.file;
    if (!faceImage) return res.status(400).json({ error: 'Imagen de rostro requerida' });
    try {
        const users = await User.find({ faceImage: { $ne: null } });
        let matchedUser = null;
        for (const user of users) {
            if (user.faceImage) {
                const userImageBuffer = Buffer.from(user.faceImage, 'base64');
                const capturedImageBuffer = await require('sharp')(faceImage.buffer).resize(200, 200).toBuffer();
                if (capturedImageBuffer.equals(userImageBuffer)) {
                    matchedUser = user;
                    break;
                }
            }
        }
        if (!matchedUser) return res.status(401).json({ error: 'No coincide ninguna imagen registrada' });
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: matchedUser._id, role: matchedUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' });
        res.json({ token, user: { id: matchedUser._id, name: matchedUser.name, email: matchedUser.email, role: matchedUser.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const jwt = require('jsonwebtoken');
// Login de usuario
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
        const valid = await require('bcryptjs').compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Editar usuario
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        // Obtener el usuario actual de la base de datos
        const existingUser = await User.findById(req.params.id);
        if (!existingUser) return res.status(404).json({ error: 'Usuario no encontrado' });
        // Si el solicitante no es admin, no permitir cambiar el rol
        if (req.user.role !== 'admin' && role && role !== existingUser.role) {
            return res.status(403).json({ error: 'Solo un administrador puede cambiar el rol' });
        }
        const updatedData = { name, email };
        // Solo admin puede actualizar el rol
        if (req.user.role === 'admin' && role) {
            updatedData.role = role;
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario actualizado', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'name email role');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
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
