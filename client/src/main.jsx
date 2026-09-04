import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Set API baseURL:
// - Local dev (localhost): point to Express backend on port 5000
// - Production (Netlify etc): leave empty so relative /api/* paths go through the proxy
if (typeof window !== 'undefined') {
  const hostname = window.location.hostname || 'localhost';
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
  if (import.meta.env.VITE_API_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
  } else if (isLocal) {
    axios.defaults.baseURL = `${window.location.protocol}//${hostname}:5000`;
  }
  // On production (Netlify), baseURL stays empty → requests go to /api/* → netlify.toml proxy handles it
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
