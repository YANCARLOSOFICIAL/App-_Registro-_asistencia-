import React, { useState } from 'react';

const EventForm = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDate('');
    setTime('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (!name.trim()) {
      setError('El nombre del evento es obligatorio');
      setLoading(false);
      return;
    }

    if (!date) {
      setError('La fecha del evento es obligatoria');
      setLoading(false);
      return;
    }

    // Combinar fecha y hora
    let dateTimeString = date;
    if (time) {
      dateTimeString = `${date}T${time}`;
    }

    const eventData = {
      name: name.trim(),
      description: description.trim(),
      date: new Date(dateTimeString).toISOString()
    };

    try {
      await onCreate(eventData);
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError('Error al crear el evento');
    }
    
    setLoading(false);
  };

  if (!showForm) {
    return (
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          ➕ Crear nuevo evento
        </button>
      </div>
    );
  }

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>
          ➕ Crear Nuevo Evento
        </h3>
        <button
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
          className="btn btn-ghost btn-sm"
        >
          ✕ Cerrar
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Nombre del evento <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej: Reunión mensual, Capacitación..."
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Descripción
          </label>
          <textarea
            className="form-input"
            placeholder="Breve descripción del evento..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
          <div className="form-group">
            <label className="form-label">
              📅 Fecha <span className="required">*</span>
            </label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={today}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              🕐 Hora (opcional)
            </label>
            <input
              type="time"
              className="form-input"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Preview del evento */}
        {name && date && (
          <div style={{
            padding: 'var(--spacing-md)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--border-color)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Vista previa:
            </p>
            <h4 style={{
              margin: 0,
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-primary)'
            }}>
              {name}
            </h4>
            {description && (
              <p style={{
                margin: 0,
                marginBottom: 'var(--spacing-xs)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-sm)'
              }}>
                {description}
              </p>
            )}
            <p style={{
              margin: 0,
              color: 'var(--text-tertiary)',
              fontSize: 'var(--text-sm)'
            }}>
              📅 {new Date(date + (time ? `T${time}` : '')).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                ...(time && { hour: '2-digit', minute: '2-digit' })
              })}
            </p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-lg)'
        }}>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            className="btn btn-outline"
            style={{ flex: 1 }}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 2 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div>
                Creando...
              </>
            ) : (
              <>
                ➕ Crear evento
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div style={{
        marginTop: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color-dark)'
      }}>
        <p style={{
          margin: 0,
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.6
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>💡 Consejos:</strong>
          <br />
          • Usa nombres descriptivos para tus eventos
          <br />
          • Especifica la hora para eventos con horario fijo
          <br />
          • Los usuarios podrán registrar su asistencia desde la sección de Eventos
        </p>
      </div>
    </div>
  );
};

export default EventForm;
