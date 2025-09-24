import React, { useEffect, useState } from 'react';
import EventForm from '../components/EventForm';
import EventItem from './EventItem';

const Events = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
  fetch('http://localhost:5000/api/events', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  const handleCreate = (eventData) => {
  fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(eventData)
    })
      .then(res => res.json())
      .then(newEvent => {
        setEvents([...events, newEvent]);
      });
  };

  const handleAttend = (id) => {
  fetch(`http://localhost:5000/api/events/${id}/attend`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(() => {
        alert('Asistencia registrada');
      });
  };

  if (loading) return <div>Cargando eventos...</div>;

  return (
    <div>
      <h2>Eventos</h2>
      {isAdmin && <EventForm onCreate={handleCreate} />}
      <ul>
        {events.map(event => (
          <EventItem key={event._id} event={event} />
        ))}
      </ul>
    </div>
  );
};

export default Events;
