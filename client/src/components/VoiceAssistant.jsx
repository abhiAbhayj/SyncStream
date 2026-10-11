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

const cleanSpokenTranscript = (text) => {
  if (!text) return '';
  // 1. Collapse multiple spaces
  let s = text.trim().replace(/\s+/g, ' ');
  // 2. Remove consecutive duplicate words: e.g. "search search search" -> "search"
  s = s.replace(/\b(\w+)(?:\s+\1\b)+/gi, '$1');
  // 3. Remove repeated 2-word phrases: e.g. "search movie search movie" -> "search movie"
  s = s.replace(/\b(\w+\s+\w+)(?:\s+\1\b)+/gi, '$1');
  return s.trim();
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
    currentTrack,
    queue,
    queueIndex,
    playTrack,
    togglePlay,
    isPlaying,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleLoop,
    openLyricsModal,
    openPlayerModal
  } = useMusic();

  const queueRef = useRef(queue);
  queueRef.current = queue;
  const queueIndexRef = useRef(queueIndex);
  queueIndexRef.current = queueIndex;
  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

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
    const text = cleanSpokenTranscript(rawText || '').trim();
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
      let finalTranscript = '';
      let interimTranscript = '';
      let isFinal = false;

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript + ' ';
          isFinal = true;
        } else {
          interimTranscript += item[0].transcript + ' ';
        }
      }

      const combined = cleanSpokenTranscript((finalTranscript + interimTranscript).trim());
      if (combined) {
        latestTranscriptRef.current = combined;
        setTranscript(combined);

        // Reset silence timer on every spoken phrase
        if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);

        // If marked final or after natural pause, auto-execute command
        if (isFinal) {
          speechSilenceTimerRef.current = setTimeout(() => {
            handleCommandExecution(latestTranscriptRef.current);
          }, 500);
        } else {
          speechSilenceTimerRef.current = setTimeout(() => {
            handleCommandExecution(latestTranscriptRef.current);
          }, 1300);
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

  const processCommand = async (rawCommand) => {
    let command = cleanSpokenTranscript(rawCommand || '').toLowerCase().trim();
    setStatusText('Processing...');
    
    // ════════════════════════════════════════════════════════════════════════
    // 0. PLAYLIST & MUSIC PLAYBACK CONTROLS (Next, Previous, Pause, Resume, Shuffle, Loop)
    // ════════════════════════════════════════════════════════════════════════

    // 0A. Next Song / Skip Song in Playlist or Queue
    const isNextSong =
      /^(play\s+)?(the\s+)?(next|skip)\s*(song|track|audio|music)?(\s+in\s+(my\s+)?playlist)?$/i.test(command) ||
      /^skip(\s+to\s+next)?(\s+song|\s+track|\s+music)?$/i.test(command) ||
      /^skip\s+this(\s+song|\s+track|\s+music)?$/i.test(command) ||
      /^(play\s+)?next\s+in\s+(my\s+)?playlist$/i.test(command) ||
      ((command === 'next' || command === 'skip') && (isPlayingRef.current || currentTrackRef.current));

    if (isNextSong) {
      const activeQueue = queueRef.current || [];
      const activeIdx = queueIndexRef.current || 0;
      if (activeQueue.length > 0) {
        const nextIdx = (activeIdx + 1) % activeQueue.length;
        const nextSong = activeQueue[nextIdx];
        nextTrack(true);
        setStatusText(nextSong?.title ? `Next Song: "${nextSong.title}"` : 'Skipping to next song...');
      } else if (currentTrackRef.current) {
        nextTrack(true);
        setStatusText('Skipping to next song...');
      } else {
        setStatusText('No active music playlist.');
      }
      return;
    }

    // 0B. Previous Song in Playlist or Queue
    const isPrevSong =
      /^(play\s+)?(the\s+)?(prev|previous|last|back)\s*(song|track|audio|music)?(\s+in\s+(my\s+)?playlist)?$/i.test(command) ||
      /^(go\s+back\s+(to\s+)?(prev|previous|last)\s*(song|track)?)$/i.test(command) ||
      /^(play\s+)?previous\s+in\s+(my\s+)?playlist$/i.test(command) ||
      (command === 'previous' && (isPlayingRef.current || currentTrackRef.current));

    if (isPrevSong) {
      const activeQueue = queueRef.current || [];
      const activeIdx = queueIndexRef.current || 0;
      if (activeQueue.length > 0) {
        const prevIdx = activeIdx - 1 < 0 ? activeQueue.length - 1 : activeIdx - 1;
        const prevSong = activeQueue[prevIdx];
        prevTrack(true);
        setStatusText(prevSong?.title ? `Previous Song: "${prevSong.title}"` : 'Playing previous song...');
      } else if (currentTrackRef.current) {
        prevTrack(true);
        setStatusText('Playing previous song...');
      } else {
        setStatusText('No active music playlist.');
      }
      return;
    }

    // 0C. Pause & Stop Music
    if (
      command === 'pause' ||
      command === 'pause music' ||
      command === 'pause song' ||
      command === 'stop music' ||
      command === 'stop song'
    ) {
      if (isPlayingRef.current) {
        togglePlay();
        setStatusText('Music Paused.');
      } else {
        setStatusText('Music is already paused.');
      }
      return;
    }

    // 0D. Resume & Play Current Music
    if (
      command === 'resume' ||
      command === 'resume music' ||
      command === 'resume song' ||
      command === 'unpause' ||
      command === 'play music' ||
      command === 'continue music'
    ) {
      if (!isPlayingRef.current && currentTrackRef.current) {
        togglePlay();
        setStatusText('Music Resumed.');
        return;
      } else if (isPlayingRef.current) {
        setStatusText('Music is already playing.');
        return;
      }
    }

    // 0E. Shuffle & Repeat Controls
    if (/^(toggle\s+|turn\s+on\s+|turn\s+off\s+)?shuffle(\s+music|\s+songs)?$/i.test(command)) {
      toggleShuffle();
      setStatusText('Toggled Playlist Shuffle.');
      return;
    }
    if (/^(toggle\s+|turn\s+on\s+|turn\s+off\s+)?(loop|repeat)(\s+music|\s+song|\s+track)?$/i.test(command)) {
      toggleLoop();
      setStatusText('Toggled Repeat Mode.');
      return;
    }

    // 0F. Synced Lyrics & Music Studio
    if (command.includes('show lyrics') || command.includes('open lyrics') || command.includes('synced lyrics')) {
      openLyricsModal();
      setStatusText('Opening Synced Lyrics...');
      return;
    }
    if (command === 'open music' || command === 'go to music' || command === 'music' || command === 'music player' || command === 'music studio') {
      navigate('/music');
      setStatusText('Opening Music Studio...');
      return;
    }

    // ════════════════════════════════════════════════════════════════════════
    // 1. UNIFIED DISCOVERY & SEARCH (Across EVERY Page: Movie, Anime, Series, Manga, Music)
    // ════════════════════════════════════════════════════════════════════════
    if (
      command.startsWith('search') ||
      command.startsWith('find ') ||
      command.startsWith('lookup ') ||
      command.startsWith('look up ')
    ) {
      let rawQuery = command
        .replace(/^(?:search\s+for|search|find|lookup|look\s+up)\s+/gi, '')
        .replace(/^(?:search\s+for|search|find|lookup|look\s+up)\s+/gi, '')
        .trim();

      // Check if user specifically requested music/song
      const isMusicKeyword = /\b(music|song|songs|track|audio)\b/i.test(rawQuery);
      const isExplicitMusic =
        /^(?:music|song|songs|track|audio)\s+/i.test(rawQuery) ||
        /\s+(?:music|song|songs|track|audio)$/i.test(rawQuery);

      if (isExplicitMusic || (isMusicKeyword && !/\b(anime|movie|tv|series|show|manga)\b/i.test(rawQuery))) {
        let cleanMusicQuery = rawQuery
          .replace(/^(?:music|song|songs|track|audio)\s+/gi, '')
          .replace(/\s+(?:music|song|songs|track|audio)$/gi, '')
          .replace(/\b(music|song|songs|track|audio)\b/gi, '')
          .replace(/^(?:for|about|the)\s+/i, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanMusicQuery) {
          setStatusText(`Searching Music: "${cleanMusicQuery}"`);
          const targetUrl = `/music?q=${encodeURIComponent(cleanMusicQuery)}`;
          if (window.location.pathname === '/music') {
            navigate(targetUrl, { replace: true });
          } else {
            navigate(targetUrl);
          }
          return;
        }
      }

      // Check Media Types: Anime, TV / Series, Manga, Movie
      let searchType = 'movie'; // default fallback

      if (/\b(anime)\b/i.test(rawQuery)) {
        searchType = 'anime';
        rawQuery = rawQuery.replace(/\banime\b/gi, '').trim();
      } else if (/\b(tv\s+series|tv\s+show|tv|series|shows|show)\b/i.test(rawQuery)) {
        searchType = 'tv';
        rawQuery = rawQuery.replace(/\b(tv\s+series|tv\s+show|tv|series|shows|show)\b/gi, '').trim();
      } else if (/\b(manga)\b/i.test(rawQuery)) {
        searchType = 'manga';
        rawQuery = rawQuery.replace(/\bmanga\b/gi, '').trim();
      } else if (/\b(movie|movies|film|films)\b/i.test(rawQuery)) {
        searchType = 'movie';
        rawQuery = rawQuery.replace(/\b(movie|movies|film|films)\b/gi, '').trim();
      }

      // Clean up filler words like "the", "for", "about"
      const cleanTitle = rawQuery
        .replace(/^(?:for|about|the)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanTitle) {
        const typeLabels = { movie: 'Movies', tv: 'TV Shows', anime: 'Anime', manga: 'Manga' };
        setStatusText(`Searching ${typeLabels[searchType] || searchType}: "${cleanTitle}"`);
        const searchUrl = `/search?q=${encodeURIComponent(cleanTitle)}&type=${searchType}`;
        if (window.location.pathname === '/search') {
          navigate(searchUrl, { replace: true });
        } else {
          navigate(searchUrl);
        }
        return;
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. DIRECT MUSIC PLAY INTENT (e.g. "play song monica", "play music believer")
    // ════════════════════════════════════════════════════════════════════════
    const isDirectSongPlay =
      /^(?:play|start)\s+(?:the\s+)?(?:music|song|track|audio)\s+(.+)$/i.test(command) ||
      /^(?:play|start)\s+(.+)\s+(?:song|music|track)$/i.test(command);

    if (isDirectSongPlay) {
      let songQuery = command
        .replace(/^(?:play|start)\s+(?:the\s+)?(?:music|song|track|audio)\s+/i, '')
        .replace(/\s+(?:song|music|track)$/i, '')
        .replace(/^(?:play|start)\s+/i, '')
        .trim();

      if (songQuery && !/^(next|previous|prev|last|pause|resume|stop|it)$/i.test(songQuery)) {
        setStatusText(`Finding song: "${songQuery}"...`);
        try {
          const res = await axios.get('/api/music/search', {
            params: { query: songQuery, category: 'all', page: 1, limit: 10 }
          });
          const trackList = res.data.songs || [];
          if (trackList.length > 0) {
            const first = trackList[0];
            playTrack(first, trackList);
            setStatusText(`Playing "${first.title}"!`);
            return;
          } else {
            setStatusText(`Searching Music: "${songQuery}"...`);
            navigate(`/music?q=${encodeURIComponent(songQuery)}`);
            return;
          }
        } catch (e) {
          navigate(`/music?q=${encodeURIComponent(songQuery)}`);
          return;
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // 3. EPISODE HOPPING & TV / ANIME EPISODE PLAY INTENTS
    // ════════════════════════════════════════════════════════════════════════
    // 3A. Relative episode hop on detail page
    if (window.location.pathname.startsWith('/media/')) {
      if (/^(next\s+episode|skip\s+episode|forward\s+episode)$/i.test(command)) {
        window.dispatchEvent(new CustomEvent('syncstream:change-episode', { detail: { delta: 1 } }));
        setStatusText('Playing Next Episode...');
        return;
      }
      if (/^(prev(ious)?\s+episode|last\s+episode|back\s+episode)$/i.test(command)) {
        window.dispatchEvent(new CustomEvent('syncstream:change-episode', { detail: { delta: -1 } }));
        setStatusText('Playing Previous Episode...');
        return;
      }
    }

    // 3B. Episode & Anime / TV parse (e.g. "play the first episode of anime solo leveling")
    const epQuery = parseEpisodeQuery(command);
    if (epQuery) {
      const { isNext, isPrev, season, episode, mediaType, cleanTitle } = epQuery;
      if (cleanTitle) {
        const epNum = typeof episode === 'number' ? episode : 1;
        setStatusText(`Finding "${cleanTitle}"...`);
        try {
          let res = await axios.get('/api/media/search', {
            params: { query: cleanTitle, type: mediaType, page: 1 }
          });
          let results = res.data || [];
          if (results.length === 0 && mediaType === 'anime') {
            res = await axios.get('/api/media/search', { params: { query: cleanTitle, type: 'tv', page: 1 } });
            results = res.data || [];
          }
          if (results.length === 0) {
            res = await axios.get('/api/media/search', { params: { query: cleanTitle, type: 'movie', page: 1 } });
            results = res.data || [];
          }

          if (results.length > 0) {
            const firstResult = results[0];
            const targetType = firstResult.media_type || mediaType || 'anime';
            setStatusText(`Playing ${firstResult.title} S${season} Ep ${epNum}!`);
            navigate(`/media/${targetType}/${firstResult.id}?season=${season}&episode=${epNum}&play=true`);
            return;
          } else {
            setStatusText(`Couldn't find show "${cleanTitle}".`);
            return;
          }
        } catch (err) {
          setStatusText(`Error searching for "${cleanTitle}".`);
          return;
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // 4. DIRECT MEDIA PLAY INTENTS: Movies / TV / Anime
    // ════════════════════════════════════════════════════════════════════════
    if (command.startsWith('play ') || command.startsWith('watch ')) {
      let query = command.replace(/^(play|watch)\s+/i, '').trim();

      // Guard against empty / generic play commands
      if (!query || query === 'movie' || query === 'video' || query === 'it' || query === 'show') {
        setStatusText('External players must be clicked to play.');
        return;
      }

      let detectedType = 'movie';
      if (/\banime\b/i.test(query)) {
        detectedType = 'anime';
        query = query.replace(/\banime\b/gi, '').trim();
      } else if (/\b(series|show|shows|tv)\b/i.test(query)) {
        detectedType = 'tv';
        query = query.replace(/\b(series|show|shows|tv)\b/gi, '').trim();
      } else if (/\bmovie(s)?\b/i.test(query)) {
        detectedType = 'movie';
        query = query.replace(/\bmovie(s)?\b/gi, '').trim();
      }

      setStatusText(`Finding: "${query}"...`);
      try {
        let res = await axios.get('/api/media/search', {
          params: { query, type: detectedType, page: 1 }
        });
        let results = res.data || [];

        // Fallback across types
        if (results.length === 0 && detectedType !== 'anime') {
          res = await axios.get('/api/media/search', { params: { query, type: 'anime', page: 1 } });
          results = res.data || [];
        }
        if (results.length === 0 && detectedType !== 'tv') {
          res = await axios.get('/api/media/search', { params: { query, type: 'tv', page: 1 } });
          results = res.data || [];
        }
        if (results.length === 0 && detectedType !== 'movie') {
          res = await axios.get('/api/media/search', { params: { query, type: 'movie', page: 1 } });
          results = res.data || [];
        }

        if (results.length > 0) {
          const firstResult = results[0];
          const finalType = firstResult.media_type || detectedType || 'movie';
          setStatusText(`Found ${firstResult.title}!`);
          setTimeout(() => {
            navigate(`/media/${finalType}/${firstResult.id}?play=true`);
          }, 600);
        } else {
          setStatusText(`Couldn't find "${query}".`);
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

    // ════════════════════════════════════════════════════════════════════════
    // 5. CATALOG / DISCOVERY CATEGORY INTENTS
    // ════════════════════════════════════════════════════════════════════════
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

    // ════════════════════════════════════════════════════════════════════════
    // 6. PROFILE / AUTH INTENTS
    // ════════════════════════════════════════════════════════════════════════
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

    // ════════════════════════════════════════════════════════════════════════
    // 7. MEDIA DETAILS / SCHEDULE INTENTS (e.g. "What is the schedule of Kantara")
    // ════════════════════════════════════════════════════════════════════════
    if (command.includes('schedule of') || command.includes('schedule for') || command.includes('tell me about') || command.includes('details of')) {
      let query = command
        .replace('what is the schedule of', '')
        .replace('schedule for', '')
        .replace('tell me about', '')
        .replace('details of', '')
        .trim();
      
      setStatusText(`Looking up ${query}...`);
      try {
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

    // ════════════════════════════════════════════════════════════════════════
    // 8. WATCH ROOM INTENTS
    // ════════════════════════════════════════════════════════════════════════
    if (command.includes('leave room') || command.includes('exit room') || command.includes('leave watch party')) {
      navigate('/');
      setStatusText('Leaving room...');
      return;
    }

    // ════════════════════════════════════════════════════════════════════════
    // 9. THEME INTENTS
    // ════════════════════════════════════════════════════════════════════════
    if (command.includes('theme') || command.includes('synthwave') || command.includes('aurora') || command.includes('solar flare') || command.includes('crimson') || command.includes('frost') || command.includes('glass') || command.includes('plasma') || command.includes('abyssal') || command.includes('trench') || command.includes('nebula') || command.includes('citrus') || command.includes('arcade')) {
      const ALL_THEMES = [
        'theme-synthwave',
        'theme-aurora',
        'theme-solar-flare',
        'theme-neon-frost',
        'theme-plasma-web',
        'theme-abyssal-trench',
        'theme-nebula-drift',
        'theme-citrus-arcade'
      ];
      let newTheme = 'synthwave';
      if (command.includes('aurora') || command.includes('twilight')) newTheme = 'aurora';
      else if (command.includes('solar') || command.includes('flare') || command.includes('crimson') || command.includes('ember')) newTheme = 'solar-flare';
      else if (command.includes('frost') || command.includes('glass') || command.includes('ice')) newTheme = 'neon-frost';
      else if (command.includes('plasma') || command.includes('web') || command.includes('cyber')) newTheme = 'plasma-web';
      else if (command.includes('abyssal') || command.includes('trench') || command.includes('ocean') || command.includes('wave')) newTheme = 'abyssal-trench';
      else if (command.includes('nebula') || command.includes('drift') || command.includes('quantum') || command.includes('star')) newTheme = 'nebula-drift';
      else if (command.includes('citrus') || command.includes('arcade') || command.includes('tangerine') || command.includes('pixel')) newTheme = 'citrus-arcade';
      else if (command.includes('synthwave') || command.includes('horizon') || command.includes('grid') || command.includes('default') || command.includes('reset')) newTheme = 'synthwave';

      ALL_THEMES.forEach(cls => document.body.classList.remove(cls));
      document.body.classList.add(`theme-${newTheme}`);
      localStorage.setItem('syncstream_theme', newTheme);
      const labels = {
        synthwave: '⚡ Vibrant Synthwave Horizon',
        aurora: '🌌 Electric Twilight Aurora',
        'solar-flare': '🔥 Crimson Solar Flare',
        'neon-frost': '💎 Neon Frost Glassmorphism',
        'plasma-web': '🪐 Cyberpunk Plasma Web',
        'abyssal-trench': '🌊 Neon Abyssal Trench',
        'nebula-drift': '🚀 Quantum Nebula Drift',
        'citrus-arcade': '🍊 Neon Citrus Arcade'
      };
      setStatusText(`Theme: ${labels[newTheme] || newTheme}`);
      return;
    }

    // ════════════════════════════════════════════════════════════════════════
    // 10. GENERAL NAVIGATION INTENTS
    // ════════════════════════════════════════════════════════════════════════
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
