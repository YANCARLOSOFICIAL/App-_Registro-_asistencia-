import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './notifications/NotificationBell';
import ThemeToggle from './ThemeToggle';
import Breadcrumbs from './Breadcrumbs';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      {/* Navegación */}
      <nav className="nav">
        <div className="nav-brand">
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          <span>Sistema de Asistencia</span>
        </div>

        {/* Hamburger button for mobile */}
        <button
          className="nav-hamburger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'nav-links-mobile-open' : ''}`}>
          {isAdmin && (
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              📈 Dashboard
            </Link>
          )}
          <Link
            to="/users"
            className={`nav-link ${isActive('/users') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            👥 Usuarios
          </Link>
          <Link
            to="/attendance"
            className={`nav-link ${isActive('/attendance') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✓ Asistencias
          </Link>
          <Link
            to="/documents"
            className={`nav-link ${isActive('/documents') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            📄 Documentos
          </Link>
          <Link
            to="/events"
            className={`nav-link ${isActive('/events') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            📅 Eventos
          </Link>
        </div>

        <div className="nav-actions">
          <ThemeToggle />
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
      <main className="layout-main">
        <Breadcrumbs />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
