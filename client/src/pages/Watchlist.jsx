import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MediaGrid from '../components/MediaGrid';
import { Heart, Search, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Watchlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/media/watchlist');
        setWatchlist(res.data || []);
      } catch (err) {
        console.error('Failed to load watchlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-36 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-accentCyan" />
        <p className="text-gray-400 font-medium">Loading your watchlist library...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[75vh]">
      
      {/* Header */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit flex items-center justify-center md:justify-start gap-2">
          <Heart className="w-8 h-8 text-accentPink fill-current" />
          My Library
        </h1>
        <p className="text-sm text-gray-400">
          Your saved movies, tv shows, anime, and manga titles tracked under your personal profile database record.
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 max-w-sm mx-auto">
          <div className="p-4 bg-accentPink/10 border border-accentPink/20 rounded-full text-accentPink">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-gray-300">Your Watchlist is Empty</h3>
            <p className="text-xs text-gray-500">You haven't saved any media to your profile library. Start exploring the catalog to aggregate content!</p>
          </div>
          <Link
            to="/search"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-bold shadow-lg shadow-accentPurple/20 hover:opacity-90 transition"
          >
            <Search className="w-4 h-4 text-black fill-current" />
            Discover Titles
          </Link>
        </div>
      ) : (
        /* Renders media grid cards */
        <MediaGrid items={watchlist} />
      )}

    </div>
  );
}
