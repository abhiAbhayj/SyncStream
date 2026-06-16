import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import { Tv, Sparkles, Search, MessageSquareCode, Users, Flame, Activity, Calendar, CalendarDays, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('homeActiveTab') || 'trending';
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem('homeActiveTab', tabId);
  };

  const daysOfWeek = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  const [selectedDay, setSelectedDay] = useState(() => {
    const currentDayIndex = new Date().getDay();
    return daysOfWeek[currentDayIndex];
  });

  const getSchedulesByDay = (animeList) => {
    const grouped = {
      Mondays: [],
      Tuesdays: [],
      Wednesdays: [],
      Thursdays: [],
      Fridays: [],
      Saturdays: [],
      Sundays: []
    };

    if (animeList) {
      animeList.forEach(item => {
        const broadcastStr = item.broadcast || '';
        if (!broadcastStr || 
            broadcastStr.toLowerCase().includes('unknown') || 
            broadcastStr.toLowerCase().includes('not scheduled') || 
            broadcastStr.toLowerCase().includes('once per week')) {
          return; // Skip unknown/unscheduled listings
        }

        let matchedDay = null;
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (const day of dayNames) {
          if (broadcastStr.toLowerCase().includes(day.toLowerCase())) {
            matchedDay = day + 's';
            break;
          }
        }
        
        if (matchedDay) {
          grouped[matchedDay].push(item);
        }
      });
    }
    return grouped;
  };

  const getCombinedAnimeSchedules = () => {
    if (!media) return [];
    const combined = [];
    const seen = new Set();
    
    const addItems = (list) => {
      if (!list) return;
      list.forEach(item => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      });
    };
    
    addItems(media.schedule?.anime);
    addItems(media.ongoing?.anime);
    addItems(media.upcoming?.anime);
    
    return combined;
  };

  const getCombinedTvSchedules = () => {
    if (!media) return [];
    const combined = [];
    const seen = new Set();
    
    const addItems = (list) => {
      if (!list) return;
      list.forEach(item => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      });
    };
    
    addItems(media.schedule?.tv);
    addItems(media.ongoing?.tv);
    addItems(media.upcoming?.tv);
    
    return combined;
  };

  const getTvSchedulesByDay = (tvList) => {
    const grouped = {
      Mondays: [],
      Tuesdays: [],
      Wednesdays: [],
      Thursdays: [],
      Fridays: [],
      Saturdays: [],
      Sundays: []
    };

    if (tvList) {
      tvList.forEach(item => {
        if (item.broadcast_day && grouped[item.broadcast_day]) {
          grouped[item.broadcast_day].push(item);
        } else {
          // Fallback if TMDB failed to provide an air day for some reason
          const dayIndex = (parseInt(item.id, 10) || 0) % 7;
          grouped[daysOfWeek[dayIndex]].push(item);
        }
      });
    }
    return grouped;
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/media/trending');
        setMedia(res.data);
      } catch (err) {
        console.error('Failed to load home catalog:', err);
        setError('Could not connect to external media APIs. Retrying shortly...');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const tabs = [
    { id: 'trending', label: 'Trending Hits', icon: Flame, color: 'text-amber-500' },
    { id: 'ongoing', label: 'Ongoing & Airing', icon: Activity, color: 'text-emerald-400' },
    { id: 'schedule', label: 'Release Schedules', icon: Calendar, color: 'text-cyan-400' },
    { id: 'upcoming', label: 'Upcoming & Latest', icon: CalendarDays, color: 'text-fuchsia-400' }
  ];

  return (
    <div className="space-y-16 py-6 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* Premium Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-darkBorder p-8 md:p-16 text-center space-y-6 shadow-2xl">
        {/* Glow dots decoration */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-accentPurple/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accentCyan/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300">
          <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
          The Ultimate Shared Streaming Hub
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight font-outfit">
          Discover Global Entertainment & <br className="hidden md:inline"/>
          <span className="bg-gradient-to-r from-accentCyan via-accentPurple to-accentPink bg-clip-text text-transparent title-glow">
            Watch Together in Real-Time
          </span>
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg font-medium">
          Stream movies, TV shows, and anime, or read manga side-by-side with friends. Host low-latency synchronized Watch Parties with interactive persistent chat lobbies.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/search"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-102 transition"
          >
            <Search className="w-4 h-4 text-black fill-current" />
            Explore Catalog
          </Link>
          <Link
            to="/search"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-darkBorder text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <Users className="w-4 h-4" />
            Join a Watch Party
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 max-w-4xl mx-auto border-t border-darkBorder/40">
          <div className="flex flex-col items-center p-4 text-center space-y-2">
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-accentCyan border border-cyan-500/20">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Aggregated Catalog</h3>
            <p className="text-xs text-gray-500 max-w-xs">TMDB, Jikan Anime, and MangaDex feeds parsed under a single unified user dashboard.</p>
          </div>
          <div className="flex flex-col items-center p-4 text-center space-y-2">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-accentPurple border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Host Sync Players</h3>
            <p className="text-xs text-gray-500 max-w-xs">Control playback seek/pause states across all participant browsers programmatically.</p>
          </div>
          <div className="flex flex-col items-center p-4 text-center space-y-2">
            <div className="p-3 bg-pink-500/10 rounded-2xl text-accentPink border border-pink-500/20">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Persistent Lobby Chat</h3>
            <p className="text-xs text-gray-500 max-w-xs">Chat live alongside video streams. All messages are stored in MySQL to guarantee audit trail logs.</p>
          </div>
        </div>
      </section>

      {/* Tab Selector Section */}
      <div className="flex flex-wrap items-center justify-center gap-3 border-b border-darkBorder pb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-black shadow-lg shadow-accentCyan/20 scale-102'
                  : 'text-gray-400 border border-darkBorder bg-darkCard/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-black' : tab.color}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard Grid Content */}
      {loading ? (
        <div className="space-y-12 animate-pulse py-12">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-48 bg-white/10 rounded animate-fade-in"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-[380px] bg-white/5 rounded-2xl border border-darkBorder"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center space-y-4 max-w-md mx-auto">
          <p className="text-red-400 font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-darkCard border border-darkBorder hover:border-red-500/30 rounded-xl text-xs font-semibold text-gray-200 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : media ? (
        <div className="space-y-12 transition-opacity duration-300">
          {activeTab === 'trending' && (
            <div className="space-y-16 animate-fade-in">
              <MediaGrid items={media.trending?.movies?.slice(0, 10)} title="Trending Blockbuster Movies" seeMoreLink="/catalog/trending/movie" />
              <MediaGrid items={media.trending?.tv?.slice(0, 10)} title="Trending TV Shows" seeMoreLink="/catalog/trending/tv" />
              <MediaGrid items={media.trending?.anime?.slice(0, 10)} title="Top Trending Anime Releases" seeMoreLink="/catalog/trending/anime" />
              <MediaGrid items={media.trending?.manga?.slice(0, 10)} title="Most Followed Manga Series" seeMoreLink="/catalog/trending/manga" />
            </div>
          )}

          {activeTab === 'ongoing' && (
            <div className="space-y-16 animate-fade-in">
              <MediaGrid items={media.ongoing?.tv?.slice(0, 10)} title="Ongoing TV Broadcasts" seeMoreLink="/catalog/ongoing/tv" showTimings={true} />
              <MediaGrid items={media.ongoing?.anime?.slice(0, 10)} title="Currently Airing Anime (MAL)" seeMoreLink="/catalog/ongoing/anime" showTimings={true} />
              <MediaGrid items={media.ongoing?.manga?.slice(0, 10)} title="Ongoing Manga Publications" seeMoreLink="/catalog/ongoing/manga" />
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 border-l-4 border-accentCyan pl-3 font-outfit">
                  Weekly Release Schedules
                </h2>
                <p className="text-sm text-gray-400 pl-4">
                  Select a day of the week to view TV and Anime releases scheduled for that day.
                </p>
              </div>

              {/* Day selection calendar row */}
              <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto p-1.5 bg-darkCard/50 border border-darkBorder rounded-2xl shadow-xl">
                {[
                  { key: 'Mondays', label: 'Mon' },
                  { key: 'Tuesdays', label: 'Tue' },
                  { key: 'Wednesdays', label: 'Wed' },
                  { key: 'Thursdays', label: 'Thu' },
                  { key: 'Fridays', label: 'Fri' },
                  { key: 'Saturdays', label: 'Sat' },
                  { key: 'Sundays', label: 'Sun' }
                ].map(day => {
                  const isSelected = selectedDay === day.key;
                  const todayDayIndex = new Date().getDay();
                  const isToday = daysOfWeek[todayDayIndex] === day.key;
                  
                  return (
                    <button
                      key={day.key}
                      onClick={() => setSelectedDay(day.key)}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 relative ${
                        isSelected
                          ? 'bg-gradient-to-br from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentCyan/15 scale-102'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xs uppercase tracking-wider font-semibold">{day.label}</span>
                      {isToday && (
                        <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-accentCyan'}`}></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Airing Lists for selected day */}
              <div className="space-y-8 pt-4">
                {/* TV Shows Airing on Selected Day */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2 pl-2 border-l-2 border-cyan-400 font-outfit">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    TV Series Releasing on {selectedDay}
                  </h3>
                  
                  {getTvSchedulesByDay(getCombinedTvSchedules())[selectedDay]?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {getTvSchedulesByDay(getCombinedTvSchedules())[selectedDay].map(show => (
                        <Link
                          key={`schedule-tv-${show.id}`}
                          to={`/media/tv/${show.id}`}
                          className="flex items-center gap-4 p-3 bg-darkCard/40 border border-darkBorder/60 hover:border-accentCyan/30 rounded-2xl hover:bg-darkCard/60 transition group"
                        >
                          <img
                            src={show.poster_path}
                            alt={show.title}
                            className="w-14 h-18 object-cover rounded-xl border border-white/5"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-gray-100 group-hover:text-accentCyan transition line-clamp-1">{show.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1">{show.overview}</p>
                            <span className="inline-block text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              Weekly Releases
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-panel border border-darkBorder rounded-2xl p-10 text-center text-gray-500">
                      <p className="text-sm">No TV series releases scheduled for {selectedDay}.</p>
                    </div>
                  )}
                </div>

                {/* Anime Airing on Selected Day */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2 pl-2 border-l-2 border-accentPurple font-outfit">
                    <Sparkles className="w-4 h-4 text-accentPurple" />
                    Anime Releasing on {selectedDay}
                  </h3>
                  
                  {getSchedulesByDay(getCombinedAnimeSchedules())[selectedDay]?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {getSchedulesByDay(getCombinedAnimeSchedules())[selectedDay].map(anime => (
                        <Link
                          key={`schedule-anime-${anime.id}`}
                          to={`/media/anime/${anime.id}`}
                          className="flex items-center gap-4 p-3 bg-darkCard/40 border border-darkBorder/60 hover:border-accentPurple/30 rounded-2xl hover:bg-darkCard/60 transition group"
                        >
                          <img
                            src={anime.poster_path}
                            alt={anime.title}
                            className="w-14 h-18 object-cover rounded-xl border border-white/5"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1 flex-grow">
                            <h4 className="font-bold text-sm text-gray-100 group-hover:text-accentCyan transition line-clamp-1">{anime.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1">{anime.overview || 'No synopsis available.'}</p>
                            <div className="flex items-center gap-1 text-xs text-accentCyan font-semibold">
                              <Clock className="w-3.5 h-3.5 text-accentCyan" />
                              <span>{anime.broadcast}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-panel border border-darkBorder rounded-2xl p-10 text-center text-gray-500">
                      <p className="text-sm">No anime releases scheduled for {selectedDay}.</p>
                    </div>
                  )}
                </div>

                {/* Latest Manga Updates */}
                <div className="space-y-4 pt-8 border-t border-darkBorder/40">
                  <h3 className="text-lg font-bold text-pink-400 flex items-center gap-2 pl-2 border-l-2 border-pink-500 font-outfit">
                    <BookOpen className="w-4 h-4" />
                    Latest Manga Chapters
                  </h3>
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {media.latest?.manga?.slice(0, 10).map(manga => (
                      <Link
                        key={`latest-manga-${manga.id}`}
                        to={`/media/manga/${manga.id}`}
                        className="flex items-center gap-4 p-3 bg-darkCard/40 border border-darkBorder/60 hover:border-accentPink/30 rounded-2xl hover:bg-darkCard/60 transition group"
                      >
                        <img
                          src={manga.poster_path}
                          alt={manga.title}
                          className="w-14 h-18 object-cover rounded-xl border border-white/5"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1 flex-grow">
                          <h4 className="font-bold text-sm text-gray-100 group-hover:text-accentPink transition line-clamp-1">{manga.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">{manga.overview || 'No synopsis available.'}</p>
                          <span className="inline-block text-[10px] bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Recently Updated
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="space-y-16 animate-fade-in">
              <MediaGrid items={media.upcoming?.movies?.slice(0, 10)} title="Upcoming Cinematic Movies" seeMoreLink="/catalog/upcoming/movie" />
              <MediaGrid items={media.upcoming?.tv?.slice(0, 10)} title="Upcoming TV Series" seeMoreLink="/catalog/upcoming/tv" />
              <MediaGrid items={media.upcoming?.anime?.slice(0, 10)} title="Upcoming Anime Seasons" seeMoreLink="/catalog/upcoming/anime" />
              <MediaGrid items={media.latest?.manga?.slice(0, 10)} title="Latest Chapter Uploads" seeMoreLink="/catalog/latest/manga" />
            </div>
          )}
        </div>
      ) : null}

    </div>
  );
}
