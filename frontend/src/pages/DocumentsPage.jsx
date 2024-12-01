import React, { useState, useEffect } from 'react';
import { get } from '../services/api';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await get('documents');
        setDocuments(data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <div>
      <h2>Documentos</h2>
      <ul>
        {documents.map(doc => (
          <li key={doc._id}>
            {doc.title} - {doc.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentsPage;
