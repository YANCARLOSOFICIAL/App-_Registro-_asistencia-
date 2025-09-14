const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  await mongoose.connect('mongodb://localhost/registro_asistencia');
  const email = 'admin@admin.com';
  const password = 'admin123';
  const name = 'Administrador';
  const role = 'admin';

  const exists = await User.findOne({ email });
  if (exists) {
    console.log('El usuario admin ya existe.');
    process.exit(0);
  }
  const hashed = await bcrypt.hash(password, 10);
  const admin = new User({ name, email, password: hashed, role });
  await admin.save();
  console.log('Usuario admin creado:', email, password);
  process.exit(0);
}

createAdmin();
