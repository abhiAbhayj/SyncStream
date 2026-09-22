import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { Plus, Check, X, FolderPlus, Music2 } from 'lucide-react';

export default function AddToPlaylistModal({ song, isOpen, onClose }) {
  const { playlists, createPlaylist, addSongToPlaylist } = useMusic();
  const [showCreateInline, setShowCreateInline] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [addedStatus, setAddedStatus] = useState({}); // { [playlistId]: true }
  const [creating, setCreating] = useState(false);

  if (!isOpen || !song) return null;

  const handleAddToPlaylist = async (playlistId, playlistName) => {
    try {
      await addSongToPlaylist(playlistId, song);
      setAddedStatus(prev => ({ ...prev, [playlistId]: playlistName }));
      setTimeout(() => {
        setAddedStatus(prev => {
          const next = { ...prev };
          delete next[playlistId];
          return next;
        });
      }, 3000);
    } catch (err) {
      console.error('Failed to add song to playlist:', err);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    setCreating(true);
    try {
      const created = await createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
      if (created && created.id) {
        await addSongToPlaylist(created.id, song);
        setAddedStatus(prev => ({ ...prev, [created.id]: created.name }));
        setNewPlaylistName('');
        setNewPlaylistDesc('');
        setShowCreateInline(false);
        setTimeout(() => {
          setAddedStatus(prev => {
            const next = { ...prev };
            delete next[created.id];
            return next;
          });
        }, 3000);
      }
    } catch (err) {
      console.error('Error creating playlist & adding song:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel border border-white/15 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl bg-[#13172e]/95 backdrop-blur-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-accentCyan" />
            <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit">
              Add Track to Playlist
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Song Preview Banner */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
          <img
            src={song.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
            alt={song.title}
            className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate font-outfit">
              {song.title}
            </h4>
            <p className="text-[11px] text-gray-400 truncate font-medium">
              {song.artist}
            </p>
          </div>
        </div>

        {/* Existing Playlists Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              Choose Destination Playlist
            </label>
            <button
              type="button"
              onClick={() => setShowCreateInline(!showCreateInline)}
              className="text-xs font-bold text-accentCyan hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showCreateInline ? 'Hide Create Form' : 'New Playlist'}</span>
            </button>
          </div>

          {/* Inline Create Playlist Form */}
          {showCreateInline && (
            <form onSubmit={handleCreateAndAdd} className="p-3 rounded-2xl bg-white/5 border border-accentCyan/30 space-y-2.5 animate-scale-in">
              <input
                type="text"
                required
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name (e.g. Vibes, Study, Gym)..."
                className="w-full bg-darkBg border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-accentCyan"
              />
              <input
                type="text"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-darkBg border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-accentCyan"
              />
              <button
                type="submit"
                disabled={creating || !newPlaylistName.trim()}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md hover:opacity-90 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{creating ? 'Creating...' : 'Create & Add Song'}</span>
              </button>
            </form>
          )}

          {/* List of playlists */}
          {playlists.length === 0 && !showCreateInline ? (
            <div className="text-center py-6 border border-dashed border-white/15 rounded-2xl p-4 space-y-2.5">
              <p className="text-xs text-gray-400">You don't have any playlists yet.</p>
              <button
                type="button"
                onClick={() => setShowCreateInline(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-xs transition active:scale-95 shadow-md"
              >
                + Create Your First Playlist
              </button>
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {playlists.map((pl) => {
                const wasAdded = Boolean(addedStatus[pl.id]);
                return (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {pl.cover_image ? (
                          <img src={pl.cover_image} alt={pl.name} className="w-full h-full object-cover" />
                        ) : (
                          <Music2 className="w-4 h-4 text-accentCyan" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate font-outfit">{pl.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {pl.track_count || 0} tracks
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToPlaylist(pl.id, pl.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 active:scale-95 ${
                        wasAdded
                          ? 'bg-emerald-500 text-black font-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : 'bg-accentCyan/20 hover:bg-accentCyan text-accentCyan hover:text-black border border-accentCyan/40'
                      }`}
                    >
                      {wasAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 font-bold text-xs transition"
        >
          Close
        </button>

      </div>
    </div>
  );
}
