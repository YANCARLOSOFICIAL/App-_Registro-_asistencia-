import React, { useEffect, useState } from 'react';

function Documents({ onlyDownload = false }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = () => {
    fetch('http://localhost:5000/api/documents')
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching documents:', err);
        setLoading(false);
      });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    
    // Validaciones
    if (!title.trim()) {
      setUploadError("El título es obligatorio");
      setUploading(false);
      return;
    }
    
    if (!file) {
      setUploadError("Debes seleccionar un archivo");
      setUploading(false);
      return;
    }
    
    if (file.type !== "application/pdf") {
      setUploadError("Solo se permiten archivos PDF");
      setUploading(false);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("El archivo no debe superar los 10MB");
      setUploading(false);
      return;
    }
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);
    
    try {
      const res = await fetch("http://localhost:5000/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setTitle("");
        setDescription("");
        setFile(null);
        setDocuments((docs) => [data.document, ...docs]);
        setUploadSuccess("✓ Documento subido exitosamente");
        
        setTimeout(() => {
          setUploadSuccess("");
          setShowUploadForm(false);
        }, 3000);
      } else {
        setUploadError(data.error || "Error al subir documento");
      }
    } catch (err) {
      setUploadError("Error de conexión. Verifica tu internet.");
    }
    
    setUploading(false);
  };

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para obtener icono según tipo de archivo
  const getFileIcon = (filename) => {
    if (filename?.endsWith('.pdf')) return '📄';
    if (filename?.match(/\.(jpg|jpeg|png|gif)$/i)) return '🖼️';
    if (filename?.match(/\.(doc|docx)$/i)) return '📝';
    if (filename?.match(/\.(xls|xlsx)$/i)) return '📊';
    return '📎';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Cargando documentos...</p>
      </div>
    );
  }

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
            📄 Documentos
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>
            {documents.length} documento{documents.length !== 1 ? 's' : ''} disponible{documents.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          {/* Toggles de vista */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            border: '1px solid var(--border-color-dark)'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn btn-ghost btn-sm`}
              style={{
                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)',
                padding: '0.4em 0.8em'
              }}
            >
              ▦ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn btn-ghost btn-sm`}
              style={{
                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                padding: '0.4em 0.8em'
              }}
            >
              ☰ Lista
            </button>
          </div>

          {!onlyDownload && (
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="btn btn-primary"
            >
              {showUploadForm ? '✕ Cerrar' : '⬆️ Subir documento'}
            </button>
          )}
        </div>
      </div>

      {/* Formulario de subida */}
      {!onlyDownload && showUploadForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ margin: 0, marginBottom: 'var(--spacing-lg)', fontSize: 'var(--text-xl)' }}>
            ⬆️ Subir Nuevo Documento
          </h3>

          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label className="form-label">
                Título <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Manual de usuario..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Descripción
              </label>
              <textarea
                className="form-input"
                placeholder="Breve descripción del documento..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Archivo PDF <span className="required">*</span>
              </label>
              <input
                type="file"
                className="form-input"
                accept="application/pdf"
                onChange={e => setFile(e.target.files[0])}
                required
                style={{ padding: '0.5em' }}
              />
              <p style={{ 
                color: 'var(--text-tertiary)', 
                fontSize: 'var(--text-xs)', 
                marginTop: 'var(--spacing-sm)',
                marginBottom: 0
              }}>
                💡 Tamaño máximo: 10MB. Solo archivos PDF
              </p>
            </div>

            {uploadError && (
              <div className="alert alert-error">
                ⚠️ {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="alert alert-success">
                {uploadSuccess}
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setTitle("");
                  setDescription("");
                  setFile(null);
                  setUploadError("");
                }}
                className="btn btn-outline"
                style={{ flex: 1 }}
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    ⬆️ Subir documento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Buscar documento..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de documentos */}
      {filteredDocuments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3 className="empty-state-title">
            {searchTerm ? 'No se encontraron documentos' : 'No hay documentos'}
          </h3>
          <p className="empty-state-description">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : onlyDownload 
                ? 'Aún no hay documentos disponibles para descargar'
                : 'Sube el primer documento usando el botón de arriba'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        // Vista Grid
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--spacing-lg)'
        }}>
          {filteredDocuments.map(doc => (
            <div 
              key={doc._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <div style={{ 
                fontSize: '3rem', 
                textAlign: 'center',
                marginBottom: 'var(--spacing-md)',
                opacity: 0.8
              }}>
                {getFileIcon(doc.filename)}
              </div>
              
              <h4 style={{ 
                margin: 0,
                marginBottom: 'var(--spacing-sm)',
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {doc.title}
              </h4>
              
              {doc.description && (
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  marginBottom: 'var(--spacing-md)',
                  flex: 1
                }}>
                  {doc.description}
                </p>
              )}
              
              <div style={{
                marginTop: 'auto',
                paddingTop: 'var(--spacing-md)',
                borderTop: '1px solid var(--border-color-dark)'
              }}>
                <p style={{ 
                  color: 'var(--text-tertiary)',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  Subido: {new Date(doc.uploadDate).toLocaleDateString('es-ES')}
                </p>
                
                <a
                  href={`http://localhost:5000/api/documents/${doc._id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  ⬇️ Descargar
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vista Lista
        <ul className="list">
          {filteredDocuments.map(doc => (
            <li key={doc._id} className="list-item">
              <div style={{ fontSize: '2rem', marginRight: 'var(--spacing-md)' }}>
                {getFileIcon(doc.filename)}
              </div>
              
              <div className="list-item-content" style={{ flex: 1 }}>
                <div className="list-item-title">
                  {doc.title}
                </div>
                <div className="list-item-subtitle">
                  {doc.description || 'Sin descripción'} • {' '}
                  Subido: {new Date(doc.uploadDate).toLocaleDateString('es-ES')}
                </div>
              </div>
              
              <a
                href={`http://localhost:5000/api/documents/${doc._id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                ⬇️ Descargar
              </a>
            </li>
          ))}
        </ul>
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
          <li>• Solo se permiten archivos PDF de hasta 10MB</li>
          <li>• Los documentos se descargan automáticamente al hacer clic</li>
          <li>• Usa la búsqueda para encontrar documentos rápidamente</li>
          {!onlyDownload && <li>• Puedes subir manuales, formularios, y más</li>}
        </ul>
      </div>
    </div>
  );
}

export default Documents;
