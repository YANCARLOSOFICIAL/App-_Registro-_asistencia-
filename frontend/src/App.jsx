import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginFacial from './pages/LoginFacial';
import Users from './pages/Users';
import Attendance from './pages/Attendance';
import Documents from './pages/Documents';
import AdminDashboard from './pages/AdminDashboard';
import Events from './pages/Events';
import NotificationBell from './components/notifications/NotificationBell';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
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
    setPage('dashboard');
  };

  // Pantallas de autenticación
  if (!user) {
    if (showRegister) {
      return (
        <div className="container container-sm" style={{ paddingTop: '2rem' }}>
          <Register 
            onRegistered={() => setShowRegister(false)} 
            onBack={() => setShowRegister(false)} 
          />
        </div>
      );
    }
    
    if (showFacial) {
      return (
        <div className="container container-sm" style={{ paddingTop: '2rem' }}>
          <LoginFacial 
            onLogin={setUser} 
            onBack={() => setShowFacial(false)} 
          />
        </div>
      );
    }
    
    return (
      <div className="container container-sm" style={{ paddingTop: '2rem' }}>
        <Login onLogin={setUser} />
        
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)', 
          marginTop: 'var(--spacing-xl)',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setShowRegister(true)} 
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            ✨ Crear cuenta
          </button>
          <button 
            onClick={() => setShowFacial(true)} 
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            📷 Login facial
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-2xl)' }}>
      {/* Navegación */}
      <nav className="nav">
        <div className="nav-brand">
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          <span>Sistema de Asistencia</span>
        </div>

        <div className="nav-links">
          {isAdmin && (
            <button 
              onClick={() => setPage('dashboard')} 
              className={`nav-link ${page === 'dashboard' ? 'active' : ''}`}
            >
              📈 Dashboard
            </button>
          )}
          <button 
            onClick={() => setPage('users')} 
            className={`nav-link ${page === 'users' ? 'active' : ''}`}
          >
            👥 Usuarios
          </button>
          <button 
            onClick={() => setPage('attendance')} 
            className={`nav-link ${page === 'attendance' ? 'active' : ''}`}
          >
            ✓ Asistencias
          </button>
          <button 
            onClick={() => setPage('documents')} 
            className={`nav-link ${page === 'documents' ? 'active' : ''}`}
          >
            📄 Documentos
          </button>
          <button 
            onClick={() => setPage('events')} 
            className={`nav-link ${page === 'events' ? 'active' : ''}`}
          >
            📅 Eventos
          </button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
          <NotificationBell />
          <div className="nav-user">
            <span className="nav-user-name">{user.name}</span>
            <span className="nav-user-role">{user.role}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            🚪 Salir
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main>
        {isAdmin ? (
          <>
            {page === 'dashboard' && <AdminDashboard />}
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
      </main>
    </div>
  );
}

export default App;
