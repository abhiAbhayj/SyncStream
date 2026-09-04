import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Dynamically set API baseURL to always point to Node.js backend on port 5000
// Works for: Vite dev (localhost:5173), Apache/dist (localhost:80), mobile LAN (192.168.x.x:any)
if (typeof window !== 'undefined') {
  if (import.meta.env.VITE_API_URL) {
    // Production: use env var (e.g. Render/Railway hosted backend)
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
  } else {
    // Local development (Vite or Apache): always connect to backend on port 5000
    const protocol = window.location.protocol;
    const hostname = window.location.hostname || 'localhost';
    axios.defaults.baseURL = `${protocol}//${hostname}:5000`;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
