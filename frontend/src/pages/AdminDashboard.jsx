import React, { useEffect, useState } from 'react';
function exportAttendanceCSV(attendance) {
  if (!attendance || attendance.length === 0) return;
  const header = ['Fecha', 'Usuario', 'Email', 'Verificado'];
  const rows = attendance.map(a => [
    new Date(a.date).toLocaleString(),
    a.user?.name || '',
    a.user?.email || '',
    a.isVerifiedByFacialRecognition ? 'Sí' : 'No'
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte_asistencias.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';
import { useRef } from 'react';
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip);

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, attendance: 0, documents: 0 });
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [attendanceRaw, setAttendanceRaw] = useState([]);
  const chartRef = useRef(null);
  const usersChartRef = useRef(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, attRes, docRes] = await Promise.all([
          fetch('http://localhost:5000/api/users'),
          fetch('http://localhost:5000/api/attendance'),
          fetch('http://localhost:5000/api/documents'),
        ]);
        const users = await usersRes.json();
        const attendance = await attRes.json();
        const documents = await docRes.json();
        setStats({
          users: users.length,
          attendance: attendance.length,
          documents: documents.length,
        });
        setAttendanceRaw(attendance);
        // Procesar asistencias por día
        const attCounts = {};
        attendance.forEach(a => {
          const date = new Date(a.date).toLocaleDateString();
          attCounts[date] = (attCounts[date] || 0) + 1;
        });
        setAttendanceData(Object.entries(attCounts));
        // Procesar usuarios registrados por día
        const userCounts = {};
        users.forEach(u => {
          const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Sin fecha';
          userCounts[date] = (userCounts[date] || 0) + 1;
        });
        setUsersData(Object.entries(userCounts));
      } catch {
        setStats({ users: 0, attendance: 0, documents: 0 });
        setAttendanceData([]);
        setAttendanceRaw([]);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  useEffect(() => {
    if (!chartRef.current || attendanceData.length === 0) return;
    const ctx = chartRef.current.getContext('2d');
    if (ctx._chart) ctx._chart.destroy();
    ctx._chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: attendanceData.map(([date]) => date),
        datasets: [{
          label: 'Asistencias por día',
          data: attendanceData.map(([_, count]) => count),
          backgroundColor: '#646cff',
        }],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Asistencias por día' },
        },
      },
    });
  }, [attendanceData]);

  return (
    <div style={{marginBottom: '2em'}}>
      <h2>Panel Administrativo</h2>
      {loading ? <p>Cargando estadísticas...</p> : (
        <div style={{display:'flex',justifyContent:'center',gap:'2em'}}>
          <div style={{background:'#222',padding:'2em',borderRadius:'10px',color:'#fff'}}>
            <h3>Usuarios</h3>
            <p style={{fontSize:'2em',fontWeight:'bold'}}>{stats.users}</p>
          </div>
          <div style={{background:'#222',padding:'2em',borderRadius:'10px',color:'#fff'}}>
            <h3>Asistencias</h3>
            <p style={{fontSize:'2em',fontWeight:'bold'}}>{stats.attendance}</p>
          </div>
          <div style={{background:'#222',padding:'2em',borderRadius:'10px',color:'#fff'}}>
            <h3>Documentos</h3>
            <p style={{fontSize:'2em',fontWeight:'bold'}}>{stats.documents}</p>
          </div>
        </div>
      )}
      <div style={{marginTop:'2em'}}>
        <canvas ref={chartRef} height={120}></canvas>
      </div>
      <div style={{textAlign:'right',marginTop:'1em'}}>
        <button onClick={() => exportAttendanceCSV(attendanceRaw)} style={{background:'#646cff',color:'#fff',padding:'0.7em 1.5em',borderRadius:10,border:'none',fontWeight:'bold'}}>Exportar asistencias CSV</button>
      </div>
      <div style={{marginTop:'2em'}}>
        <canvas ref={usersChartRef} height={120}></canvas>
      </div>
    </div>
  );
}

export default AdminDashboard;
