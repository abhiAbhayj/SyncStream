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
import ThemeBackground from './components/ThemeBackground';

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
import ForgotPassword from './pages/ForgotPassword';

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
    const ALL_THEMES = ['theme-inferno', 'theme-matrix', 'theme-monochrome', 'theme-arctic', 'theme-tokyo', 'theme-cyber', 'theme-amethyst'];
    const savedTheme = localStorage.getItem('syncstream_theme') || 'ocean';
    // Remove all theme classes first
    ALL_THEMES.forEach(cls => document.body.classList.remove(cls));
    // Apply the saved theme
    if (savedTheme !== 'ocean') {
      document.body.classList.add(`theme-${savedTheme}`);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <ThemeBackground />
      <ScrollRestoration />
      <Navbar />
      <main className={`flex-grow transition-all duration-300 ${currentTrack ? 'pb-36 md:pb-24' : 'pb-20 md:pb-0'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/music" element={<Music />} />
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
      <MusicPlayerBar />
      <MusicModal />
      <AddToPlaylistModal
        song={songForPlaylistModal}
        isOpen={Boolean(songForPlaylistModal)}
        onClose={closeAddToPlaylist}
      />
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
          <MusicProvider>
            <AppContent />
          </MusicProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
