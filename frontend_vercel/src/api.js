import axios from 'axios';

// Create an Axios instance pointing to Sheety API
const api = axios.create({
  baseURL: import.meta.env.VITE_SHEETY_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
