import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';

const WORD_TO_NUM = {
  first: 1, '1st': 1, one: 1,
  second: 2, '2nd': 2, two: 2,
  third: 3, '3rd': 3, three: 3,
  fourth: 4, '4th': 4, four: 4,
  fifth: 5, '5th': 5, five: 5,
  sixth: 6, '6th': 6, six: 6,
  seventh: 7, '7th': 7, seven: 7,
  eighth: 8, '8th': 8, eight: 8,
  ninth: 9, '9th': 9, nine: 9,
  tenth: 10, '10th': 10, ten: 10,
  eleventh: 11, '11th': 11, eleven: 11,
  twelfth: 12, '12th': 12, twelve: 12,
  thirteenth: 13, '13th': 13, thirteen: 13,
  fourteenth: 14, '14th': 14, fourteen: 14,
  fifteenth: 15, '15th': 15, fifteen: 15,
  sixteenth: 16, '16th': 16, sixteen: 16,
  seventeenth: 17, '17th': 17, seventeen: 17,
  eighteenth: 18, '18th': 18, eighteen: 18,
  nineteenth: 19, '19th': 19, nineteen: 19,
  twentieth: 20, '20th': 20, twenty: 20
};

function parseEpisodeQuery(rawCommand) {
  let text = (rawCommand || '').toLowerCase().trim();

  // Check if command is episode related or relative hop
  const hasEpWord = /\b(episode|episodes|ep|eps|season|seasons|anime)\b/i.test(text);
  const isNext = /\b(next\s+episode|skip\s+episode|forward\s+episode)\b/i.test(text) || (text === 'next' && window.location.pathname.startsWith('/media/'));
  const isPrev = /\b(prev(ious)?\s+episode|last\s+episode|back\s+episode)\b/i.test(text) || (text === 'previous' && window.location.pathname.startsWith('/media/'));

  if (!hasEpWord && !isNext && !isPrev) {
    return null;
  }

  // Season number extraction
  let season = 1;
  const seasonMatch = text.match(/\bseason\s+(\d+|first|second|third|fourth|fifth|sixth|one|two|three|four|five|six|\d+(st|nd|rd|th)?)\b/i);
  if (seasonMatch) {
    const sVal = seasonMatch[1].toLowerCase();
    season = WORD_TO_NUM[sVal] || parseInt(sVal, 10) || 1;
  }

  // Episode number extraction
  let episode = null;
  const epMatch1 = text.match(/\bepisode\s+(\d+|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|one|two|three|four|five|six|seven|eight|nine|ten|\d+(st|nd|rd|th)?)\b/i);
  const epMatch2 = text.match(/\b(\d+|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|one|two|three|four|five|six|seven|eight|nine|ten|\d+(st|nd|rd|th))\s+episode\b/i);
  
  if (epMatch1) {
    const epVal = epMatch1[1].toLowerCase();
    episode = WORD_TO_NUM[epVal] || parseInt(epVal, 10) || 1;
  } else if (epMatch2) {
    const epVal = epMatch2[1].toLowerCase();
    episode = WORD_TO_NUM[epVal] || parseInt(epVal, 10) || 1;
  }

  if (!episode) {
    if (isNext) episode = 'next';
    else if (isPrev) episode = 'prev';
    else if (text.includes('first')) episode = 1;
    else episode = 1;
  }

  // Media type hint
  let mediaType = 'anime';
  if (text.includes('anime')) {
    mediaType = 'anime';
  } else if (text.includes('tv') || text.includes('series') || text.includes('show') || text.includes('drama')) {
    mediaType = 'tv';
  }

  // Clean title extraction
  let cleanTitle = text
    .replace(/^(play|watch|stream|open|start|find|go\s+to)\s+/i, '')
    .replace(/\b(the\s+)?(first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|next|previous|prev|last)?\s*episode\s*(of)?\b/gi, '')
    .replace(/\bepisode\s*(\d+|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|one|two|three|four|five|six|seven|eight|nine|ten|\d+(st|nd|rd|th)?)\s*(of)?\b/gi, '')
    .replace(/\bseason\s*(\d+|first|second|third|fourth|fifth|one|two|three|four|five|\d+(st|nd|rd|th)?)\s*(of)?\b/gi, '')
    .replace(/\b(anime|tv series|tv show|tv|series|show|drama|movie)\b/gi, '')
    .replace(/\b(of|in|for|on|the)\b/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  return { isNext, isPrev, season, episode, mediaType, cleanTitle };
}

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
  const speechSilenceTimerRef = useRef(null);
  const restartTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const hasProcessedRef = useRef(false);
  const latestTranscriptRef = useRef('');
  const processCommandRef = useRef(null);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
  }, []);

  const handleCommandExecution = useCallback((rawText) => {
    const text = (rawText || '').trim();
    if (!text || hasProcessedRef.current) return;
    hasProcessedRef.current = true;
    if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

    if (processCommandRef.current) {
      processCommandRef.current(text.toLowerCase());
    }
    setTimeout(() => {
      stopListening();
    }, 1200);
  }, [stopListening]);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Continuous listening
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
      if (trimmed) {
        latestTranscriptRef.current = trimmed;
        setTranscript(trimmed);

        // Reset silence timer on every spoken phrase
        if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);

        // If marked final or after natural 1.3s pause, auto-execute command
        if (isFinal) {
          speechSilenceTimerRef.current = setTimeout(() => {
            handleCommandExecution(latestTranscriptRef.current);
          }, 600);
        } else {
          speechSilenceTimerRef.current = setTimeout(() => {
            handleCommandExecution(latestTranscriptRef.current);
          }, 1400);
        }
      }
    };

    recognition.onerror = (event) => {
      // 'aborted' and 'no-speech' are natural browser events during continuous listening
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }

      console.warn("Speech recognition notice:", event.error);
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone access denied.');
        stopListening();
      } else if (event.error === 'network') {
        setErrorMsg('Network error.');
      } else if (event.error === 'audio-capture') {
        setErrorMsg('No mic detected.');
      }
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setErrorMsg(''), 3000);
    };

    recognition.onend = () => {
      // If still within the 30-second window and command hasn't been executed yet, auto-restart cleanly
      if (isListeningRef.current && !hasProcessedRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (isListeningRef.current && !hasProcessedRef.current) {
            try {
              recognition.start();
            } catch (e) {
              console.warn("Recognition restart notice:", e);
            }
          }
        }, 150);
      } else {
        setIsListening(false);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
        if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
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
      if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, [handleCommandExecution, stopListening]);

  const toggleListening = () => {
    if (isListening) {
      if (latestTranscriptRef.current && !hasProcessedRef.current) {
        handleCommandExecution(latestTranscriptRef.current);
      } else {
        stopListening();
      }
    } else {
      setTranscript('');
      setErrorMsg('');
      latestTranscriptRef.current = '';
      hasProcessedRef.current = false;
      setSecondsRemaining(30);
      setStatusText('Listening (30s)...');

      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

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
          if (latestTranscriptRef.current && !hasProcessedRef.current) {
            handleCommandExecution(latestTranscriptRef.current);
          } else {
            stopListening();
            setStatusText('Listening timed out (30s).');
          }
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

    // 5.5. EPISODE & ANIME / TV PLAY INTENTS (e.g. "play the first episode of anime solo leveling", "next episode")
    const epQuery = parseEpisodeQuery(command);
    if (epQuery) {
      const { isNext, isPrev, season, episode, mediaType, cleanTitle } = epQuery;

      // Case A: User is on a Media Detail page and requested relative or numeric episode jump
      if (window.location.pathname.startsWith('/media/')) {
        if (isNext || episode === 'next') {
          window.dispatchEvent(new CustomEvent('syncstream:change-episode', { detail: { delta: 1 } }));
          setStatusText('Playing Next Episode...');
          return;
        }
        if (isPrev || episode === 'prev') {
          window.dispatchEvent(new CustomEvent('syncstream:change-episode', { detail: { delta: -1 } }));
          setStatusText('Playing Previous Episode...');
          return;
        }
        if (!cleanTitle && typeof episode === 'number') {
          window.dispatchEvent(new CustomEvent('syncstream:change-episode', { detail: { episode, season } }));
          setStatusText(`Playing Episode ${episode}...`);
          return;
        }
      }

      // Case B: Cross-Catalog Search & Direct Play for Episode (e.g. "play the first episode of anime solo leveling")
      if (cleanTitle) {
        const epNum = typeof episode === 'number' ? episode : 1;
        setStatusText(`Finding "${cleanTitle}"...`);
        try {
          // 1. Search anime / TV
          let res = await axios.get('/api/media/search', {
            params: { query: cleanTitle, type: mediaType, page: 1 }
          });
          let results = res.data || [];

          // 2. Fallback to TV if anime gave 0 results
          if (results.length === 0 && mediaType === 'anime') {
            res = await axios.get('/api/media/search', {
              params: { query: cleanTitle, type: 'tv', page: 1 }
            });
            results = res.data || [];
          }

          // 3. Fallback to Movie if still 0 results
          if (results.length === 0) {
            res = await axios.get('/api/media/search', {
              params: { query: cleanTitle, type: 'movie', page: 1 }
            });
            results = res.data || [];
          }

          if (results.length > 0) {
            const firstResult = results[0];
            const targetType = firstResult.media_type || mediaType || 'anime';
            setStatusText(`Playing ${firstResult.title} S${season} Ep ${epNum}!`);
            const targetUrl = `/media/${targetType}/${firstResult.id}?season=${season}&episode=${epNum}&play=true`;
            navigate(targetUrl);
            return;
          } else {
            setStatusText(`Couldn't find show "${cleanTitle}".`);
            return;
          }
        } catch (err) {
          console.error("Episode voice search error:", err);
          setStatusText(`Error searching for "${cleanTitle}".`);
          return;
        }
      }
    }

    // 6. PLAY INTENTS (Movies / TV / Anime)
    if (command.startsWith('play ') || command.startsWith('watch ')) {
      let query = command.replace(/^(play|watch)\s+/i, '').trim();
      
      // General play/resume command (if in watch room)
      if (query === '' || query === 'movie' || query === 'video' || query === 'it') {
        setStatusText('External players must be clicked to play.');
        return;
      }

      let detectedType = 'movie';
      if (query.includes('anime')) {
        detectedType = 'anime';
        query = query.replace('anime', '').trim();
      } else if (query.includes('series') || query.includes('show') || query.includes('tv')) {
        detectedType = 'tv';
        query = query.replace(/(series|show|tv)/i, '').trim();
      }

      setStatusText(`Finding: ${query}...`);
      try {
        let res = await axios.get('/api/media/search', {
          params: { query: query, type: detectedType, page: 1 }
        });
        let results = res.data || [];
        
        // Fallback across types if 0 results
        if (results.length === 0 && detectedType !== 'anime') {
          res = await axios.get('/api/media/search', { params: { query: query, type: 'anime', page: 1 } });
          results = res.data || [];
        }
        if (results.length === 0 && detectedType !== 'tv') {
          res = await axios.get('/api/media/search', { params: { query: query, type: 'tv', page: 1 } });
          results = res.data || [];
        }
        if (results.length === 0 && detectedType !== 'movie') {
          res = await axios.get('/api/media/search', { params: { query: query, type: 'movie', page: 1 } });
          results = res.data || [];
        }

        if (results.length > 0) {
          const firstResult = results[0];
          const finalType = firstResult.media_type || detectedType || 'movie';
          setStatusText(`Found ${firstResult.title}!`);
          setTimeout(() => {
            navigate(`/media/${finalType}/${firstResult.id}?play=true`);
          }, 800);
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
    if (command.includes('theme') || command.includes('quantum') || command.includes('cyber') || command.includes('matrix') || command.includes('monolith') || command.includes('chrono') || command.includes('gyro') || command.includes('solar') || command.includes('flare') || command.includes('emerald') || command.includes('synapse') || command.includes('horizon') || command.includes('drift') || command.includes('stargate') || command.includes('wormhole') || command.includes('imperial') || command.includes('gold') || command.includes('luxe')) {
      const ALL_THEMES = [
        'theme-cyberpunk',
        'theme-monolith',
        'theme-solar',
        'theme-emerald',
        'theme-neon-horizon',
        'theme-stargate',
        'theme-imperial'
      ];
      let newTheme = 'quantum';
      if (command.includes('cyber') || command.includes('matrix') || command.includes('hacker')) newTheme = 'cyberpunk';
      else if (command.includes('monolith') || command.includes('chrono') || command.includes('gyro') || command.includes('stock')) newTheme = 'monolith';
      else if (command.includes('solar') || command.includes('flare') || command.includes('sun') || command.includes('corona')) newTheme = 'solar';
      else if (command.includes('emerald') || command.includes('synapse') || command.includes('neural') || command.includes('forest')) newTheme = 'emerald';
      else if (command.includes('horizon') || command.includes('drift') || command.includes('speed') || command.includes('synth')) newTheme = 'neon-horizon';
      else if (command.includes('stargate') || command.includes('wormhole') || command.includes('vortex')) newTheme = 'stargate';
      else if (command.includes('imperial') || command.includes('gold') || command.includes('luxe') || command.includes('astrolabe')) newTheme = 'imperial';
      else if (command.includes('quantum') || command.includes('flux') || command.includes('default') || command.includes('reset')) newTheme = 'quantum';

      ALL_THEMES.forEach(cls => document.body.classList.remove(cls));
      if (newTheme !== 'quantum') document.body.classList.add(`theme-${newTheme}`);
      localStorage.setItem('syncstream_theme', newTheme);
      const labels = {
        quantum: '🌌 Quantum Flux',
        cyberpunk: '⚡ Cyberpunk Matrix',
        monolith: '🌑 Monolith Chrono',
        solar: '🔥 Solar Flare',
        emerald: '🌿 Emerald Synapse',
        'neon-horizon': '🏎️ Neon Horizon',
        stargate: '🌀 Cosmic Stargate',
        imperial: '👑 Imperial Gold Luxe'
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

  processCommandRef.current = processCommand;

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
