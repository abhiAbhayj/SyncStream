import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MusicProvider, useMusic } from './context/MusicContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import ScrollRestoration from './components/ScrollRestoration';
import VoiceAssistant from './components/VoiceAssistant';
import ServerWakeup from './components/ServerWakeup';
import MusicPlayerBar from './components/MusicPlayerBar';
import MusicModal from './components/MusicModal';
import AddToPlaylistModal from './components/AddToPlaylistModal';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import Music from './pages/Music';
import MediaDetail from './pages/MediaDetail';
import WatchParty from './pages/WatchParty';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import PersonDetail from './pages/PersonDetail';
import ForgotPassword from './pages/ForgotPassword';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import SpotlightSearchModal from './components/SpotlightSearchModal';

import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // let context finish loading token profile
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppContent() {
  const { currentTrack, songForPlaylistModal, closeAddToPlaylist } = useMusic();

  React.useEffect(() => {
    const ALL_THEMES = [
      'theme-cinema-slate',
      'theme-midnight-velvet',
      'theme-nordic-monolith',
      'theme-emerald-noir',
      'theme-royal-amethyst',
      'theme-amber-solstice',
      // Legacy classes
      'theme-cryo-glacial',
      'theme-magma-thermal',
      'theme-emerald-biogrid',
      'theme-cobalt-quantum',
      'theme-golden-sunfire',
      'theme-obsidian-void',
      'theme-cyberpunk-synthwave',
      'theme-mystic-amethyst',
      'theme-storm-thunder',
      'theme-synthwave',
      'theme-cryo-vault',
      'theme-solar-flare',
      'theme-cosmic-singularity',
      'theme-plasma-web',
      'theme-cyber-foundry',
      'theme-bioluminescent-trench',
      'theme-windy-sakura',
      'theme-yokohama-night'
    ];
    const validThemes = [
      'cinema-slate',
      'midnight-velvet',
      'nordic-monolith',
      'emerald-noir',
      'royal-amethyst',
      'amber-solstice'
    ];
    let savedTheme = localStorage.getItem('syncstream_theme') || 'cinema-slate';
    const legacyMap = {
      'cryo-glacial': 'cinema-slate',
      'cryo-vault': 'cinema-slate',
      'obsidian-void': 'nordic-monolith',
      'magma-thermal': 'midnight-velvet',
      'solar-flare': 'midnight-velvet',
      'emerald-biogrid': 'emerald-noir',
      'plasma-web': 'emerald-noir',
      'cobalt-quantum': 'royal-amethyst',
      'storm-thunder': 'royal-amethyst',
      'mystic-amethyst': 'royal-amethyst',
      'golden-sunfire': 'cinema-slate',
      'cyberpunk-synthwave': 'royal-amethyst',
      synthwave: 'royal-amethyst',
      aurora: 'cinema-slate',
      'neon-frost': 'nordic-monolith',
      'abyssal-trench': 'royal-amethyst',
      'nebula-drift': 'royal-amethyst',
      'citrus-arcade': 'cinema-slate'
    };
    if (legacyMap[savedTheme]) {
      savedTheme = legacyMap[savedTheme];
      localStorage.setItem('syncstream_theme', savedTheme);
    } else if (!validThemes.includes(savedTheme)) {
      savedTheme = 'cinema-slate';
      localStorage.setItem('syncstream_theme', 'cinema-slate');
    }
    ALL_THEMES.forEach(cls => document.body.classList.remove(cls));
    document.body.classList.add(`theme-${savedTheme}`);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-clip w-full max-w-full">
      <ScrollRestoration />
      <Navbar />
      <main className="flex-grow transition-all duration-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/music" element={<Music />} />
          <Route path="/media/:type/:id" element={<MediaDetail />} />
          <Route path="/person/:source/:id" element={<PersonDetail />} />
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
      <MusicPlayerBar />
      <MusicModal />
      <AddToPlaylistModal
        song={songForPlaylistModal}
        isOpen={Boolean(songForPlaylistModal)}
        onClose={closeAddToPlaylist}
      />
      <VoiceAssistant />
      <ServerWakeup />
      <LogoutConfirmModal />
      <SpotlightSearchModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <MusicProvider>
              <AppContent />
            </MusicProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
