const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');


// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Inicializar la aplicación de Express
const app = express();
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Importar rutas
const userRoutes = require('./routes/usersRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const documentRoutes = require('./routes/documentRoutes');


// Usar las rutas
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/documents', documentRoutes);

// Configurar el puerto
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
