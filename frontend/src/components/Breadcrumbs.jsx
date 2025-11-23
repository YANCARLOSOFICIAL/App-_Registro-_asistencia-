import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

const routeNames = {
  dashboard: 'Dashboard',
  users: 'Usuarios',
  attendance: 'Asistencias',
  documents: 'Documentos',
  events: 'Eventos',
  login: 'Iniciar Sesión',
  register: 'Registrarse',
  'login-facial': 'Login Facial'
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show breadcrumbs on login pages
  if (pathnames.length === 0 || ['login', 'register', 'login-facial'].includes(pathnames[0])) {
    return null;
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link">
            🏠 Inicio
          </Link>
          {pathnames.length > 0 && <span className="breadcrumb-separator">/</span>}
        </li>

        {pathnames.map((pathname, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = routeNames[pathname] || pathname;

          return (
            <li key={routeTo} className="breadcrumb-item">
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <>
                  <Link to={routeTo} className="breadcrumb-link">
                    {displayName}
                  </Link>
                  <span className="breadcrumb-separator">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
