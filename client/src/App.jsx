import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import ScrollRestoration from './components/ScrollRestoration';
import VoiceAssistant from './components/VoiceAssistant';
import ServerWakeup from './components/ServerWakeup';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import MediaDetail from './pages/MediaDetail';
import WatchParty from './pages/WatchParty';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import ForgotPassword from './pages/ForgotPassword';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // let context finish loading token profile
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppContent() {
  React.useEffect(() => {
    const ALL_THEMES = ['theme-inferno', 'theme-emerald', 'theme-cyber'];
    const savedTheme = localStorage.getItem('syncstream_theme') || 'ocean';
    // Remove all theme classes first
    ALL_THEMES.forEach(cls => document.body.classList.remove(cls));
    // Apply the saved theme
    if (savedTheme !== 'ocean') {
      document.body.classList.add(`theme-${savedTheme}`);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollRestoration />
      <Navbar />
      <main className="flex-grow pb-24 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/media/:type/:id" element={<MediaDetail />} />
          <Route path="/catalog/:category/:type" element={<Catalog />} />
          
          {/* Protected Routes */}
          <Route 
            path="/room/:code" 
            element={
              <ProtectedRoute>
                <WatchParty />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/watchlist" 
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
      <VoiceAssistant />
      <ServerWakeup />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
