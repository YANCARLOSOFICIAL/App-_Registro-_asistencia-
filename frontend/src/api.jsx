import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Ajusta la URL si es necesario
});

export default API;
