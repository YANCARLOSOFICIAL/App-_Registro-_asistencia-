import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import UserForm from "../components/UserForm";
import ConfirmModal from "../components/ConfirmModal";
import { SkeletonTable } from "../components/Skeleton";

function Users() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === 'admin';

  const startEdit = (userObj) => {
    setEditId(userObj._id);
    setEditName(userObj.name);
    setEditEmail(userObj.email);
    setEditRole(userObj.role);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditEmail("");
    setEditRole("");
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const payload = { name: editName, email: editEmail };
    if (isAdmin) {
      payload.role = editRole;
    }
    
    const res = await fetch(`http://localhost:5000/api/users/${editId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const data = await res.json();
      setUsers(users => users.map(u => u._id === editId ? data.user : u));
      toast.success('Usuario actualizado exitosamente');
      cancelEdit();
    } else {
      toast.error('Error al editar usuario');
    }
  };

  const openDeleteModal = (userId, userName) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '' });
  };

  const handleDelete = async () => {
    setDeleting(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/users/${deleteModal.userId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (res.ok) {
      setUsers(users => users.filter(u => u._id !== deleteModal.userId));
      toast.success('Usuario eliminado exitosamente');
      closeDeleteModal();
    } else {
      toast.error('Error al eliminar usuario');
    }
    setDeleting(false);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    if (storedUser && storedUser.role === 'admin') {
      fetch('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            throw new Error('Respuesta no es JSON');
          }
          return res.json();
        })
        .then(data => {
          setUsers(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error al obtener usuarios:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <h2>👥 Gestión de Usuarios</h2>
        </div>
        <SkeletonTable rows={5} columns={4} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔐</div>
        <h3 className="empty-state-title">Acceso no autorizado</h3>
        <p className="empty-state-description">Debes iniciar sesión para ver esta página</p>
      </div>
    );
  }

  // Vista para usuarios no admin
  if (user.role !== 'admin') {
    return (
      <div className="container container-sm">
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>👤</div>
            <h2 style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>Mi Perfil</h2>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--spacing-md)' 
          }}>
            <div>
              <label style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--text-secondary)',
                fontWeight: '500',
                display: 'block',
                marginBottom: 'var(--spacing-xs)'
              }}>
                Nombre
              </label>
              <div style={{ 
                padding: 'var(--spacing-md)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-lg)',
                fontWeight: '600'
              }}>
                {user.name}
              </div>
            </div>

            <div>
              <label style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--text-secondary)',
                fontWeight: '500',
                display: 'block',
                marginBottom: 'var(--spacing-xs)'
              }}>
                Email
              </label>
              <div style={{ 
                padding: 'var(--spacing-md)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)'
              }}>
                {user.email}
              </div>
            </div>

            <div>
              <label style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--text-secondary)',
                fontWeight: '500',
                display: 'block',
                marginBottom: 'var(--spacing-xs)'
              }}>
                Rol
              </label>
              <div>
                <span className="badge badge-primary" style={{ fontSize: 'var(--text-sm)' }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar usuarios
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Vista para admin
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
            👥 Gestión de Usuarios
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Formulario de creación */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <UserForm onUserCreated={(newUser) => setUsers([...users, newUser])} />
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <div className="filters-row">
          <div className="filter-group">
            <label className="form-label">🔍 Buscar</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nombre o email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="form-label">🏷️ Filtrar por rol</label>
            <select
              className="form-input"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuarios</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">No se encontraron usuarios</h3>
          <p className="empty-state-description">
            {searchTerm || filterRole !== 'all' 
              ? 'Intenta con otros filtros de búsqueda' 
              : 'Aún no hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id}>
                  {editId === u._id ? (
                    <>
                      <td>
                        <input
                          className="form-input"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          required
                          style={{ marginBottom: 0 }}
                        />
                      </td>
                      <td>
                        <input
                          className="form-input"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          required
                          style={{ marginBottom: 0 }}
                        />
                      </td>
                      <td>
                        <select
                          className="form-input"
                          value={editRole}
                          onChange={e => setEditRole(e.target.value)}
                          style={{ marginBottom: 0 }}
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
                          <button 
                            onClick={handleEdit}
                            className="btn btn-secondary btn-sm"
                          >
                            ✓ Guardar
                          </button>
                          <button 
                            onClick={cancelEdit}
                            className="btn btn-ghost btn-sm"
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{u.name}</strong>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {u.email}
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
                          <button 
                            onClick={() => startEdit(u)}
                            className="btn btn-outline btn-sm"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => openDeleteModal(u._id, u.name)}
                            className="btn btn-danger btn-sm"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          <li>• Usa los filtros para encontrar usuarios específicos</li>
          <li>• Los administradores tienen acceso completo al sistema</li>
          <li>• Al eliminar un usuario, sus asistencias se mantienen registradas</li>
          <li>• Puedes editar el rol de cualquier usuario</li>
        </ul>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${deleteModal.userName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default Users;
