import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function VoiceAssistant() {
  const { logout } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after a single command
    recognition.interimResults = true; // Show words as they are spoken
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatusText('Listening...');
      setErrorMsg('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const resultText = event.results[current][0].transcript;
      setTranscript(resultText);

      // If the result is final, process the command
      if (event.results[current].isFinal) {
        processCommand(resultText.toLowerCase().trim());
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      setStatusText('');
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone access denied.');
      } else {
        setErrorMsg(`Error: ${event.error}`);
      }
      
      // Auto clear error after 3 seconds
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setErrorMsg(''), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto clear transcript after processing
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setTranscript('');
        setStatusText('');
      }, 2000);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [navigate]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setErrorMsg('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  };

  const processCommand = async (command) => {
    setStatusText('Processing...');
    
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

    // 5. SEARCH INTENTS
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
        navigate(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
        return;
      }
    }

    // 6. PLAY / PAUSE INTENTS
    if (command.startsWith('play ')) {
      const query = command.replace('play ', '').trim();
      
      // General play/resume command (if in watch room)
      if (query === '' || query === 'movie' || query === 'video' || query === 'it') {
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'play' } }));
        setStatusText('Resuming video...');
        return;
      }

      // Treat as a search-and-play command
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
      window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'pause' } }));
      setStatusText('Pausing video...');
      return;
    }

    // SPEED INTENTS
    if (command.includes('speed') || command.includes('fast forward') || command.includes('slow down')) {
      let speed = 1;
      if (command.includes('2x') || command.includes('two x') || command.includes('twice')) speed = 2;
      else if (command.includes('1.5x')) speed = 1.5;
      else if (command.includes('1.25x')) speed = 1.25;
      else if (command.includes('0.5x') || command.includes('half')) speed = 0.5;
      else if (command.includes('1x') || command.includes('normal')) speed = 1;

      window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'speed', value: speed } }));
      setStatusText(`Speed set to ${speed}x`);
      return;
    }

    // 7. THEME INTENTS
    if (command.includes('theme') || command.includes('midnight cosmic') || command.includes('standard neon')) {
      if (command.includes('cosmic') || command.includes('midnight') || command.includes('dark')) {
        localStorage.setItem('syncstream_theme', 'cosmic');
        document.body.classList.add('theme-cosmic');
        setStatusText('Cosmic Theme Enabled');
      } else {
        localStorage.setItem('syncstream_theme', 'standard');
        document.body.classList.remove('theme-cosmic');
        setStatusText('Standard Theme Enabled');
      }
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
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
      
      {/* Status bubbles */}
      {(transcript || statusText || errorMsg) && (
        <div className="bg-darkCard/90 border border-darkBorder backdrop-blur-md p-3 rounded-2xl shadow-2xl max-w-xs animate-fade-in pointer-events-auto flex flex-col gap-1">
          {errorMsg ? (
            <span className="text-xs text-red-400 font-bold">{errorMsg}</span>
          ) : (
            <>
              {transcript && <span className="text-sm text-white italic">"{transcript}"</span>}
              {statusText && (
                <span className="text-xs text-accentCyan font-bold flex items-center gap-1.5">
                  {statusText === 'Listening...' && <Loader2 className="w-3 h-3 animate-spin" />}
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
        className={`pointer-events-auto p-4 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex items-center justify-center ${
          isListening 
            ? 'bg-gradient-to-r from-red-500 to-red-600 scale-110 animate-pulse text-white shadow-red-500/50' 
            : 'bg-gradient-to-r from-accentCyan to-accentPurple hover:scale-105 text-black btn-glow-purple'
        }`}
        title="Voice Assistant"
      >
        {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>
    </div>
  );
}
