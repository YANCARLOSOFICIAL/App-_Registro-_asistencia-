import React, { useEffect, useState } from "react";
import UserForm from "../components/UserForm";

function Users() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [loading, setLoading] = useState(true);

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
    const res = await fetch(`http://localhost:5000/api/users/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, email: editEmail, role: editRole })
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(users => users.map(u => u._id === editId ? data.user : u));
      cancelEdit();
    } else {
      alert('Error al editar usuario');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    const res = await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(users => users.filter(u => u._id !== id));
    } else {
      alert('Error al eliminar usuario');
    }
  };

  useEffect(() => {
    // Obtener usuario desde localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    if (storedUser && storedUser.role === 'admin') {
      fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setUsers(data);
          setLoading(false);
        });
    }
  }, []);

  if (!user) {
    return <div>Cargando...</div>;
  }

  if (user.role !== 'admin') {
    return (
      <div>
        <h2>Mi perfil</h2>
        <p>Nombre: {user.name}</p>
        <p>Email: {user.email}</p>
        {/* Otros datos */}
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Usuarios</h2>
      <UserForm />
      {loading ? <p>Cargando...</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map(u => (
            <li key={u._id}>
              {editId === u._id ? (
                <form onSubmit={handleEdit} style={{display:'inline'}}>
                  <input value={editName} onChange={e=>setEditName(e.target.value)} required />
                  <input value={editEmail} onChange={e=>setEditEmail(e.target.value)} required />
                  {isAdmin && (
                    <select value={editRole} onChange={e=>setEditRole(e.target.value)}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  )}
                  <button type="submit">Guardar</button>
                  <button type="button" onClick={cancelEdit}>Cancelar</button>
                </form>
              ) : (
                <>
                  {u.name} - {u.email} - {u.role}
                  <button style={{marginLeft:8}} onClick={() => handleDelete(u._id)}>Eliminar</button>
                  <button style={{marginLeft:8}} onClick={() => startEdit(u)}>Editar</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Users;
