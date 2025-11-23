import { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({
  onFileSelect,
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  label = 'Arrastra un archivo aquí o haz clic para seleccionar',
  icon = '📁'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      setError(`El archivo no debe superar los ${maxSizeMB}MB`);
      return false;
    }

    // Check file type if accept is specified
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileExtension = '.' + file.name.split('.').pop();
      const isAccepted = acceptedTypes.some(type =>
        type === fileExtension || file.type === type
      );

      if (!isAccepted) {
        setError(`Tipo de archivo no permitido. Acepta: ${accept}`);
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    if (!filename) return icon;
    if (filename.endsWith('.pdf')) return '📄';
    if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return '🖼️';
    if (filename.match(/\.(doc|docx)$/i)) return '📝';
    if (filename.match(/\.(xls|xlsx)$/i)) return '📊';
    if (filename.match(/\.(zip|rar|7z)$/i)) return '📦';
    return '📁';
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        className="file-upload-input"
        onChange={handleFileInput}
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
      />

      {!selectedFile ? (
        <div
          className={`file-upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="file-upload-icon">{icon}</div>
          <p className="file-upload-label">{label}</p>
          <p className="file-upload-hint">
            {accept !== '*' && `Formatos aceptados: ${accept}`}
            {accept !== '*' && maxSize && ' • '}
            {maxSize && `Tamaño máximo: ${formatFileSize(maxSize)}`}
          </p>
        </div>
      ) : (
        <div className="file-upload-preview">
          <div className="file-upload-file">
            <span className="file-upload-file-icon">{getFileIcon(selectedFile.name)}</span>
            <div className="file-upload-file-info">
              <p className="file-upload-file-name">{selectedFile.name}</p>
              <p className="file-upload-file-size">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              className="file-upload-remove"
              onClick={handleRemove}
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="file-upload-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
