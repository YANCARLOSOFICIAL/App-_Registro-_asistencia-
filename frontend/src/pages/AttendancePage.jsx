import React, { useState, useEffect } from 'react';
import { get } from '../services/api';

const AttendancePage = () => {
  const [attendances, setAttendances] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await get('attendance');
        setAttendances(data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div>
      <h2>Asistencia</h2>
      <ul>
        {attendances.map(record => (
          <li key={record._id}>
            Usuario: {record.user.name} | Verificado: {record.isVerifiedByFacialRecognition ? 'Sí' : 'No'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendancePage;
