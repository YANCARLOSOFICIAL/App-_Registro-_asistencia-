import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EventForm from '../components/EventForm';
import EventItem from './EventItem';
import { SkeletonCard } from '../components/Skeleton';

const Events = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    setError('');
    
    fetch('http://localhost:5000/api/events', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar eventos');
        return res.json();
      })
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleCreate = (eventData) => {
    fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(eventData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al crear evento');
        return res.json();
      })
      .then(newEvent => {
        setEvents([newEvent, ...events]);
        toast.success('Evento creado correctamente');
      })
      .catch(err => {
        toast.error('Error al crear evento: ' + err.message);
      });
  };

  // Filtrar eventos
  const getFilteredEvents = () => {
    const now = new Date();
    
    switch(filter) {
      case 'upcoming':
        return events.filter(event => new Date(event.date) >= now);
      case 'past':
        return events.filter(event => new Date(event.date) < now);
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <h2>📅 Eventos</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--spacing-lg)'
        }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ margin: 0 }}>📅 Eventos</h2>
        
        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              background: filter === 'all' ? '#646cff' : '#333',
              color: '#fff',
              border: 'none',
              padding: '0.5em 1em',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: filter === 'all' ? 'bold' : 'normal'
            }}
          >
            Todos ({events.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            style={{
              background: filter === 'upcoming' ? '#646cff' : '#333',
              color: '#fff',
              border: 'none',
              padding: '0.5em 1em',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: filter === 'upcoming' ? 'bold' : 'normal'
            }}
          >
            Próximos ({events.filter(e => new Date(e.date) >= new Date()).length})
          </button>
          <button
            onClick={() => setFilter('past')}
            style={{
              background: filter === 'past' ? '#646cff' : '#333',
              color: '#fff',
              border: 'none',
              padding: '0.5em 1em',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: filter === 'past' ? 'bold' : 'normal'
            }}
          >
            Pasados ({events.filter(e => new Date(e.date) < new Date()).length})
          </button>
        </div>
      </div>

      {/* Formulario de creación (solo admin) */}
      {isAdmin && (
        <div style={{ marginBottom: '2rem' }}>
          <EventForm onCreate={handleCreate} />
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div style={{ 
          background: '#e74c3c', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: '#222',
          borderRadius: '10px',
          color: '#aaa'
        }}>
          <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📭</p>
          <p style={{ fontSize: '1.2rem', margin: 0 }}>
            {filter === 'upcoming' 
              ? 'No hay eventos próximos' 
              : filter === 'past'
              ? 'No hay eventos pasados'
              : 'No hay eventos disponibles'}
          </p>
          {isAdmin && filter === 'all' && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Crea el primer evento usando el formulario arriba
            </p>
          )}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredEvents.map(event => (
            <EventItem key={event._id} event={event} />
          ))}
        </ul>
      )}

      {/* Información adicional */}
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        background: '#1a1a1a',
        borderRadius: '8px',
        border: '1px solid #333'
      }}>
        <h3 style={{ margin: '0 0 0.8rem 0', color: '#646cff', fontSize: '1rem' }}>
          ℹ️ Información
        </h3>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0,
          color: '#aaa',
          fontSize: '0.9rem'
        }}>
          <li style={{ marginBottom: '0.5rem' }}>
            • <strong>Registrar asistencia:</strong> Haz clic en el botón azul para registrar tu presencia sin verificación
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            • <strong>Verificar con foto:</strong> Usa el botón verde para registrar con verificación facial
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            • <strong>Verificación facial:</strong> Sube una foto clara de tu rostro que coincida con tu imagen de perfil
          </li>
          {isAdmin && (
            <li style={{ marginTop: '0.5rem', color: '#27ae60' }}>
              • Como administrador, puedes crear nuevos eventos y ver todos los asistentes
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Events;
