import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import { Tv, Sparkles, Search, MessageSquareCode, Users, Flame, Activity, Calendar, CalendarDays, BookOpen, Clock, Music, ArrowRight, Radio } from 'lucide-react';
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
    <div className="space-y-16 py-8 px-4 md:px-8 max-w-7xl mx-auto">

      {/* ── Hero Banner ── */}
      <section className="relative rounded-3xl overflow-hidden border border-white/[0.06] text-center bg-aurora">
        {/* Ambient orbs */}
        <div className="orb orb-purple w-80 h-80 -top-20 -left-20 opacity-60" />
        <div className="orb orb-cyan w-64 h-64 -bottom-16 -right-16 opacity-50" />
        <div className="orb orb-pink w-48 h-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />

        {/* Noise grain overlay */}
        <div className="noise-overlay rounded-3xl" />

        {/* Content */}
        <div className="relative z-10 py-16 px-6 md:py-24 md:px-16 space-y-7 hero-gradient">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-full text-xs font-semibold text-gray-300 backdrop-blur-md animate-fade-up font-mono tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-accentCyan animate-pulse" />
            THE ULTIMATE STREAMING HUB
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bebas tracking-widest leading-none uppercase animate-fade-up stagger-2">
            Discover, Stream &amp;
            <br />
            <span className="text-gradient-aurora title-glow">Watch Together</span>
          </h1>

          <p className="text-gray-400 max-w-xl mx-auto text-base md:text-lg leading-relaxed animate-fade-up stagger-3 font-dm">
            Movies, TV shows, anime &amp; manga — synced across devices in real-time. Host Watch Parties with live chat.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 animate-fade-up stagger-4">
            <Link
              to="/search"
              className="btn-primary flex items-center gap-2 !text-white text-sm !px-6 !py-3"
            >
              <Search className="w-4 h-4" />
              Explore Catalog
            </Link>
            <Link
              to="/search"
              className="btn-ghost flex items-center gap-2 text-sm !px-6 !py-3"
            >
              <Users className="w-4 h-4" />
              Join a Party
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10 max-w-3xl mx-auto border-t border-white/[0.06] mt-4 animate-fade-up stagger-5">
            {[
              { icon: Tv, color: 'text-accentCyan', bg: 'bg-accentCyan/10 border-accentCyan/20', title: 'Aggregated Catalog', desc: 'TMDB, Anime, MangaDex feeds in one dashboard.' },
              { icon: Sparkles, color: 'text-accentPurple', bg: 'bg-accentPurple/10 border-accentPurple/20', title: 'Host Sync Players', desc: 'Control playback across all participants live.' },
              { icon: MessageSquareCode, color: 'text-accentPink', bg: 'bg-accentPink/10 border-accentPink/20', title: 'Lobby Chat', desc: 'Chat alongside streams with persistent history.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex flex-col items-center p-4 text-center space-y-2 hover-lift">
                <div className={`p-3 rounded-2xl border ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-sm text-white">{title}</h3>
                <p className="text-xs text-gray-500 max-w-[180px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tab Selector ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-400 ${
                isSelected
                  ? 'bg-white/[0.08] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)] border border-white/[0.1]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
              }`}
            >
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl opacity-100" style={{
                  background: `linear-gradient(135deg, rgba(var(--accent-purple),0.15), rgba(var(--accent-cyan),0.08))`
                }} />
              )}
              <Icon className={`relative w-4 h-4 transition-all duration-300 ${isSelected ? tab.color : 'text-gray-500 group-hover:text-gray-300'}`} />
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dashboard Grid Content */}
      {loading ? (
        <div className="space-y-12 py-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-5">
              <div className="h-5 w-48 skeleton rounded-xl" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="aspect-[2/3] skeleton rounded-2xl" />
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

              {/* ── Music Streaming Showcase Card ── */}
              <div className="relative rounded-3xl overflow-hidden border border-accentCyan/30 bg-gradient-to-r from-darkCard via-darkBg to-accentCyan/10 p-6 sm:p-8 shadow-[0_0_40px_rgba(99,210,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-6 group">
                <div className="space-y-2 text-center md:text-left max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentCyan/10 border border-accentCyan/20 text-accentCyan text-xs font-bold uppercase tracking-wider font-mono">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>New Feature: 320kbps Music Portal</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit tracking-tight">
                    Stream Songs Across All Languages
                  </h3>
                  <p className="text-sm text-gray-400">
                    Full-duration audio in Hindi, English, K-Pop, Tamil, Telugu, Malayalam, Kannada, & Punjabi with zero interruption.
                  </p>
                </div>
                <Link
                  to="/music"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-accentCyan to-accentPurple text-white font-bold text-sm shadow-[0_0_20px_rgba(99,210,255,0.4)] hover:shadow-[0_0_30px_rgba(99,210,255,0.7)] transition active:scale-95 shrink-0"
                >
                  <Music className="w-4 h-4" />
                  <span>Open Music Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <MediaGrid items={media.trending?.anime?.slice(0, 10)} title="Top Trending Anime Releases" seeMoreLink="/catalog/trending/anime" />
              <MediaGrid items={media.trending?.manga?.slice(0, 10)} title="Most Followed Manga Series" seeMoreLink="/catalog/trending/manga" />
            </div>
          )}

          {activeTab === 'ongoing' && (
            <div className="space-y-16 animate-fade-in">
              <MediaGrid items={media.ongoing?.movies?.slice(0, 10)} title="Now Playing in Theaters" seeMoreLink="/catalog/ongoing/movie" />
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
