import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Django backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
