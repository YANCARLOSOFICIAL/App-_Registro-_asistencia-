import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api'; // Cambia esto si tu backend está en otro dominio o puerto.

export const get = async (endpoint) => {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error || 'Error al realizar la petición GET');
  }
};

export const post = async (endpoint, data) => {
  try {
    const response = await axios.post(`${BASE_URL}/${endpoint}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error || 'Error al realizar la petición POST');
  }
};
