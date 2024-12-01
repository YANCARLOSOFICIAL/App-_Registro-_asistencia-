const mongoose = require('mongoose');

// Esquema del Usuario
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    faceImage: { type: Buffer },  // Imagen de rostro almacenada como Buffer
    role: { type: String, default: 'user' }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
