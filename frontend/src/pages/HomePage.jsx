import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Bienvenido al Sistema de Gestión</h1>
      <ul>
        <li><Link to="/users">Gestión de Usuarios</Link></li>
        <li><Link to="/attendance">Asistencia</Link></li>
        <li><Link to="/documents">Documentos</Link></li>
      </ul>
    </div>
  );
};

export default HomePage;
