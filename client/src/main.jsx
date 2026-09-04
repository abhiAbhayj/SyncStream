import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Dynamically set API baseURL
if (typeof window !== 'undefined') {
  const envUrl = import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname || '';

  if (envUrl) {
    axios.defaults.baseURL = envUrl;
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development: connect to backend on port 5000
    const protocol = window.location.protocol;
    axios.defaults.baseURL = `${protocol}//${hostname}:5000`;
  } else {
    // Production (Netlify / remote host): use relative API path so Netlify proxy redirects work
    axios.defaults.baseURL = '';
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
