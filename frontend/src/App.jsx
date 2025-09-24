
import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginFacial from './pages/LoginFacial';
import Users from './pages/Users';
import Attendance from './pages/Attendance';
import Documents from './pages/Documents';
import AdminDashboard from './pages/AdminDashboard';
import Events from './pages/Events';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('users');
  const [showRegister, setShowRegister] = useState(false);
  const [showFacial, setShowFacial] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    if (showRegister) {
      return <Register onRegistered={() => setShowRegister(false)} onBack={() => setShowRegister(false)} />;
    }
    if (showFacial) {
      return <LoginFacial onLogin={setUser} onBack={() => setShowFacial(false)} />;
    }
    return (
      <>
        <Login onLogin={setUser} />
        <div style={{textAlign:'center', marginTop:20}}>
          <button onClick={() => setShowRegister(true)} style={{background:'#646cff',color:'#fff',padding:'0.7em 1.5em',borderRadius:10,border:'none',fontWeight:'bold'}}>Registrarse</button>
          <button onClick={() => setShowFacial(true)} style={{background:'#27ae60',color:'#fff',padding:'0.7em 1.5em',borderRadius:10,border:'none',fontWeight:'bold',marginLeft:10}}>Login facial</button>
        </div>
      </>
    );
  }

  return (
    <div>
      <nav className="nav">
        <span>Bienvenido, {user.name} ({user.role})</span>
  <button onClick={() => setPage('users')} className={page==='users'?'active':''}>Usuarios</button>
  <button onClick={() => setPage('attendance')} className={page==='attendance'?'active':''}>Asistencias</button>
  <button onClick={() => setPage('documents')} className={page==='documents'?'active':''}>Documentos</button>
  <button onClick={() => setPage('events')} className={page==='events'?'active':''}>Eventos</button>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </nav>
      {/* Paneles según rol */}
      {user.role === 'admin' ? (
        <>
          <AdminDashboard />
          {page === 'users' && <Users />}
          {page === 'attendance' && <Attendance />}
          {page === 'documents' && <Documents />}
          {page === 'events' && <Events user={user} />}
        </>
      ) : (
        <>
          {page === 'users' && <Users userId={user.id} />}
          {page === 'attendance' && <Attendance />}
          {page === 'documents' && <Documents onlyDownload={true} />}
          {page === 'events' && <Events user={user} />}
        </>
      )}
    </div>
  );
}

export default App;
