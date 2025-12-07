import React, { useState, useEffect } from 'react';

const EventForm = ({ onCreate, event = null, isEditing = false }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  // Campos de ubicación
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [allowedRadius, setAllowedRadius] = useState('100');
  const [capturingLocation, setCapturingLocation] = useState(false);

  // Configuración de verificación
  const [requiresQRCode, setRequiresQRCode] = useState(true);
  const [requiresLocation, setRequiresLocation] = useState(true);
  const [requiresFacialRecognition, setRequiresFacialRecognition] = useState(false);
  const [minimumStayMinutes, setMinimumStayMinutes] = useState('0');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(isEditing);

  // Prellenar el formulario si estamos editando
  useEffect(() => {
    if (event && isEditing) {
      setName(event.name || '');
      setDescription(event.description || '');

      // Procesar la fecha
      if (event.date) {
        const eventDate = new Date(event.date);
        setDate(eventDate.toISOString().split('T')[0]);
        setTime(eventDate.toTimeString().slice(0, 5));
      }

      if (event.endDate) {
        const eventEndDate = new Date(event.endDate);
        setEndDate(eventEndDate.toISOString().split('T')[0]);
        setEndTime(eventEndDate.toTimeString().slice(0, 5));
      }

      setLocationName(event.locationName || '');
      if (event.location && event.location.coordinates) {
        setLongitude(event.location.coordinates[0].toString());
        setLatitude(event.location.coordinates[1].toString());
      }
      setAllowedRadius(event.allowedRadius?.toString() || '100');
      setRequiresQRCode(event.requiresQRCode !== false);
      setRequiresLocation(event.requiresLocation !== false);
      setRequiresFacialRecognition(event.requiresFacialRecognition || false);
      setMinimumStayMinutes(event.minimumStayMinutes?.toString() || '0');
      setShowForm(true);
    }
  }, [event, isEditing]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDate('');
    setTime('');
    setEndDate('');
    setEndTime('');
    setLocationName('');
    setLatitude('');
    setLongitude('');
    setAllowedRadius('100');
    setRequiresQRCode(true);
    setRequiresLocation(true);
    setRequiresFacialRecognition(false);
    setMinimumStayMinutes('0');
    setError('');
  };

  const captureCurrentLocation = () => {
    setCapturingLocation(true);
    setError('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setCapturingLocation(false);
        },
        (error) => {
          setError('No se pudo obtener la ubicación: ' + error.message);
          setCapturingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('Tu navegador no soporta geolocalización');
      setCapturingLocation(false);
    }
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

    if (requiresLocation && (!latitude || !longitude)) {
      setError('La ubicación es obligatoria cuando se requiere verificación de ubicación');
      setLoading(false);
      return;
    }

    // Combinar fecha y hora
    let dateTimeString = date;
    if (time) {
      dateTimeString = `${date}T${time}`;
    }

    let endDateTimeString = null;
    if (endDate) {
      endDateTimeString = endDate;
      if (endTime) {
        endDateTimeString = `${endDate}T${endTime}`;
      }
    }

    const eventData = {
      name: name.trim(),
      description: description.trim(),
      date: new Date(dateTimeString).toISOString(),
      endDate: endDateTimeString ? new Date(endDateTimeString).toISOString() : null,
      locationName: locationName.trim(),
      allowedRadius: parseInt(allowedRadius) || 100,
      requiresQRCode,
      requiresLocation,
      requiresFacialRecognition,
      minimumStayMinutes: parseInt(minimumStayMinutes) || 0
    };

    // Solo agregar ubicación si se proporciona
    if (latitude && longitude) {
      eventData.location = {
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    try {
      await onCreate(eventData);
      if (!isEditing) {
        resetForm();
        setShowForm(false);
      }
    } catch (err) {
      setError(isEditing ? 'Error al actualizar el evento' : 'Error al crear el evento');
    }

    setLoading(false);
  };

  if (!showForm && !isEditing) {
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

  // Obtener fecha mínima (hoy para creación, cualquiera para edición)
  const today = isEditing ? '' : new Date().toISOString().split('T')[0];

  return (
    <div className={isEditing ? '' : 'card'} style={isEditing ? {} : { marginBottom: 'var(--spacing-xl)' }}>
      {!isEditing && (
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
      )}

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
              🕐 Hora inicio
            </label>
            <input
              type="time"
              className="form-input"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
          <div className="form-group">
            <label className="form-label">
              📅 Fecha fin (opcional)
            </label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              min={date || today}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              🕐 Hora fin
            </label>
            <input
              type="time"
              className="form-input"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Ubicación del evento */}
        <div style={{
          padding: 'var(--spacing-md)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-md)',
          border: requiresLocation ? '2px solid var(--primary-color)' : '1px solid var(--border-color)'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: 'var(--spacing-md)' }}>
            📍 Ubicación del Evento
            {requiresLocation && <span className="required"> *</span>}
          </h4>

          <div className="form-group">
            <label className="form-label">
              Nombre del lugar
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Auditorio Principal, Sala de Conferencias..."
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-md)'
          }}>
            <div className="form-group">
              <label className="form-label">
                Latitud {requiresLocation && <span className="required">*</span>}
              </label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="-33.4569"
                value={latitude}
                onChange={e => setLatitude(e.target.value)}
                required={requiresLocation}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Longitud {requiresLocation && <span className="required">*</span>}
              </label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="-70.6483"
                value={longitude}
                onChange={e => setLongitude(e.target.value)}
                required={requiresLocation}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Radio permitido (metros)
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="100"
                value={allowedRadius}
                onChange={e => setAllowedRadius(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={captureCurrentLocation}
            disabled={capturingLocation}
            className="btn btn-outline btn-sm"
          >
            {capturingLocation ? 'Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
          </button>
        </div>

        {/* Configuración de verificación */}
        <div style={{
          padding: 'var(--spacing-md)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-md)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: 'var(--spacing-md)' }}>
            🔒 Configuración de Verificación
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={requiresQRCode}
                onChange={e => setRequiresQRCode(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Requiere código QR</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={requiresLocation}
                onChange={e => setRequiresLocation(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Requiere verificación de ubicación</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={requiresFacialRecognition}
                onChange={e => setRequiresFacialRecognition(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Requiere reconocimiento facial</span>
            </label>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--spacing-md)', marginBottom: 0 }}>
            <label className="form-label">
              Tiempo mínimo de permanencia (minutos)
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              value={minimumStayMinutes}
              onChange={e => setMinimumStayMinutes(e.target.value)}
              min="0"
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Tiempo mínimo que los asistentes deben permanecer en el evento (0 = sin límite)
            </small>
          </div>
        </div>

        {/* Preview del evento */}
        {name && date && !isEditing && (
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
          {!isEditing && (
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
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: isEditing ? 1 : 2 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div>
                {isEditing ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                {isEditing ? '✓ Actualizar evento' : '➕ Crear evento'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tips */}
      {!isEditing && (
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
      )}
    </div>
  );
};

export default EventForm;
