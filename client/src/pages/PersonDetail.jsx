import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import { ArrowLeft, Film, Tv, Sparkles, BookOpen, User, MapPin, Calendar, Search, Layers } from 'lucide-react';

export default function PersonDetail() {
  const { source, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialMember = location.state?.member || null;
  const queryName = searchParams.get('name') || initialMember?.name || '';

  const [person, setPerson] = useState(
    initialMember
      ? {
          id,
          source,
          name: initialMember.name,
          known_for_department: initialMember.role_type || initialMember.character || 'Cast & Crew',
          profile_path: initialMember.profile_path || null,
          biography: ''
        }
      : null
  );
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [creditSearch, setCreditSearch] = useState('');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [source, id]);

  useEffect(() => {
    let cancelled = false;
    const loadCredits = async () => {
      setLoading(true);
      setError(null);
      setImgFailed(false);
      setActiveFilter('all');
      setCreditSearch('');
      try {
        const res = await axios.get(`/api/media/person/${encodeURIComponent(source)}/${encodeURIComponent(id)}`, {
          params: queryName ? { name: queryName } : {}
        });
        if (cancelled) return;
        setPerson(res.data?.person || { name: queryName || 'Cast & Crew', profile_path: initialMember?.profile_path || null });
        setCredits(Array.isArray(res.data?.credits) ? res.data.credits : []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load person filmography:', err);
        setError('Could not load this person’s filmography right now. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadCredits();
    return () => {
      cancelled = true;
    };
  }, [source, id, queryName]);

  const counts = useMemo(() => {
    const map = { all: credits.length, movie: 0, tv: 0, anime: 0, manga: 0 };
    credits.forEach((c) => {
      if (map[c.media_type] !== undefined) map[c.media_type] += 1;
    });
    return map;
  }, [credits]);

  const filterTabs = useMemo(() => {
    const tabs = [
      { id: 'all', label: 'All Works', icon: Layers, count: counts.all },
      { id: 'movie', label: 'Movies', icon: Film, count: counts.movie },
      { id: 'tv', label: 'TV Series', icon: Tv, count: counts.tv },
      { id: 'anime', label: 'Anime', icon: Sparkles, count: counts.anime },
      { id: 'manga', label: 'Manga', icon: BookOpen, count: counts.manga }
    ];
    return tabs.filter((t) => t.id === 'all' || t.count > 0);
  }, [counts]);

  const filteredCredits = useMemo(() => {
    const q = creditSearch.trim().toLowerCase();
    return credits.filter((item) => {
      if (activeFilter !== 'all' && item.media_type !== activeFilter) return false;
      if (q) {
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const roleMatch = (item.credit_role || '').toLowerCase().includes(q);
        return titleMatch || roleMatch;
      }
      return true;
    });
  }, [credits, activeFilter, creditSearch]);

  const displayName = person?.name || queryName || 'Cast & Crew';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3.5 sm:px-6 md:px-8 space-y-5 sm:space-y-6 min-h-[75vh]">
      {/* Back Button */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-darkCard/80 border border-darkBorder hover:border-accentCyan/60 text-xs sm:text-sm font-bold text-gray-200 hover:text-accentCyan transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {!loading && (
          <span
            key={`total-${counts.all}`}
            className="animate-digit-roll text-[11px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-accentCyan/15 text-accentCyan border border-accentCyan/35"
          >
            {counts.all} Titles Found
          </span>
        )}
      </div>

      {/* Person Hero Card */}
      <section className="relative overflow-hidden glass-panel border border-darkBorder rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8">
        {person?.profile_path && !imgFailed && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-25 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${person.profile_path})` }}
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-darkBg/92 via-[#090d1e]/88 to-darkBg/95 pointer-events-none"
        />

        {/* Orbital Framed Portrait */}
        <div className="relative z-10 shrink-0 p-1.5 rounded-full">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(var(--accent-cyan),0.95),rgba(var(--accent-purple),0.9),rgba(var(--accent-pink),0.85),rgba(var(--accent-cyan),0.95))] animate-orbit-cw opacity-85"
          />
          <div className="relative z-10 w-24 h-24 xs:w-28 xs:h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-black/80 bg-darkBg flex items-center justify-center shadow-2xl">
            {person?.profile_path && !imgFailed ? (
              <img
                src={person.profile_path}
                alt={displayName}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accentCyan/30 via-accentPurple/30 to-accentPink/25 flex items-center justify-center">
                {initials ? (
                  <span className="text-2xl sm:text-3xl font-black text-white font-outfit tracking-wider">
                    {initials}
                  </span>
                ) : (
                  <User className="w-10 h-10 text-accentCyan" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Name, Meta & Biography */}
        <div className="relative z-10 flex-1 min-w-0 w-full text-center sm:text-left space-y-2.5 sm:space-y-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accentPurple/20 text-accentPurple border border-accentPurple/40">
                {person?.known_for_department || 'Cast & Crew'}
              </span>
              {initialMember?.character && initialMember.character !== person?.known_for_department && (
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-accentCyan/15 text-accentCyan border border-accentCyan/30 truncate max-w-full">
                  {initialMember.character}
                </span>
              )}
            </div>

            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white font-outfit tracking-tight break-words">
              {displayName}
            </h1>

            {(person?.birthday || person?.place_of_birth) && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] sm:text-xs text-gray-400 font-medium pt-0.5">
                {person.birthday && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accentCyan" />
                    <span>Born {person.birthday}</span>
                  </span>
                )}
                {person.place_of_birth && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-accentPink" />
                    <span>{person.place_of_birth}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {person?.biography ? (
            <div className="space-y-1">
              <p className={`text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl ${bioExpanded ? '' : 'line-clamp-3'}`}>
                {person.biography}
              </p>
              {person.biography.length > 180 && (
                <button
                  type="button"
                  onClick={() => setBioExpanded((prev) => !prev)}
                  className="text-[11px] font-bold text-accentCyan hover:underline cursor-pointer"
                >
                  {bioExpanded ? 'Show less' : 'Read full bio'}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-400">
              Browse all movies, series, and featured productions associated with {displayName}.
            </p>
          )}
        </div>
      </section>

      {/* Filter Tabs & Search Bar */}
      {!loading && credits.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer active:scale-95 shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-accentCyan/25 to-accentPurple/25 border-accentCyan text-white shadow-[0_0_14px_rgba(var(--accent-cyan),0.25)]'
                      : 'bg-darkCard/60 border-darkBorder text-gray-400 hover:text-white hover:border-white/25'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accentCyan' : ''}`} />
                  <span>{tab.label}</span>
                  <span
                    key={`${tab.id}-${tab.count}`}
                    className="animate-digit-roll px-1.5 py-0.5 rounded-md bg-black/40 text-[10px] font-mono font-black text-accentCyan"
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={creditSearch}
              onChange={(e) => setCreditSearch(e.target.value)}
              placeholder="Filter movies, shows or roles..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-darkCard/80 border border-darkBorder text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accentCyan transition"
            />
          </div>
        </div>
      )}

      {/* Results / Loading / Error / Empty */}
      {loading ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl skeleton-neon border border-white/10" />
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel border border-red-500/30 bg-red-500/10 rounded-2xl p-6 text-center space-y-3">
          <p className="text-sm font-bold text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-darkCard border border-darkBorder text-xs font-bold text-white hover:border-accentCyan cursor-pointer"
          >
            Go Back
          </button>
        </div>
      ) : filteredCredits.length === 0 ? (
        <div className="glass-panel border border-darkBorder rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-bold text-gray-300">No matching movies or series found.</p>
          <p className="text-xs text-gray-500">Try clearing the filter or switching category tabs.</p>
        </div>
      ) : (
        <MediaGrid
          items={filteredCredits}
          title={`${displayName} — Movies & Series (${filteredCredits.length})`}
        />
      )}
    </div>
  );
}
