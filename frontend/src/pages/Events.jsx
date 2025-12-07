import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EventForm from '../components/EventForm';
import EventItem from './EventItem';
import { SkeletonCard } from '../components/Skeleton';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const Events = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const isAdmin = user?.role === 'admin';

  // Estados para edición
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para eliminación
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    setError('');

    fetch('http://localhost:5000/api/events', {
      headers: { 'Authorization': 'Bearer ' + token }
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
        toast.error('Error al cargar eventos');
        setLoading(false);
      });
  };

  const handleCreate = (eventData) => {
    fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
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

  // Abrir modal de edición
  const handleEditClick = (event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  // Actualizar evento
  const handleUpdate = (eventData) => {
    fetch(`http://localhost:5000/api/events/${editingEvent._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(eventData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al actualizar evento');
        return res.json();
      })
      .then(data => {
        fetchEvents();
        toast.success('Evento actualizado correctamente');
        setShowEditModal(false);
        setEditingEvent(null);
      })
      .catch(err => {
        toast.error('Error al actualizar evento: ' + err.message);
      });
  };

  // Abrir modal de eliminación
  const handleDeleteClick = (event) => {
    setDeletingEvent(event);
    setShowDeleteModal(true);
  };

  // Eliminar evento
  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`http://localhost:5000/api/events/${deletingEvent._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      const data = await res.json();

      if (res.ok) {
        fetchEvents();
        toast.success('Evento eliminado correctamente');
        setShowDeleteModal(false);
        setDeletingEvent(null);
      } else {
        toast.error(data.error || 'Error al eliminar evento');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }

    setDeleting(false);
  };

  // Verificar si el usuario puede editar/eliminar un evento
  const canEdit = (event) => {
    return isAdmin || event.createdBy?._id === user._id || event.createdBy === user._id;
  };

  // Filtrar eventos
  const getFilteredEvents = () => {
    const now = new Date();

    switch (filter) {
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
            <div key={event._id} style={{ position: 'relative' }}>
              {/* Botones de editar/eliminar para admin o creador */}
              {canEdit(event) && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  zIndex: 10
                }}>
                  <button
                    onClick={() => handleEditClick(event)}
                    style={{
                      background: '#3498db',
                      color: '#fff',
                      border: 'none',
                      padding: '0.5em 1em',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(event)}
                    style={{
                      background: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      padding: '0.5em 1em',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              )}
              <EventItem event={event} />
            </div>
          ))}
        </ul>
      )}

      {/* Modal de edición */}
      {showEditModal && editingEvent && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingEvent(null);
          }}
          title="✏️ Editar Evento"
        >
          <EventForm
            event={editingEvent}
            onCreate={handleUpdate}
            isEditing={true}
          />
        </Modal>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deletingEvent && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingEvent(null);
          }}
          onConfirm={handleDelete}
          title="¿Eliminar evento?"
          message={`¿Estás seguro de que quieres eliminar "${deletingEvent.name}"? Esta acción eliminará el evento y todas las asistencias asociadas. No se puede deshacer.`}
          confirmText="Eliminar evento"
          cancelText="Cancelar"
          loading={deleting}
          danger
        />
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
            <>
              <li style={{ marginTop: '0.5rem', color: '#27ae60' }}>
                • Como administrador, puedes crear, editar y eliminar eventos
              </li>
              <li style={{ marginTop: '0.5rem', color: '#27ae60' }}>
                • También puedes ver y gestionar todos los eventos del sistema
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Events;
