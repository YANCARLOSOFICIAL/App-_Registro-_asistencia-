const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const { authenticate, requireRole, requireSelfOrAdmin } = require('../middleware/auth');

// Configurar Multer para almacenar la imagen en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Login de usuario
router.post('/login', userController.loginUser);
// Login por imagen facial
router.post('/login-facial', upload.single('faceImage'), userController.loginFacial);

// Ruta para registrar al usuario con su imagen de rostro
router.post('/register', upload.single('faceImage'), userController.registerUser);

// Editar usuario (solo admin o el propio usuario)
router.put('/:id', authenticate, requireSelfOrAdmin, userController.updateUser);

// Eliminar usuario (solo admin o el propio usuario)
router.delete('/:id', authenticate, requireSelfOrAdmin, userController.deleteUser);

// Ruta para verificar la asistencia del usuario (comparando el rostro)
router.post('/verify-attendance', upload.single('faceImage'), userController.verifyAttendance);

// Obtener todos los usuarios
router.get('/', userController.getAllUsers);

module.exports = router;
