import React, { useEffect, useState } from 'react';

function Documents() {
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
    if (!file || file.type !== "application/pdf") {
      setUploadError("Debes seleccionar un archivo PDF");
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
        setTitle(""); setDescription(""); setFile(null);
        setDocuments((docs) => [...docs, data.document]);
        setUploadSuccess("Documento subido exitosamente");
      } else {
        setUploadError(data.error || "Error al subir documento");
      }
    } catch (err) {
      setUploadError("Error de red");
    }
    setUploading(false);
  };
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch('http://localhost:5000/api/documents')
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>Documentos</h2>
      <form onSubmit={handleUpload} style={{ marginBottom: 20 }}>
        <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="text" placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} required />
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} required />
        <button type="submit" disabled={uploading}>Subir PDF</button>
        {uploadError && <p style={{color:'red'}}>{uploadError}</p>}
        {uploadSuccess && <p style={{color:'green'}}>{uploadSuccess}</p>}
      </form>
      {loading ? <p>Cargando...</p> : (
        <ul>
          {documents.map(doc => (
            <li key={doc._id}>
              {doc.title} - {doc.description}
              <a href={`http://localhost:5000/api/documents/${doc._id}/download`} target="_blank" rel="noopener noreferrer"> Descargar </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Documents;
