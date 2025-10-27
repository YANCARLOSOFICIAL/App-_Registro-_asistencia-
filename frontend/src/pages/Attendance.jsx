import React, { useEffect, useState } from 'react';

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEvents, setUserEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [adminEvents, setAdminEvents] = useState([]);
  const [loadingAdminEvents, setLoadingAdminEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterVerified, setFilterVerified] = useState("all");
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchAttendance();
    fetchUserEvents();
    if (isAdmin) {
      fetchAdminEvents();
    }
  }, [isAdmin]);

  // Descargar reportes (Excel / PDF)
  const downloadExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const qs = new URLSearchParams();
      if (startDate) qs.set('startDate', startDate);
      if (endDate) qs.set('endDate', endDate);
      const res = await fetch(`http://localhost:5000/api/reports/attendance.xlsx?${qs.toString()}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Error al generar el reporte');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'asistencias.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error de red al descargar el reporte');
    }
  };

  const downloadPdf = async () => {
    try {
      const token = localStorage.getItem('token');
      const qs = new URLSearchParams();
      if (startDate) qs.set('startDate', startDate);
      if (endDate) qs.set('endDate', endDate);
      const res = await fetch(`http://localhost:5000/api/reports/attendance.pdf?${qs.toString()}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Error al generar el reporte');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'asistencias.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error de red al descargar el reporte');
    }
  };

  const fetchAttendance = () => {
    fetch('http://localhost:5000/api/attendance')
      .then(res => res.json())
      .then(data => {
        setAttendance(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching attendance:', err);
        setLoading(false);
      });
  };

  const fetchUserEvents = () => {
    fetch('http://localhost:5000/api/attendance/events', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        return res.json();
      })
      .then(data => {
        setUserEvents(Array.isArray(data) ? data : []);
        setLoadingEvents(false);
      })
      .catch(err => {
        console.error('Error fetching user events:', err);
        setUserEvents([]);
        setLoadingEvents(false);
      });
  };

  const fetchAdminEvents = () => {
    fetch('http://localhost:5000/api/events', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        return res.json();
      })
      .then(data => {
        setAdminEvents(Array.isArray(data) ? data : []);
        setLoadingAdminEvents(false);
      })
      .catch(err => {
        console.error('Error fetching admin events:', err);
        setAdminEvents([]);
        setLoadingAdminEvents(false);
      });
  };

  // Filtrar eventos para admin
  const filteredAdminEvents = adminEvents.filter(event => {
    const matchesName = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const eventDate = new Date(event.date);
    const afterStart = startDate ? eventDate >= new Date(startDate) : true;
    const beforeEnd = endDate ? eventDate <= new Date(endDate) : true;
    return matchesName && afterStart && beforeEnd;
  });

  // Filtrar asistencias
  const filteredAttendance = attendance.filter(record => {
    const matchesVerified = filterVerified === 'all' || 
      (filterVerified === 'verified' && record.isVerifiedByFacialRecognition) ||
      (filterVerified === 'unverified' && !record.isVerifiedByFacialRecognition);
    return matchesVerified;
  });

  // Estadísticas
  const verifiedCount = attendance.filter(a => a.isVerifiedByFacialRecognition).length;
  const unverifiedCount = attendance.length - verifiedCount;
  const verificationRate = attendance.length > 0 
    ? ((verifiedCount / attendance.length) * 100).toFixed(1) 
    : 0;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Cargando asistencias...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--spacing-xl)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-md)'
      }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>
            ✓ Registro de Asistencias
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>
            {attendance.length} asistencia{attendance.length !== 1 ? 's' : ''} registrada{attendance.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Total Asistencias</div>
          <div className="stat-value">{attendance.length}</div>
        </div>
        
        <div className="stat-card stat-secondary">
          <div className="stat-icon">✓</div>
          <div className="stat-label">Verificadas</div>
          <div className="stat-value">{verifiedCount}</div>
        </div>
        
        <div className="stat-card stat-warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-label">Sin Verificar</div>
          <div className="stat-value">{unverifiedCount}</div>
        </div>
        
        <div className="stat-card stat-danger">
          <div className="stat-icon">📈</div>
          <div className="stat-label">Tasa Verificación</div>
          <div className="stat-value">{verificationRate}%</div>
        </div>
      </div>

      {/* Mis eventos */}
      {!isAdmin && (
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ margin: 0, marginBottom: 'var(--spacing-lg)', fontSize: 'var(--text-xl)' }}>
            📅 Mis Eventos Asistidos
          </h3>
          
          {loadingEvents ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
              <div className="spinner"></div>
            </div>
          ) : userEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h4 className="empty-state-title">No has asistido a eventos</h4>
              <p className="empty-state-description">
                Ve a la sección de Eventos para registrar tu asistencia
              </p>
            </div>
          ) : (
            <ul className="list">
              {userEvents.map(event => (
                <li key={event._id} className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">
                      {event.name}
                    </div>
                    <div className="list-item-subtitle">
                      {event.description} • {new Date(event.date).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <span className="badge badge-secondary">
                    Asistido
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Vista admin */}
      {isAdmin && (
        <>
          {/* Filtros */}
          <div className="filters-container">
            <h4 className="filters-title">Filtros de búsqueda</h4>
            <div className="filters-row">
              <div className="filter-group">
                <label className="form-label">🔍 Buscar evento</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre del evento..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label className="form-label">📅 Desde</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label className="form-label">📅 Hasta</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tabla de asistentes por evento */}
          <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h3 style={{ margin: 0, marginBottom: 'var(--spacing-lg)', fontSize: 'var(--text-xl)' }}>
              📋 Asistentes por Evento
            </h3>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn" onClick={downloadExcel}>⬇️ Descargar Excel</button>
                <button className="btn btn-outline" onClick={downloadPdf}>⬇️ Descargar PDF</button>
              </div>
            
            {loadingAdminEvents ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <div className="spinner"></div>
              </div>
            ) : filteredAdminEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h4 className="empty-state-title">No se encontraron eventos</h4>
                <p className="empty-state-description">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Fecha</th>
                      <th>Asistente</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminEvents.map(event => (
                      event.attendees && event.attendees.length > 0 ? (
                        event.attendees.map(att => (
                          <tr key={`${event._id}_${att._id}`}>
                            <td>
                              <strong style={{ color: 'var(--text-primary)' }}>
                                {event.name}
                              </strong>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>
                              {new Date(event.date).toLocaleDateString('es-ES')}
                            </td>
                            <td>{att.name}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>
                              {att.email}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr key={event._id}>
                          <td>
                            <strong style={{ color: 'var(--text-primary)' }}>
                              {event.name}
                            </strong>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {new Date(event.date).toLocaleDateString('es-ES')}
                          </td>
                          <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            Sin asistentes
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Todas las asistencias */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--spacing-lg)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)'
        }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>
            📝 Historial de Asistencias
          </h3>
          
          <select
            className="form-input"
            value={filterVerified}
            onChange={e => setFilterVerified(e.target.value)}
            style={{ width: 'auto', marginBottom: 0 }}
          >
            <option value="all">Todas</option>
            <option value="verified">Solo verificadas</option>
            <option value="unverified">Sin verificar</option>
          </select>
        </div>
        
        {filteredAttendance.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h4 className="empty-state-title">No hay asistencias</h4>
            <p className="empty-state-description">
              {filterVerified !== 'all' 
                ? 'No hay asistencias con este filtro' 
                : 'Aún no se han registrado asistencias'}
            </p>
          </div>
        ) : (
          <ul className="list">
            {filteredAttendance.map(record => (
              <li key={record._id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">
                    {record.user?.name || 'Usuario desconocido'}
                  </div>
                  <div className="list-item-subtitle">
                    {record.user?.email || 'Sin email'} • {' '}
                    {new Date(record.date).toLocaleString('es-ES')} • {' '}
                    {record.event ? (
                      <strong>{record.event.name || record.event}</strong>
                    ) : (
                      'Sin evento'
                    )}
                  </div>
                </div>
                <span className={`badge ${record.isVerifiedByFacialRecognition ? 'badge-secondary' : 'badge-danger'}`}>
                  {record.isVerifiedByFacialRecognition ? '✓ Verificado' : '⚠️ Sin verificar'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Información */}
      <div style={{
        marginTop: 'var(--spacing-xl)',
        padding: 'var(--spacing-lg)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color-dark)'
      }}>
        <h4 style={{ 
          fontSize: 'var(--text-base)', 
          marginBottom: 'var(--spacing-md)',
          color: 'var(--text-primary)'
        }}>
          ℹ️ Información
        </h4>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.8
        }}>
          <li>• Las asistencias verificadas usan reconocimiento facial</li>
          <li>• La tasa de verificación indica la seguridad del sistema</li>
          {isAdmin && <li>• Puedes exportar asistencias desde el Dashboard</li>}
          <li>• Para registrar asistencia, ve a la sección de Eventos</li>
        </ul>
      </div>
    </div>
  );
}

export default Attendance;
