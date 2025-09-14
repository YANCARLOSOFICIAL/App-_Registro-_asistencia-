const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token y rol
exports.authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ error: 'Usuario no encontrado' });
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

exports.requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};

exports.requireSelfOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user._id.toString() === req.params.id) {
    return next();
  }
  return res.status(403).json({ error: 'Solo puedes modificar tu propia información' });
};
