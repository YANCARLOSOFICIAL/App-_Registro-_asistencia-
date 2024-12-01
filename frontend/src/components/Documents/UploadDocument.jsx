import React, { useState } from 'react';
import API from '../../api';

const UploadDocument = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [file, setFile] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataWithFile = new FormData();
        formDataWithFile.append('title', formData.title);
        formDataWithFile.append('description', formData.description);
        formDataWithFile.append('file', file);

        try {
            const response = await API.post('/documents/upload', formDataWithFile);
            alert('Documento subido con éxito');
        } catch (error) {
            console.error(error);
            alert('Error al subir documento');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="title"
                placeholder="Título"
                onChange={handleChange}
                required
            />
            <textarea
                name="description"
                placeholder="Descripción"
                onChange={handleChange}
                required
            ></textarea>
            <input type="file" onChange={handleFileChange} required />
            <button type="submit">Subir Documento</button>
        </form>
    );
};

export default UploadDocument;
