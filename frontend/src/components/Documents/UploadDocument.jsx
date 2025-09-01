import React, { useState } from 'react';
import API from '../../api';


const UploadDocument = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [fail, setFail] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
        if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
        if (!file) newErrors.file = 'Debes seleccionar un archivo';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setErrors({ ...errors, file: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        setFail('');
        if (!validate()) return;
        setLoading(true);
        const formDataWithFile = new FormData();
        formDataWithFile.append('title', formData.title);
        formDataWithFile.append('description', formData.description);
        formDataWithFile.append('file', file);
        try {
            await API.post('/documents/upload', formDataWithFile);
            setSuccess('Documento subido con éxito');
            setFormData({ title: '', description: '' });
            setFile(null);
        } catch (error) {
            setFail('Error al subir documento');
        } finally {
            setLoading(false);
        }
    };

            return (
                <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-blue-100">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-7 rounded-xl shadow-lg w-full max-w-md border border-gray-100"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700 tracking-tight">Subir Documento</h2>

                        {success && (
                            <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-center font-medium shadow-sm animate-fade-in">
                                {success}
                            </div>
                        )}
                        {fail && (
                            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center font-medium shadow-sm animate-fade-in">
                                {fail}
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor="title" className="block font-medium mb-1 text-base text-gray-700">
                                Título
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 transition-all duration-200 ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                                placeholder="Título del documento"
                                required
                            />
                            {errors.title && <span className="text-red-500 text-sm mt-1 block">{errors.title}</span>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="block font-medium mb-1 text-base text-gray-700">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 transition-all duration-200 ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                                placeholder="Describe el documento"
                                required
                                rows={3}
                            ></textarea>
                            {errors.description && <span className="text-red-500 text-sm mt-1 block">{errors.description}</span>}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="file" className="block font-medium mb-1 text-base text-gray-700">
                                Archivo
                            </label>
                            <input
                                type="file"
                                id="file"
                                onChange={handleFileChange}
                                className={`w-full px-4 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 transition-all duration-200 ${errors.file ? 'border-red-400' : 'border-gray-300'}`}
                                required
                            />
                            {errors.file && <span className="text-red-500 text-sm mt-1 block">{errors.file}</span>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-base shadow hover:bg-blue-700 transition duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Subiendo...' : 'Subir Documento'}
                        </button>
                    </form>
                </div>
            );
};

export default UploadDocument;
