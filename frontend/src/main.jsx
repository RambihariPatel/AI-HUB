import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import axios from 'axios';

import { API_BASE_URL } from './apiConfig.js';

// Global Axios Request Interceptor for Dynamic Production API URL Routing
axios.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith('http://localhost:5000')) {
      config.url = config.url.replace('http://localhost:5000', API_BASE_URL);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
