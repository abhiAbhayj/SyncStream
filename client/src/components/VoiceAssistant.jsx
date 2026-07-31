import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function VoiceAssistant() {
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
    
    // COMMAND: Search
    // e.g. "search for batman" -> "batman"
    if (command.startsWith('search for ') || command.startsWith('search ')) {
      const query = command.replace('search for ', '').replace('search ', '').trim();
      if (query) {
        setStatusText(`Searching: ${query}`);
        navigate(`/search?q=${encodeURIComponent(query)}&type=movie`);
        return;
      }
    }

    // COMMAND: Play [Movie/Show]
    // e.g. "play kantara"
    if (command.startsWith('play ')) {
      const query = command.replace('play ', '').trim();
      
      // 1. Check if it's just a general play/resume command (if in watch room)
      if (query === '' || query === 'movie' || query === 'video') {
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'play' } }));
        setStatusText('Resuming video...');
        return;
      }

      // 2. Otherwise, treat it as a search-and-play command
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

    // COMMAND: Pause
    if (command.includes('pause') || command.includes('stop')) {
      window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'pause' } }));
      setStatusText('Pausing video...');
      return;
    }

    // COMMAND: Navigation
    if (command.includes('go home') || command === 'home') {
      navigate('/');
      setStatusText('Navigating Home...');
      return;
    }
    if (command.includes('profile')) {
      navigate('/profile');
      setStatusText('Opening Profile...');
      return;
    }
    if (command.includes('watchlist')) {
      navigate('/watchlist');
      setStatusText('Opening Watchlist...');
      return;
    }

    // Unknown command
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
