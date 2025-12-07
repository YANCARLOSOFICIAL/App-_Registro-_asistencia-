import React, { useEffect, useState } from 'react';
import { SkeletonCard } from '../components/Skeleton';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

function Documents({ onlyDownload = false }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Estados para edición
  const [editingDoc, setEditingDoc] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Estados para eliminación
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = () => {
    fetch('http://localhost:5000/api/documents', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching documents:', err);
        toast.error('Error al cargar documentos');
        setLoading(false);
      });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    if (!title.trim()) {
      toast.error("El título es obligatorio");
      setUploading(false);
      return;
    }

    if (!file) {
      toast.error("Debes seleccionar un archivo");
      setUploading(false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo no debe superar los 10MB");
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
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setTitle("");
        setDescription("");
        setFile(null);
        fetchDocuments();
        toast.success("Documento subido exitosamente");
        setShowUploadForm(false);
      } else {
        toast.error(data.error || "Error al subir documento");
      }
    } catch (err) {
      toast.error("Error de conexión. Verifica tu internet.");
    }

    setUploading(false);
  };

  // Abrir modal de edición
  const handleEditClick = (doc) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditDescription(doc.description || "");
    setEditFile(null);
    setShowEditModal(true);
  };

  // Actualizar documento
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    if (!editTitle.trim()) {
      toast.error("El título es obligatorio");
      setUpdating(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    if (editFile) {
      formData.append("file", editFile);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/documents/${editingDoc._id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        fetchDocuments();
        toast.success("Documento actualizado exitosamente");
        setShowEditModal(false);
        setEditingDoc(null);
      } else {
        toast.error(data.error || "Error al actualizar documento");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }

    setUpdating(false);
  };

  // Abrir modal de eliminación
  const handleDeleteClick = (doc) => {
    setDeletingDoc(doc);
    setShowDeleteModal(true);
  };

  // Eliminar documento
  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`http://localhost:5000/api/documents/${deletingDoc._id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        fetchDocuments();
        toast.success("Documento eliminado exitosamente");
        setShowDeleteModal(false);
        setDeletingDoc(null);
      } else {
        toast.error(data.error || "Error al eliminar documento");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }

    setDeleting(false);
  };

  // Verificar si el usuario puede editar/eliminar un documento
  const canEdit = (doc) => {
    return user.role === 'admin' || doc.uploadedBy?._id === user._id;
  };

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para obtener icono según tipo de archivo
  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    if (fileType?.includes('sheet') || fileType?.includes('excel')) return '📊';
    return '📎';
  };

  if (loading) {
    return (
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <h2>📄 Documentos</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--spacing-lg)'
        }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
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
                Archivo <span className="required">*</span>
              </label>
              <input
                type="file"
                className="form-input"
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
                💡 Tamaño máximo: 10MB
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setTitle("");
                  setDescription("");
                  setFile(null);
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
                {getFileIcon(doc.fileType)}
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
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  Subido por: {doc.uploadedBy?.name || 'Desconocido'}
                </p>
                <p style={{
                  color: 'var(--text-tertiary)',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  Fecha: {new Date(doc.uploadedAt).toLocaleDateString('es-ES')}
                </p>

                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                  <a
                    href={`http://localhost:5000/api/documents/${doc._id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
                  >
                    ⬇️ Descargar
                  </a>

                  {canEdit(doc) && (
                    <>
                      <button
                        onClick={() => handleEditClick(doc)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.4em 0.8em' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteClick(doc)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.4em 0.8em' }}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
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
                {getFileIcon(doc.fileType)}
              </div>

              <div className="list-item-content" style={{ flex: 1 }}>
                <div className="list-item-title">
                  {doc.title}
                </div>
                <div className="list-item-subtitle">
                  {doc.description || 'Sin descripción'} • {' '}
                  Por: {doc.uploadedBy?.name || 'Desconocido'} • {' '}
                  {new Date(doc.uploadedAt).toLocaleDateString('es-ES')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                <a
                  href={`http://localhost:5000/api/documents/${doc._id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  ⬇️ Descargar
                </a>

                {canEdit(doc) && (
                  <>
                    <button
                      onClick={() => handleEditClick(doc)}
                      className="btn btn-outline btn-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(doc)}
                      className="btn btn-danger btn-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de edición */}
      {showEditModal && editingDoc && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingDoc(null);
          }}
          title="✏️ Editar Documento"
        >
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">
                Título <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Descripción
              </label>
              <textarea
                className="form-input"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Nuevo archivo (opcional)
              </label>
              <input
                type="file"
                className="form-input"
                onChange={e => setEditFile(e.target.files[0])}
                style={{ padding: '0.5em' }}
              />
              <p style={{
                color: 'var(--text-tertiary)',
                fontSize: 'var(--text-xs)',
                marginTop: 'var(--spacing-sm)',
                marginBottom: 0
              }}>
                💡 Deja vacío si no quieres cambiar el archivo
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDoc(null);
                }}
                className="btn btn-outline"
                style={{ flex: 1 }}
                disabled={updating}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div>
                    Actualizando...
                  </>
                ) : (
                  'Actualizar documento'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deletingDoc && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingDoc(null);
          }}
          onConfirm={handleDelete}
          title="¿Eliminar documento?"
          message={`¿Estás seguro de que quieres eliminar "${deletingDoc.title}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleting}
          danger
        />
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
          <li>• Tamaño máximo de archivo: 10MB</li>
          <li>• Los documentos se descargan al hacer clic</li>
          <li>• Usa la búsqueda para encontrar documentos rápidamente</li>
          <li>• Puedes editar o eliminar tus propios documentos</li>
          {user.role === 'admin' && <li>• Como admin, puedes gestionar todos los documentos</li>}
        </ul>
      </div>
    </div>
  );
}

export default Documents;
