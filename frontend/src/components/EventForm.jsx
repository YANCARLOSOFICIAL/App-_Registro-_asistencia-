import React, { useState } from 'react';

const EventForm = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ name, description, date });
    setName('');
    setDescription('');
    setDate('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Crear Evento</h3>
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Descripción"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />
      <button type="submit">Crear</button>
    </form>
  );
};

export default EventForm;
