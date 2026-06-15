import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import { ArrowLeft, Loader2, Film, Tv, Sparkles, BookOpen, Flame, Activity, Calendar, CalendarDays } from 'lucide-react';

export default function Catalog() {
  const { category, type } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'trending': return 'Trending Hits';
      case 'ongoing': return 'Ongoing & Airing';
      case 'schedule': return 'Release Schedules';
      case 'upcoming': return 'Upcoming Releases';
      case 'latest': return 'Latest Updates';
      default: return cat;
    }
  };

  const getTypeLabel = (t) => {
    switch (t) {
      case 'movies': return 'Movies';
      case 'tv': return 'TV Shows';
      case 'anime': return 'Anime';
      case 'manga': return 'Manga';
      default: return t;
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'trending': return Flame;
      case 'ongoing': return Activity;
      case 'schedule': return Calendar;
      case 'upcoming': return CalendarDays;
      case 'latest': return Sparkles;
      default: return Film;
    }
  };

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/media/trending');
        const data = res.data;
        const catalogItems = data[category]?.[type] || [];
        setItems(catalogItems);
      } catch (err) {
        console.error('Failed to load catalog:', err);
        setError('Failed to retrieve catalog details. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, [category, type]);

  const IconComponent = getCategoryIcon(category);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[75vh]">
      
      {/* Header with Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-darkBorder pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-2xl border border-darkBorder bg-darkCard/40 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <IconComponent className="w-3.5 h-3.5 text-accentCyan" />
              <span>{getCategoryLabel(category)}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit">
              All {getTypeLabel(type)}
            </h1>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 font-medium">
          Showing {items.length} entries matching this category
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accentCyan" />
          <p className="text-gray-400 font-medium">Loading catalog content...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center space-y-4 max-w-md mx-auto">
          <p className="text-red-400 font-semibold">{error}</p>
          <Link 
            to="/" 
            className="inline-block px-4 py-2 bg-darkCard border border-darkBorder hover:border-red-500/30 rounded-xl text-xs font-semibold text-gray-200 transition"
          >
            Go Back Home
          </Link>
        </div>
      ) : (
        <div className="animate-fade-in">
          <MediaGrid items={items} />
        </div>
      )}

    </div>
  );
}
