import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';

export default function VoiceAssistant() {
  const { logout } = useAuth();
  const {
    playTrack,
    togglePlay,
    isPlaying,
    nextTrack,
    prevTrack,
    openLyricsModal,
    openPlayerModal
  } = useMusic();

  const [isListening, setIsListening] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [transcript, setTranscript] = useState('');
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const maxTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const hasProcessedRef = useRef(false);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
  }, []);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Continuous listening for 30 seconds
    recognition.interimResults = true; // Show words in real-time as they are spoken
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setErrorMsg('');
    };

    recognition.onresult = (event) => {
      let fullTranscript = '';
      let isFinal = false;

      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      const trimmed = fullTranscript.trim();
      setTranscript(trimmed);

      // If user provided an actionable complete command, process it
      if (isFinal && trimmed && !hasProcessedRef.current) {
        hasProcessedRef.current = true;
        processCommand(trimmed.toLowerCase().trim());
        setTimeout(() => {
          stopListening();
        }, 1200);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone access denied.');
        stopListening();
      } else if (event.error === 'no-speech') {
        // Ignore silence error during the 30s listening window
      } else {
        setErrorMsg(`Error: ${event.error}`);
      }
      
      // Auto clear error after 3 seconds
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setErrorMsg(''), 3000);
    };

    recognition.onend = () => {
      // If still within the 30-second listening window, auto-resume recognition
      if (isListeningRef.current && !hasProcessedRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      } else {
        setIsListening(false);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setTranscript('');
          setStatusText('');
        }, 3000);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    };
  }, [navigate, stopListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setTranscript('');
      setErrorMsg('');
      hasProcessedRef.current = false;
      setSecondsRemaining(30);
      setStatusText('Listening (30s)...');

      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);

      try {
        recognitionRef.current?.start();
        isListeningRef.current = true;
        setIsListening(true);

        // Live 30s countdown timer
        countdownIntervalRef.current = setInterval(() => {
          setSecondsRemaining((prev) => {
            const next = Math.max(0, prev - 1);
            setStatusText(`Listening (${next}s)...`);
            if (next <= 0) {
              clearInterval(countdownIntervalRef.current);
            }
            return next;
          });
        }, 1000);

        // 30-second max duration watchdog
        maxTimerRef.current = setTimeout(() => {
          stopListening();
          setStatusText('Listening timed out (30s).');
        }, 30000);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  };

  const processCommand = async (command) => {
    setStatusText('Processing...');
    
    // ════════════════════════════════════════════════════════════════════════
    // 0. MUSIC & SONG VOICE COMMANDS (High-Priority Voice Integration)
    // ════════════════════════════════════════════════════════════════════════

    // 0A. Direct Music Search (e.g. "search music monica", "search song monica", "find music ...", "find song ...")
    if (
      command.startsWith('search music ') ||
      command.startsWith('search song ') ||
      command.startsWith('search songs ') ||
      command.startsWith('search for music ') ||
      command.startsWith('search for song ') ||
      command.startsWith('find music ') ||
      command.startsWith('find song ') ||
      (command.startsWith('search ') && (command.includes('music') || command.includes('song') || window.location.pathname === '/music'))
    ) {
      let musicQuery = command
        .replace(/^(search for|search|find|lookup)\s+(music|song|songs|track|audio)?\s*/i, '')
        .replace(/\s+(song|music|audio|track)$/i, '')
        .trim();

      if (musicQuery) {
        setStatusText(`Searching Music: "${musicQuery}"`);
        const targetUrl = `/music?q=${encodeURIComponent(musicQuery)}`;
        if (window.location.pathname === '/music') {
          navigate(targetUrl, { replace: true });
        } else {
          navigate(targetUrl);
        }
        return;
      }
    }

    // 0B. Music Play Intent (e.g. "play music monica", "play song monica", "play monica song", "play track ...")
    if (
      command.startsWith('play music ') ||
      command.startsWith('play song ') ||
      command.startsWith('play track ') ||
      command.startsWith('play audio ') ||
      ((command.startsWith('play ') || command.startsWith('play the song ')) && (command.includes('song') || command.includes('music') || window.location.pathname === '/music'))
    ) {
      let musicQuery = command
        .replace(/^(play the song|play music|play song|play track|play audio|play)\s*/i, '')
        .replace(/\s+(song|music|audio|track)$/i, '')
        .trim();

      if (musicQuery) {
        setStatusText(`Finding song: "${musicQuery}"...`);
        try {
          const res = await axios.get('/api/music/search', {
            params: { query: musicQuery, category: 'all', page: 1, limit: 10 }
          });
          const trackList = res.data.songs || [];
          if (trackList.length > 0) {
            const first = trackList[0];
            playTrack(first, trackList);
            setStatusText(`Playing "${first.title}"!`);
            return;
          } else {
            setStatusText(`Searching Music for "${musicQuery}"...`);
            navigate(`/music?q=${encodeURIComponent(musicQuery)}`);
            return;
          }
        } catch (e) {
          navigate(`/music?q=${encodeURIComponent(musicQuery)}`);
          return;
        }
      }
    }

    // 0C. Music Controls (Pause / Resume / Next / Prev / Lyrics / Open Music)
    if (command === 'pause music' || command === 'pause song' || command === 'stop music' || (command === 'pause' && isPlaying)) {
      if (isPlaying) {
        togglePlay();
        setStatusText('Music Paused.');
      } else {
        setStatusText('No active music track.');
      }
      return;
    }

    if (command === 'resume music' || command === 'play music' || command === 'resume song' || command === 'unpause') {
      if (!isPlaying) {
        togglePlay();
        setStatusText('Music Resumed.');
      } else {
        setStatusText('Music is already playing.');
      }
      return;
    }

    if (command === 'next song' || command === 'next track' || command === 'skip song' || command === 'skip track') {
      nextTrack();
      setStatusText('Skipping to next track...');
      return;
    }

    if (command === 'previous song' || command === 'prev song' || command === 'previous track' || command === 'prev track') {
      prevTrack();
      setStatusText('Playing previous track...');
      return;
    }

    if (command.includes('show lyrics') || command.includes('open lyrics') || command.includes('synced lyrics')) {
      openLyricsModal();
      setStatusText('Opening Synced Lyrics...');
      return;
    }

    if (command === 'open music' || command === 'go to music' || command === 'music' || command === 'music player') {
      navigate('/music');
      setStatusText('Opening Music Studio...');
      return;
    }

    // 1. CATALOG / DISCOVERY INTENTS
    if (command.includes('trending') || command.includes('popular') || command.includes('top rated')) {
      let type = 'movie';
      if (command.includes('anime')) type = 'anime';
      else if (command.includes('tv') || command.includes('show')) type = 'tv';
      else if (command.includes('manga')) type = 'manga';

      let category = 'trending';
      if (command.includes('popular')) category = 'popular';
      if (command.includes('top rated') || command.includes('top-rated')) category = 'top_rated';

      setStatusText(`Opening ${category} ${type}s...`);
      navigate(`/catalog/${category}/${type}`);
      return;
    }

    // 2. PROFILE / AUTH INTENTS
    if (command.includes('edit profile') || command.includes('change avatar') || command.includes('my profile')) {
      navigate('/profile');
      setStatusText('Opening Profile...');
      return;
    }
    if (command.includes('log out') || command.includes('logout') || command.includes('sign out')) {
      setStatusText('Logging out...');
      setTimeout(() => logout(), 1000);
      return;
    }

    // 3. MEDIA DETAILS / SCHEDULE INTENTS (e.g. "What is the schedule of Kantara")
    if (command.includes('schedule of') || command.includes('schedule for') || command.includes('tell me about') || command.includes('details of')) {
      let query = command
        .replace('what is the schedule of', '')
        .replace('schedule for', '')
        .replace('tell me about', '')
        .replace('details of', '')
        .trim();
      
      setStatusText(`Looking up ${query}...`);
      try {
        // We guess type based on text, default to anime if they asked about anime
        const searchType = command.includes('anime') ? 'anime' : (command.includes('tv') ? 'tv' : 'movie');
        query = query.replace('the anime', '').replace('this anime', '').trim();

        const res = await axios.get('/api/media/search', {
          params: { query: query, type: searchType, page: 1 }
        });
        
        if (res.data && res.data.length > 0) {
          const firstResult = res.data[0];
          setStatusText(`Found ${firstResult.title}!`);
          setTimeout(() => {
            navigate(`/media/${searchType}/${firstResult.id}`);
          }, 1000);
        } else {
          setStatusText(`Couldn't find ${query}.`);
        }
      } catch (err) {
        setStatusText('Failed to search.');
      }
      return;
    }

    // 4. WATCH ROOM INTENTS
    if (command.includes('leave room') || command.includes('exit room') || command.includes('leave watch party')) {
      navigate('/');
      setStatusText('Leaving room...');
      return;
    }

    // 5. SEARCH INTENTS (General Movies / Series / Anime / Manga)
    if (command.startsWith('search for ') || command.startsWith('search ')) {
      let query = command.replace('search for ', '').replace('search ', '').trim();
      let searchType = 'movie';
      
      // Auto-detect media type from query
      if (query.includes('anime')) { searchType = 'anime'; query = query.replace('anime', '').trim(); }
      else if (query.includes('tv') || query.includes('series')) { searchType = 'tv'; query = query.replace('tv', '').replace('series', '').trim(); }
      else if (query.includes('manga')) { searchType = 'manga'; query = query.replace('manga', '').trim(); }
      else if (query.includes('movie')) { searchType = 'movie'; query = query.replace('movie', '').trim(); }

      if (query) {
        setStatusText(`Searching ${searchType}s: ${query}`);
        const searchUrl = `/search?q=${encodeURIComponent(query)}&type=${searchType}`;
        // If already on the search page, force a hard reload so the new params take effect immediately
        if (window.location.pathname === '/search') {
          window.location.href = searchUrl;
        } else {
          navigate(searchUrl);
        }
        return;
      }
    }

    // 6. PLAY INTENTS (Movies / Series)
    if (command.startsWith('play ')) {
      const query = command.replace('play ', '').trim();
      
      // General play/resume command (if in watch room)
      if (query === '' || query === 'movie' || query === 'video' || query === 'it') {
        setStatusText('External players must be clicked to play.');
        return;
      }

      // Treat as a search-and-play command for movies
      setStatusText(`Finding: ${query}...`);
      try {
        const res = await axios.get('/api/media/search', {
          params: { query: query, type: 'movie', page: 1 }
        });
        
        if (res.data && res.data.length > 0) {
          const firstResult = res.data[0];
          setStatusText(`Found ${firstResult.title}!`);
          setTimeout(() => {
            navigate(`/media/movie/${firstResult.id}`);
          }, 1000);
        } else {
          setStatusText(`Couldn't find ${query}.`);
        }
      } catch (err) {
        setStatusText('Failed to search.');
      }
      return;
    }

    if (command.includes('pause') || command.includes('stop')) {
      setStatusText('Cannot pause external iframe players.');
      return;
    }

    // SPEED INTENTS
    if (command.includes('speed') || command.includes('fast forward') || command.includes('slow down')) {
      setStatusText('Speed control disabled for external players.');
      return;
    }

    // 7. THEME INTENTS
    if (command.includes('theme') || command.includes('inferno') || command.includes('matrix') || command.includes('monochrome') || command.includes('black') || command.includes('white') || command.includes('arctic') || command.includes('ice') || command.includes('tokyo') || command.includes('gold') || command.includes('cyber') || command.includes('amethyst') || command.includes('ocean')) {
      const ALL_THEMES = ['theme-inferno', 'theme-matrix', 'theme-monochrome', 'theme-arctic', 'theme-tokyo', 'theme-cyber', 'theme-amethyst'];
      let newTheme = 'ocean';
      if (command.includes('inferno') || command.includes('fire') || command.includes('lava') || command.includes('red')) newTheme = 'inferno';
      else if (command.includes('matrix') || command.includes('terminal') || command.includes('green') || command.includes('lime')) newTheme = 'matrix';
      else if (command.includes('monochrome') || command.includes('black') || command.includes('white') || command.includes('noir') || command.includes('lunar')) newTheme = 'monochrome';
      else if (command.includes('arctic') || command.includes('ice') || command.includes('frost') || command.includes('glacier')) newTheme = 'arctic';
      else if (command.includes('tokyo') || command.includes('vaporwave') || command.includes('pink') || command.includes('neon')) newTheme = 'tokyo';
      else if (command.includes('cyber') || command.includes('gold') || command.includes('golden') || command.includes('solar')) newTheme = 'cyber';
      else if (command.includes('amethyst') || command.includes('nebula') || command.includes('purple') || command.includes('violet')) newTheme = 'amethyst';

      ALL_THEMES.forEach(cls => document.body.classList.remove(cls));
      if (newTheme !== 'ocean') document.body.classList.add(`theme-${newTheme}`);
      localStorage.setItem('syncstream_theme', newTheme);
      const labels = {
        ocean: '🌌 Cosmic Stargate',
        inferno: '🌋 Inferno Solaris',
        matrix: '⚡ Cyberpunk Holo-Matrix',
        monochrome: '🌑 Monolith Chrono',
        arctic: '🧊 Glacial Prism',
        tokyo: '🪩 Retro Synthwave Highway',
        cyber: '👑 Imperial Gold Luxe',
        amethyst: '🌿 Bio-Luminescent Pandora'
      };
      setStatusText(`Theme: ${labels[newTheme] || newTheme}`);
      return;
    }

    // 8. GENERAL NAVIGATION INTENTS
    if (command.includes('go home') || command === 'home') {
      navigate('/');
      setStatusText('Navigating Home...');
      return;
    }
    if (command.includes('watchlist') || command.includes('my list')) {
      navigate('/watchlist');
      setStatusText('Opening Watchlist...');
      return;
    }

    // Unknown command fallback
    setStatusText("Didn't catch that.");
  };

  // If API not supported in browser, render nothing
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    return null; 
  }

  return (
    <div className="fixed bottom-[145px] xs:bottom-[150px] sm:bottom-[84px] md:bottom-20 right-3 sm:right-5 z-40 flex flex-col items-end gap-1.5 pointer-events-none select-none">
      
      {/* Status bubbles */}
      {(transcript || statusText || errorMsg) && (
        <div className="bg-[#0f142b]/95 border border-white/20 backdrop-blur-xl px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-xl max-w-[220px] sm:max-w-xs animate-fade-in pointer-events-auto flex flex-col gap-0.5">
          {errorMsg ? (
            <span className="text-[11px] text-red-400 font-semibold">{errorMsg}</span>
          ) : (
            <>
              {transcript && <span className="text-[11px] sm:text-xs text-white italic truncate">"{transcript}"</span>}
              {statusText && (
                <span className="text-[10px] sm:text-xs text-accentCyan font-bold flex items-center gap-1">
                  {statusText === 'Listening...' && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                  {statusText}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={toggleListening}
        className={`pointer-events-auto w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 flex items-center justify-center border border-white/20 active:scale-90 ${
          isListening 
            ? 'bg-gradient-to-r from-red-500 to-red-600 scale-105 animate-pulse text-white shadow-red-500/50' 
            : 'bg-gradient-to-r from-accentCyan to-accentPurple hover:scale-105 text-black shadow-accentPurple/25'
        }`}
        title="Voice Assistant"
      >
        {isListening ? <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />}
      </button>
    </div>
  );
}
