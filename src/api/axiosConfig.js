// src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://app.jettonwallet.com/api/v1',
});

export default api;
