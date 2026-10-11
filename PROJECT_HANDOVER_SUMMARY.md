# SyncStream — Project Handover & Architecture Summary

> **Date**: October 11, 2026  
> **Workspace**: `c:\xampp\htdocs\SyncStream`  
> **GitHub**: [`https://github.com/abhiAbhayj/SyncStream.git`](https://github.com/abhiAbhayj/SyncStream.git) (Branch: `main`)  
> **Deployment**: **Vercel** (`client`) & **Render** (`server`) via GitHub Auto-Deploy  

---

## 1. Project Overview & Architecture

**SyncStream** is a high-performance federated media streaming and real-time synchronized Watch Party platform. It aggregates Movies, TV Shows, Anime, Manga, and 320kbps Music into a single unified web app with custom theme styling (neon cyan, emerald, purple, and glassmorphic dark panels).

### Tech Stack
- **Frontend** (`client/`): React 18, Vite 5, TailwindCSS, Lucide React, Socket.io Client, Simple-Peer (WebRTC).
- **Backend** (`server/`): Node.js, Express, Socket.io (real-time sync & chat), MySQL (`mysql2/promise` with offline fallback), Axios.
- **External Data Providers**:
  - **TMDB API**: Blockbuster Movies, TV Series, official collections, cast, trailers, recommendations.
  - **Jikan API (MyAnimeList)**: Anime catalog, schedules, genres, episodes.
  - **MangaDex API**: Manga discovery, chapter directory, inline chapter page reader.
  - **YouTube Music API / Direct Streams**: Studio-master 320kbps audio & daily trending hits.
  - **Streaming Embed Providers**: VidSrc PM, VidSrc TO, AutoEmbed, 2Embed, MultiEmbed with sandbox protections.

---

## 2. Completed Features & Implementation Details

### A. Solo Streaming Theater (`client/src/pages/MediaDetail.jsx`)
1. **Media Overview Card at the Top**:
   - Displays high-resolution poster, title, air date, rating, dynamic genre tags, and season/movie overview.
2. **Player Controls & Streaming Servers**:
   - Tab toggles between **YouTube Trailer**, **Standard Embed**, and **Custom Video / Stream Link**.
   - Server selector (Servers 1–5: VidSrc PM, VidSrc TO, AutoEmbed, 2Embed, MultiEmbed).
3. **Strict Separation of Movies vs. Episodic Content**:
   - **Movies**:
     - ❌ **No Episode Directory**
     - ❌ **No Season dropdown selector**
     - ❌ **No season badges**
     - Direct one-click playback only.
   - **TV Series & Anime**:
     - Always-visible **Season dropdown** with episode counts.
     - Dynamic season switching that updates the synopsis, poster, and episode grid.
     - Episode grid with custom vertical scrollbar (`max-h-[300px] overflow-y-auto`).
4. **"Related Seasons & Series" / "Related Movies & Franchise"**:
   - **For Movies**: Queries official TMDB collections (e.g. *Spider-Man 1, 2, 3*, *Homecoming*, *No Way Home*) and franchise titles. Highlights the active movie with a glowing **NOW PLAYING** green border.
   - **For TV & Anime**: Displays all seasons, OVAs, specials, and related franchise movies/series.
5. **Step-by-Step History Navigation (`handleBack`)**:
   - Uses `navigate(-1)` to step back through browsing history (e.g., from *Spider-Man 2* back to *Spider-Man 1*, then back to Home/Search) before falling back to `/`.

---

## 2. Real-Time Watch Party (`client/src/pages/WatchParty.jsx`)
1. **Host-Controlled Synchronized Playback**:
   - Host changes (switching servers, playback modes, seasons, episodes, or time scrubs) sync instantly to all joined peers via Socket.io.
2. **Matching UI to Solo Stream**:
   - Media Overview Card at top.
   - Player on left (2/3 width), synchronized Chat & WebRTC audio/video call panel on right (1/3 width).
   - "Related Seasons & Series" / "Related Movies & Franchise" rendered below the player.
3. **Room Code & Shareable Link**:
   - Copyable party code and live room notifications (`User joined` / `User left`).

---

## 3. Categorized Watchlist & Library (`client/src/pages/Watchlist.jsx`)
1. **Separate Categorized Sections**:
   - 🎬 **Movies**: Displays saved movies with counter and catalog link.
   - 📺 **TV Series**: Displays saved TV series with counter and catalog link.
   - ✨ **Anime**: Displays saved anime titles with counter and catalog link.
   - 📖 **Manga**: Displays saved manga with counter and catalog link.
2. **Category Filter Tabs & Stats**:
   - Filter pills at top (`All Saved`, `Movies`, `TV Series`, `Anime`, `Manga`) with live item counts.
   - Quick stat chips in the header.

---

## 4. Federated Search & Catalog (`Search.jsx` & `Catalog.jsx`)
1. **Multi-Category Filter Engine**:
   - Quick tabs for Movies, TV Series, Anime, Manga, and Music.
   - Genre filter chips matching the dark neon theme.
   - Live status indicator and refresh buttons.
2. **Catalog Browser**:
   - Grid browsing by Trending, Top Rated, Airing Today, and Upcoming with pagination.

---

## 5. Music Portal (`client/src/pages/Music.jsx`)
1. Dual-engine audio (YouTube Music + Studio Master 320kbps).
2. Global floating sticky mini-player (`MusicPlayer.jsx`) with play/pause, volume, timeline scrubber, and queue management.

---

## 6. Streamlined Footer (`client/src/components/Footer.jsx`)
1. Compact 2-row responsive design (reduced vertical footprint by >60%).
2. Brand logo + tagline + inline theme links (`Movies`, `TV Series`, `Anime`, `Manga`, `Music`, `Watchlist`, `Profile`).
3. Minimalist copyright and live CDN status pill (`● Live CDN • TMDB • Jikan • MangaDex • YT Music`).

---

## 7. Universal Mobile & Tablet Responsiveness
- All `< Back` buttons equipped with `shrink-0` and responsive paddings (`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm`).
- Top header controls stack fluidly (`flex-col sm:flex-row sm:items-center justify-between`) on small devices.
- Title containers have `min-w-0 flex-1 truncate` to prevent horizontal viewport overflow.

---

## 8. Key Files Reference

| File | Purpose |
| :--- | :--- |
| `client/src/pages/MediaDetail.jsx` | Solo stream theater, overview card, season dropdown, episode list, franchise cards |
| `client/src/pages/WatchParty.jsx` | Synchronized watch party room, Socket.io sync, WebRTC call, chat |
| `client/src/pages/Watchlist.jsx` | User saved library divided into Movies, TV, Anime, and Manga sections |
| `client/src/pages/Search.jsx` | Federated discovery across all 5 media types |
| `client/src/pages/Catalog.jsx` | Filtered category catalogs (Trending, Airing, Top Rated) |
| `client/src/pages/Music.jsx` | Music portal with playlists, search, and dual-engine playback |
| `client/src/components/Footer.jsx` | Streamlined compact responsive footer |
| `server/controllers/mediaController.js` | Backend controller for TMDB, Jikan, MangaDex, collections, franchise |
| `server/index.js` | Express server, Socket.io room management, proxying |
| `vercel.json` | Vercel frontend build & rewrite rules to Render |

---

## 9. Current State & Verification

- **Production Build**: Verified with `npm run build` in `client/` (**0 errors, all 1622 modules transformed**).
- **Git Repository**: Clean working tree on `main`, fully synced to GitHub (`fb72d60`).
- **Deployments**: Vercel and Render are connected to `origin main` with automatic rebuilds on push.

---

## 10. How to Resume in a Fresh Chat

When starting a new conversation, paste this prompt:

```text
I am continuing work on the SyncStream project located at c:\xampp\htdocs\SyncStream.
Please read PROJECT_HANDOVER_SUMMARY.md in the project root to get full context on the architecture, features built, and current codebase state.
```
