import React, { useState, useEffect } from 'react';
import { get } from '../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await get('users');
        setUsers(data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Usuarios</h2>
      <ul>
        {users.map(user => (
          <li key={user._id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
