import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Dynamically set API baseURL for local network / Apache / mobile devices
if (typeof window !== 'undefined') {
  const isViteDev = window.location.port === '5173';
  if (!isViteDev && !import.meta.env.VITE_API_URL) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname || 'localhost';
    axios.defaults.baseURL = `${protocol}//${hostname}:5000`;
  } else if (import.meta.env.VITE_API_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
