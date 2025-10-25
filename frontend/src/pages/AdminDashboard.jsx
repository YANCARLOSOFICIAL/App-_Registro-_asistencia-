import React, { useEffect, useState, useRef } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

function exportAttendanceCSV(attendance) {
  if (!attendance || attendance.length === 0) return;
  
  const header = ['Fecha', 'Usuario', 'Email', 'Evento', 'Verificado'];
  const rows = attendance.map(a => [
    new Date(a.date).toLocaleString(),
    a.user?.name || '',
    a.user?.email || '',
    a.event?.name || 'Sin evento',
    a.isVerifiedByFacialRecognition ? 'Sí' : 'No'
  ]);
  
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `asistencias_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, attendance: 0, documents: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceRaw, setAttendanceRaw] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, attRes, docRes, eventsRes] = await Promise.all([
        fetch('http://localhost:5000/api/users'),
        fetch('http://localhost:5000/api/attendance'),
        fetch('http://localhost:5000/api/documents'),
        fetch('http://localhost:5000/api/events', {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })
      ]);
      
      const users = await usersRes.json();
      const attendance = await attRes.json();
      const documents = await docRes.json();
      const events = await eventsRes.json();
      
      setStats({
        users: users.length,
        attendance: attendance.length,
        documents: documents.length,
        events: events.length
      });
      
      setAttendanceRaw(attendance);
      
      // Procesar asistencias por día (últimos 7 días)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
      }
      
      const attCounts = {};
      last7Days.forEach(day => attCounts[day] = 0);
      
      attendance.forEach(a => {
        const date = new Date(a.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
        if (attCounts[date] !== undefined) {
          attCounts[date]++;
        }
      });
      
      setAttendanceData(Object.entries(attCounts));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats({ users: 0, attendance: 0, documents: 0, events: 0 });
      setAttendanceData([]);
      setAttendanceRaw([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!chartRef.current || attendanceData.length === 0) return;
    
    // Destruir gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: attendanceData.map(([date]) => date),
        datasets: [{
          label: 'Asistencias',
          data: attendanceData.map(([_, count]) => count),
          backgroundColor: 'rgba(100, 108, 255, 0.8)',
          borderColor: 'rgba(100, 108, 255, 1)',
          borderWidth: 2,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Asistencias de los últimos 7 días',
            color: 'rgba(255, 255, 255, 0.87)',
            font: {
              size: 16,
              weight: '600'
            },
            padding: {
              bottom: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderColor: 'rgba(100, 108, 255, 0.5)',
            borderWidth: 1,
            titleColor: 'white',
            bodyColor: 'white',
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} asistencia${context.parsed.y !== 1 ? 's' : ''}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              stepSize: 1
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            grid: {
              display: false
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [attendanceData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Cargando estadísticas...</p>
      </div>
    );
  }

  // Calcular estadísticas adicionales
  const verifiedAttendance = attendanceRaw.filter(a => a.isVerifiedByFacialRecognition).length;
  const verificationRate = attendanceRaw.length > 0 
    ? ((verifiedAttendance / attendanceRaw.length) * 100).toFixed(1)
    : 0;

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
            📊 Panel de Administración
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>
            Resumen general del sistema
          </p>
        </div>
        
        <button 
          onClick={() => exportAttendanceCSV(attendanceRaw)}
          className="btn btn-primary"
          disabled={attendanceRaw.length === 0}
        >
          📥 Exportar asistencias
        </button>
      </div>

      {/* Stats cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Total Usuarios</div>
          <div className="stat-value">{stats.users}</div>
        </div>
        
        <div className="stat-card stat-secondary">
          <div className="stat-icon">✓</div>
          <div className="stat-label">Total Asistencias</div>
          <div className="stat-value">{stats.attendance}</div>
        </div>
        
        <div className="stat-card stat-warning">
          <div className="stat-icon">📄</div>
          <div className="stat-label">Total Documentos</div>
          <div className="stat-value">{stats.documents}</div>
        </div>
        
        <div className="stat-card stat-danger">
          <div className="stat-icon">📅</div>
          <div className="stat-label">Total Eventos</div>
          <div className="stat-value">{stats.events}</div>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div style={{
        background: 'var(--bg-card)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--spacing-xl)',
        border: '1px solid var(--border-color-dark)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ 
          fontSize: 'var(--text-lg)', 
          marginBottom: 'var(--spacing-md)',
          color: 'var(--text-primary)'
        }}>
          📈 Métricas de Rendimiento
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-lg)'
        }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-xs)' }}>
              Asistencias verificadas
            </div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: '700', color: 'var(--secondary)' }}>
              {verifiedAttendance} / {stats.attendance}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginTop: 'var(--spacing-xs)' }}>
              {verificationRate}% tasa de verificación
            </div>
          </div>
          
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-xs)' }}>
              Promedio usuarios/evento
            </div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: '700', color: 'var(--primary)' }}>
              {stats.events > 0 ? (stats.attendance / stats.events).toFixed(1) : 0}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginTop: 'var(--spacing-xs)' }}>
              Asistentes por evento
            </div>
          </div>
          
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-xs)' }}>
              Documentos por usuario
            </div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: '700', color: 'var(--warning)' }}>
              {stats.users > 0 ? (stats.documents / stats.users).toFixed(1) : 0}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginTop: 'var(--spacing-xs)' }}>
              Promedio general
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div style={{
        background: 'var(--bg-card)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color-dark)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ height: '350px', position: 'relative' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Información adicional */}
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
          ℹ️ Información del Sistema
        </h4>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.8
        }}>
          <li>• Las estadísticas se actualizan en tiempo real</li>
          <li>• El gráfico muestra las asistencias de los últimos 7 días</li>
          <li>• Puedes exportar todas las asistencias a CSV para análisis detallado</li>
          <li>• La tasa de verificación facial mide la seguridad del sistema</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;
