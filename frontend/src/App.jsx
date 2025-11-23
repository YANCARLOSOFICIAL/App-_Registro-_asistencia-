import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import LoginFacial from './pages/LoginFacial';
import Users from './pages/Users';
import Attendance from './pages/Attendance';
import Documents from './pages/Documents';
import AdminDashboard from './pages/AdminDashboard';
import Events from './pages/Events';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!user && !!localStorage.getItem('token');

  return (
    <>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: {
              primary: 'var(--secondary)',
              secondary: 'var(--bg-card)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger)',
              secondary: 'var(--bg-card)',
            },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'admin' ? '/dashboard' : '/events'} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'admin' ? '/dashboard' : '/events'} replace />
            ) : (
              <Register />
            )
          }
        />
        <Route
          path="/login-facial"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'admin' ? '/dashboard' : '/events'} replace />
            ) : (
              <LoginFacial />
            )
          }
        />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Admin only routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared routes */}
          <Route path="/users" element={<Users />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/events" element={<Events />} />
        </Route>

        {/* Redirect root to appropriate page */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'admin' ? '/dashboard' : '/events'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
