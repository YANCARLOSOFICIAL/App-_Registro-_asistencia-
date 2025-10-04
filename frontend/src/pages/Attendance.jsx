import React, { useEffect, useState } from 'react';

function Attendance() {
  const [faceImage, setFaceImage] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEvents, setUserEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const [adminEvents, setAdminEvents] = useState([]);
  const [loadingAdminEvents, setLoadingAdminEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError("");
    setVerifySuccess("");
    // Validación
    if (!faceImage || !faceImage.type.startsWith("image/")) {
      setVerifyError("Debes seleccionar una imagen válida");
      setVerifying(false);
      return;
    }
    const formData = new FormData();
    formData.append("faceImage", faceImage);
    try {
      const res = await fetch("http://localhost:5000/api/attendance/verify", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setVerifySuccess(data.message || "Asistencia verificada correctamente");
      } else {
        setVerifyError(data.message || "Error al verificar asistencia");
      }
    } catch (err) {
      setVerifyError("Error de red");
    }
    setVerifying(false);
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/attendance')
      .then(res => res.json())
      .then(data => {
        setAttendance(data);
        setLoading(false);
      });
    // Obtener eventos a los que ha asistido el usuario
    fetch('http://localhost:5000/api/attendance/events', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => {
        setUserEvents(data);
        setLoadingEvents(false);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/attendance')
      .then(res => res.json())
      .then(data => {
        setAttendance(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Fetch events with attendees for admin view
    if (isAdmin) {
      fetch('http://localhost:5000/api/events', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      })
        .then(res => res.json())
        .then(data => {
          setAdminEvents(data);
          setLoadingAdminEvents(false);
        })
        .catch(() => setLoadingAdminEvents(false));
    }
  }, [isAdmin]);

  // Filtrar eventos para admin según búsqueda y rango de fechas
  const filteredAdminEvents = adminEvents.filter(event => {
    const matchesName = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const eventDate = new Date(event.date);
    const afterStart = startDate ? eventDate >= new Date(startDate) : true;
    const beforeEnd = endDate ? eventDate <= new Date(endDate) : true;
    return matchesName && afterStart && beforeEnd;
  });

  return (
    <div>
      <h2>Asistencias</h2>
      {/* El formulario de registro facial solo debe ir en la vista de eventos */}
      {loading ? <p>Cargando asistencias...</p> : (
        <ul>
          {attendance.map(record => (
            <li key={record._id}>
              {record.user?.name || 'Sin nombre'} - {record.isVerifiedByFacialRecognition ? 'Verificado' : 'No verificado'}
              {record.event && (
                <span> | Evento: <strong>{record.event.name || record.event}</strong></span>
              )}
            </li>
          ))}
        </ul>
      )}
      {isAdmin && (
        <>
          <h3>Asistentes por evento (admin)</h3>
          {/* Filtros de búsqueda */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Buscar por nombre de evento"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ marginRight: '0.5rem', padding: '0.4rem' }}
            />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ marginRight: '0.5rem' }}
            />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          {loadingAdminEvents ? <p>Cargando eventos y asistentes...</p> : (
            // Renderizar como tabla
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Evento</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Fecha</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Asistente</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdminEvents.map(event => (
                  event.attendees && event.attendees.length > 0 ? (
                    event.attendees.map(att => (
                      <tr key={event._id + '_' + att._id}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{event.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(event.date).toLocaleDateString()}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{att.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{att.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr key={event._id}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{event.name}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(event.date).toLocaleDateString()}</td>
                      <td colSpan={2} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Sin asistentes</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      <h3>Eventos a los que has asistido</h3>
      {loadingEvents ? <p>Cargando eventos...</p> : (
        <ul>
          {userEvents.map(event => (
            <li key={event._id}><strong>{event.name}</strong> - {event.description} - {new Date(event.date).toLocaleDateString()}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Attendance;
