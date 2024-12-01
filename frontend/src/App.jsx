import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Asegúrate de importar el Navbar
import RegisterUser from './components/User/RegisterUser';
import RegisterAttendance from './components/Attendance/RegisterAttendance';
import UploadDocument from './components/Documents/UploadDocument';

const App = () => {
  return (
    <>
      <Navbar /> {/* Agregamos el Navbar aquí */}
      <Routes>
        <Route path="/" element={<h1>Bienvenido a la aplicación</h1>} />
        <Route path="/users/register" element={<RegisterUser />} />
        <Route path="/attendance/register" element={<RegisterAttendance />} />
        <Route path="/documents/upload" element={<UploadDocument />} />
      </Routes>
    </>
  );
};

export default App;
