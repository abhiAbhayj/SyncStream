<div align="center">
  <img src="https://placehold.co/1200x380/0b0f24/00d2ff?text=SyncStream+%E2%80%A2+Universal+Entertainment+Hub" alt="SyncStream Banner" width="100%" />
  
  <br />
  <br />

  # 🌌 SyncStream — The Ultimate Entertainment Hub
  ### Streaming Cinema, TV Shows, Anime, Manga, Music & Real-Time Watch Parties

  <p align="center">
    <strong>An ultra-fast, premium full-stack web application designed for synchronized multimedia entertainment. Powered by 10 verified streaming servers, a universal anime/manga engine, full background music player, real-time Socket.io watch parties, and 8 holographic particle dashboard themes.</strong>
  </p>

  <br />

  [![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
  [![AniList GraphQL](https://img.shields.io/badge/AniList-GraphQL-02A9FF?style=for-the-badge&logo=graphql&logoColor=white)](https://anilist.co/)
  [![TMDB](https://img.shields.io/badge/TMDB-API_V3-01D277?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)
  [![MangaDex](https://img.shields.io/badge/MangaDex-API-FF6740?style=for-the-badge)](https://mangadex.org/)
</div>

---

## 📖 Table of Contents
1. [🌟 Overview](#-overview)
2. [✨ Core Features & Capabilities](#-core-features--capabilities)
   - [1. 🎬 Cinema, TV Shows & Anime Streaming (10 High-Speed Servers)](#1--cinema-tv-shows--anime-streaming-10-high-speed-servers)
   - [2. 📖 High-Performance Manga Reader](#2--high-performance-manga-reader)
   - [3. 🌐 Real-Time Synchronized Watch Parties](#3--real-time-synchronized-watch-parties)
   - [4. 🎵 Background Music Engine & Jukebox](#4--background-music-engine--jukebox)
   - [5. 🎨 8 Holographic Vector & Particle Dashboard Themes](#5--8-holographic-vector--particle-dashboard-themes)
   - [6. 🎭 Universal Anime & Manga Character Resolution & AI Avatars](#6--universal-anime--manga-character-resolution--ai-avatars)
   - [7. 🛡️ Confirmation Alert Boxes & Safeguards](#7--confirmation-alert-boxes--safeguards)
   - [8. 🎙️ Spotlight Search & Voice Assistant](#8--spotlight-search--voice-assistant)
3. [🖥️ How to Use This Website (User Guide)](#-how-to-use-this-website-user-guide)
4. [🛠️ Tech Stack & Architecture](#-tech-stack--architecture)
5. [📁 Project Structure](#-project-structure)
6. [🚀 Getting Started & Installation](#-getting-started--installation)
   - [Prerequisites](#prerequisites)
   - [Database Setup](#database-setup)
   - [Server Setup](#server-setup)
   - [Client Setup](#client-setup)
   - [Environment Variables Guide](#environment-variables-guide)
7. [📡 API Endpoints Reference](#-api-endpoints-reference)
8. [🌐 10 Streaming Servers Reference](#-10-streaming-servers-reference)
9. [⌨️ Keyboard Shortcuts & Pro Tips](#️-keyboard-shortcuts--pro-tips)
10. [🔒 Security & Reliability](#-security--reliability)
11. [📄 License](#-license)

---

## 🌟 Overview

**SyncStream** is an all-in-one entertainment ecosystem that brings movies, TV series, anime, manga, and music into a single, cohesive, modern interface. Built with **React 18**, **Vite**, **Tailwind CSS**, **Node.js/Express**, **MySQL**, and **Socket.io**, SyncStream is designed to be blazing fast, visually stunning, and responsive across desktops, laptops, tablets, and smartphones.

Whether you want to binge a TV series with friends in a real-time synchronized Watch Party, read thousands of manga chapters, listen to background music while browsing, search for rare anime characters using natural language, or customize your interface with animated galactic themes, SyncStream delivers a frictionless experience.

---

## ✨ Core Features & Capabilities

### 1. 🎬 Cinema, TV Shows & Anime Streaming (10 High-Speed Servers)
* **10 Free, Verified SSL Streaming Servers**: Built-in multi-mirror architecture with automatic server switching. If one server experiences a regional block or slow buffering, you can switch with a single click without losing your place.
* **Smart UI Server Selector**: Sleek responsive server pills for laptop, tablet, and mobile with active neon indicators, speed badges, and an expandable `+5 More Servers` dropdown.
* **Auto-Embed & Parent Redirect Protection**: Built-in sandboxed iframe protection neutralizes intrusive popups and unauthorized tab redirects while preserving native full-screen, video controls, and subtitle rendering.
* **Deep TMDB Integration**: Live movie ratings, overview summaries, release years, runtimes, cast photos, filmographies, and dynamic algorithm-driven recommendations.
* **Binge TV Episode Selector**: Automatic season and episode lists with title summaries, air dates, and progress markers.

### 2. 📖 High-Performance Manga Reader
* **MangaDex API Integration**: Access thousands of manga, manhwa, and manhua titles with up to 5,000 chapters per series.
* **Smooth Reading Experience**: Fast preloading, high-resolution scans, responsive zoom, single-page and long-strip reading modes.
* **Instant Chapter Jump**: Searchable dropdown allowing instant navigation between chapters and volumes.

### 3. 🌐 Real-Time Synchronized Watch Parties
* **WebSocket Synced Playback**: Powered by **Socket.io**. When the room host plays, pauses, seeks, or selects an episode, all participants' players sync simultaneously.
* **Private Rooms & Easy Sharing**: Generate a unique room code (e.g. `ABC123XYZ`) or copy an instant invite link for friends.
* **Live Room Chat**: Integrated chat bar to discuss plot twists, share reactions, and view active participants in real-time.

### 4. 🎵 Background Music Engine & Jukebox
* **Persistent Global Music Player**: The audio continues playing seamlessly as you navigate between movies, catalogs, manga reader, or profile.
* **YouTube Cloud Streaming**: Search any track, artist, album, or YouTube query.
* **Curated & Custom Playlists**: Create, rename, customize, and delete custom playlists.
* **Favorite Tracks Library**: Quick one-click heart button to save tracks to your permanent Liked Songs collection.
* **Full Playback Controls**: Queue management, seek slider, volume control with mute toggle, shuffle, loop, next/previous, and animated audio equalizer visualizer.
* **Mobile Audio Session Keep-Alive**: Background keep-alive engine ensures playback does not get terminated when your phone screen turns off.

### 5. 🎨 8 Holographic Vector & Particle Dashboard Themes
SyncStream includes 8 fully animated, high-performance themes crafted with CSS custom properties, GPU-accelerated canvas particles, and vector math:

| Theme Name | Primary Palette | Particle & Vector Animation |
| :--- | :--- | :--- |
| **Cryo-Prismatic Glacial Shatter** | Ice Cyan, Arctic Blue & Frost White | Floating ice crystal snowflakes, tumbling crystalline shards, and frost vapor dust. |
| **Cobalt Quantum Wave** | Neon Lime, Ultraviolet & Photon White | Harmonic Lissajous resonance waves, 3D oscillating probability vortexes, and quantum loops. |
| **Obsidian Shadow Void** | Onyx Black, Deep Cosmic Blue & Slate Grey | Hyper-velocity burning meteors, 3D tumbling polyhedral asteroids, and dark ion vapor trails. |
| **Magma Thermal Core** | Molten Crimson, Solar Orange & Ash Charcoal | Thermal convection currents with rising incandescent embers and volcanic heat shimmer. |
| **Emerald Matrix Biogrid** | Cyber Jade, Electric Mint & Deep Obsidian | Full-screen cyber matrix synapse flow, digital rain columns, and branching Tesla grid pulses. |
| **Golden Sunfire Monolith** | Amber Gold, Warm Sunburst & Onyx Black | Radiant solar corona rays with opposing thermal gradient streams and golden micro-embers. |
| **Cyberpunk Synthwave Neon** | Hot Magenta, Electric Teal & Neon Violet | Retro-futuristic perspective wireframe floor gliding toward a glowing neon horizon grid. |
| **Mystic Amethyst Portal** | Royal Purple, Arcane Violet & Emerald Green | Sinuous cosmic nebula filaments, arcane star currents, and resonating celestial constellations. |

### 6. 🎭 Universal Anime & Manga Character Resolution & AI Avatars
* **Natural Language Query Engine**: Search queries like *"koharu from cold sato san"*, *"yota miki koyun anime characters from anime ramparts of ice"*, or *"miki from ramparts of ice"* work seamlessly.
* **Intelligent Title & Token Separation**: Automatically strips conversational filler words (`anime characters from`, `characters in`, etc.) and isolates character names and series titles.
* **Bidirectional Name Matching**: Handles both Western and Japanese name order (`Sato Koharu` ⇄ `Koharu Satou`, `Levi Ackerman` ⇄ `Ackerman Levi`).
* **Phonetic Transliteration Engine**: Automatically resolves vowel variants (e.g., `sato` ⇄ `satou`, `yota` ⇄ `youta`, `gojo` ⇄ `gojou`, `koyun` ⇄ `koyuki`).
* **Full Manga & Light Novel Catalog**: Extends beyond TV anime to include manga-only masterworks like *The Ramparts of Ice*, *Goodnight Punpun*, *Berserk*, *Vagabond*, *Sakamoto Days*, and *Homunculus*.
* **Media Filtering & Badges**: One-click pills to filter by `All Media`, `Anime Only`, or `Manga Only` with live count badges and visual `Manga` / `Anime` tags on cards.
* **WhatsApp & Apple 3D Emojis Catalog**: Over 1,000+ authentic 3D glossy reaction stickers categorized into 9 groups with instant search and one-click pinning.
* **Dedicated AI Prompt Avatar Studio**: Built-in `/api/media/ai/avatar` backend generates high-resolution studio anime portraits or 3D reaction emojis with authentic style prompt engineering.

### 7. 🛡️ Confirmation Alert Boxes & Safeguards
To prevent accidental deletions, SyncStream provides glassmorphic confirmation alert dialogs equipped with visual item previews, badges, and escape-key dismissal:
* **Delete Playlist**: Confirms before deleting a playlist, displaying the playlist title, track count badge, and a warning that all tracks will be unlinked.
* **Remove Song from Favorites**: Clicking the heart on an already-favorited song shows a confirmation dialog with the album cover, track title, artist name, and a rose `Liked Track` badge.
* **Remove Movies, Shows, Anime & Manga from Library**: Clicking the trash or remove bookmark button prompts a context-aware dialog with the media poster, release year, format badge, and a safety net 4.5s undo toast.

### 8. 🎙️ Spotlight Search & Voice Assistant
* **Spotlight Modal**: Press `Ctrl + K` (or `Cmd + K` on macOS) anywhere to launch a universal search modal for instant access to media, music, and pages.
* **Voice Assistant**: Hands-free voice commands to navigate to your watchlist, search movies, control music, or launch watch parties.

---

## 🖥️ How to Use This Website (User Guide)

### 1. Browsing and Streaming Movies & Series
1. Open the **Home** or **Catalog** page.
2. Filter by genre (Action, Sci-Fi, Romance, Comedy, Anime, etc.) or sort by Trending, Popular, or Top Rated.
3. Click on any media card to open its **Media Details** page.
4. Click **Play Now** to launch the video player.
5. If the current video server buffers or fails, simply click any of the **Server 01 - Server 10** buttons directly above the player to instantly switch mirrors.
6. For TV shows and anime, use the **Season & Episode** selector beneath the player to jump to any episode.

### 2. Reading Manga
1. In the search bar or catalog, select **Manga**.
2. Click any manga title to view its chapter index.
3. Select your desired chapter to launch the **Manga Reader**.
4. Use the chapter selector at the top to navigate forward or backward.

### 3. Hosting a Watch Party
1. On any movie or TV series page, click **Host Watch Party** (or navigate to `/room/create`).
2. Copy the generated **Room Code** or share the direct link with friends.
3. As the host, your playback controls (play, pause, seek) will synchronize everyone in the room.
4. Use the live chat drawer on the right side to chat while watching.

### 4. Playing Music & Managing Playlists
1. Navigate to the **Music** page via the navigation bar.
2. Search for any song, artist, or YouTube query.
3. Click any track to start playback. The bottom **MusicPlayerBar** will remain active as you browse other pages.
4. Click the **Heart** icon on any song to save it to your **Liked Songs** library. Clicking it again displays a confirmation alert box before removal.
5. Click **+ Add to Playlist** on any track to save it to an existing playlist or create a new one on the fly.
6. In your playlists tab, you can edit playlist names, reorder tracks, or delete playlists (with confirmation).

### 5. Customizing Themes and Avatars
1. Log in to your account and click **Profile**.
2. **Themes**: Scroll to the **Dashboard Theme** section to pick from the 8 holographic themes (e.g. *Cryo-Prismatic Glacial*, *Cobalt Quantum Wave*, *Obsidian Shadow Void*). Your selection persists across all sessions.
3. **Avatars**:
   - **Anime & Manga Tab**: Search for any character (e.g., *Koharu*, *Yota*, *Miki*, *Gojo*, *Punpun*) or anime/manga title. Click any character to set as your avatar or click `+ Pin` to save it to your permanent collection.
   - **WhatsApp Emojis Tab**: Browse 3D emoji reaction stickers by category or search (`fire`, `skull`, `cat`, `party`).
   - **+ AI Avatar**: Type a custom prompt (e.g., *"cyberpunk ninja with glowing katana"*) to generate a brand new custom avatar.
   - **Custom Upload**: Upload your own photo or GIF directly from your device.

### 6. Managing Your Library (Watchlist)
1. Click **Watchlist** in the navbar to open **My Library**.
2. Your saved titles are neatly separated into **Movies**, **TV Series**, **Anime**, and **Manga** tabs.
3. To remove an item, click the red trash icon. A confirmation alert box will display the poster and title to ensure you do not delete it by mistake.
4. If removed, a 4.5-second **Undo Toast** appears at the bottom allowing you to restore the title with one click.

---

## 🛠️ Tech Stack & Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SyncStream Architecture                         │
├──────────────────────────────────┬─────────────────────────────────────┤
│             Frontend             │               Backend               │
│         (React 18 + Vite)        │       (Node.js + Express.js)        │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • React 18, React Router v6      │ • Express 4 RESTful API             │
│ • Tailwind CSS 3.4 (Custom Tokens│ • Socket.io (WebSocket Watch Party) │
│ • Lucide React Icon Suite        │ • MySQL 8 Database (mysql2 Pool)    │
│ • HLS.js (Adaptive Streaming)    │ • JWT Authentication & Bcrypt       │
│ • MusicContext (Global Audio)    │ • AniList GraphQL Universal Engine  │
│ • Socket.io Client (Real-time)   │ • TMDB API Aggregator & Cache       │
│ • HTML5 Canvas Particle Engines  │ • MangaDex Recursive Chapter Engine │
│ • Axios with Interceptors        │ • YouTube Search & Streaming Engine │
│ • SessionStorage State Restorer  │ • Nodemailer Password Reset Engine  │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
SyncStream/
│
├── client/                               # Frontend React 18 + Vite Application
│   ├── public/                           # Static assets, logos, and manifest
│   ├── src/
│   │   ├── components/                   # Modular UI Components
│   │   │   ├── AddToPlaylistModal.jsx    # Add track to custom playlist modal
│   │   │   ├── BottomNav.jsx             # Mobile bottom navigation bar
│   │   │   ├── ConfirmModal.jsx          # Reusable glassmorphic confirmation alert box
│   │   │   ├── EmbedPlayer.jsx           # Sandboxed multi-server video player
│   │   │   ├── EqualizerBars.jsx         # Audio equalizer animation component
│   │   │   ├── ErrorBoundary.jsx         # Application crash-safety boundary
│   │   │   ├── Footer.jsx                # Global responsive footer
│   │   │   ├── LogoutConfirmModal.jsx    # Logout confirmation dialog
│   │   │   ├── MangaReader.jsx           # Manga chapter reader with pagination
│   │   │   ├── MediaGrid.jsx             # 3D holographic tilt media grid
│   │   │   ├── MusicModal.jsx            # Full-screen immersive music player
│   │   │   ├── MusicPlayerBar.jsx        # Persistent bottom music control bar
│   │   │   ├── Navbar.jsx                # Responsive navbar with user profile pill
│   │   │   ├── ScrollRestoration.jsx     # Route scroll memory manager
│   │   │   ├── ServerWakeup.jsx          # Backend auto-ping connection manager
│   │   │   ├── SpotlightSearchModal.jsx  # Universal Ctrl+K search dialog
│   │   │   ├── ThemeBackground.jsx       # 8 animated vector & particle canvas backdrops
│   │   │   ├── VideoPlayer.jsx           # Native HTML5 / HLS player
│   │   │   └── VoiceAssistant.jsx        # Hands-free speech recognition assistant
│   │   │
│   │   ├── context/                      # React Context Providers
│   │   │   ├── AuthContext.jsx           # User authentication, tokens & profile state
│   │   │   ├── MusicContext.jsx          # Global music player, queue, playlists & favorites
│   │   │   └── SocketContext.jsx         # Socket.io connection manager
│   │   │
│   │   ├── data/                         # Static JSON catalogs
│   │   │   └── whatsapp_emojis.json      # 1,000+ categorized 3D Apple/WhatsApp emojis
│   │   │
│   │   ├── pages/                        # Main Application Routes
│   │   │   ├── Catalog.jsx               # Filterable media catalogs with infinite scroll
│   │   │   ├── ForgotPassword.jsx        # Password reset request & verification
│   │   │   ├── Home.jsx                  # Hero banners, trending rails & spotlights
│   │   │   ├── Login.jsx                 # User login with JWT authentication
│   │   │   ├── MediaDetail.jsx           # Media player, 10 servers, cast & episodes
│   │   │   ├── Music.jsx                 # Jukebox, liked songs, playlists & YouTube search
│   │   │   ├── PersonDetail.jsx          # Actor/director biography & filmography
│   │   │   ├── Profile.jsx               # Themes, avatar studio, emoji picker, AI avatars
│   │   │   ├── Register.jsx              # New user account registration
│   │   │   ├── Search.jsx                # Search across Movies, Series, Anime & Manga
│   │   │   ├── Watchlist.jsx             # My Library with Movie, TV, Anime, Manga sections
│   │   │   └── WatchParty.jsx            # Real-time synced watch room & live chat
│   │   │
│   │   ├── utils/                        # Utilities & Helper Functions
│   │   │   ├── posterFallback.js         # Image poster fallback resolver
│   │   │   └── streamingServers.js       # 10 verified streaming server definitions
│   │   │
│   │   ├── App.jsx                       # Root routing, route guards & theme injector
│   │   ├── index.css                     # Custom Tailwind directives & theme styles
│   │   └── main.jsx                      # Vite React DOM entry point
│   │
│   ├── package.json                      # Client dependencies & scripts
│   ├── tailwind.config.js                # Custom color palettes, animations & tokens
│   └── vite.config.js                    # Vite bundler config with backend API proxy
│
├── server/                               # Backend Node.js / Express Application
│   ├── config/                           # Database & infrastructure config
│   │   └── db.js                         # MySQL connection pool configuration
│   │
│   ├── controllers/                      # Business Logic Handlers
│   │   ├── authController.js             # User register, login, profile, password reset
│   │   ├── mediaController.js            # TMDB, MangaDex, AniList GraphQL, AI avatar
│   │   ├── musicController.js            # YouTube search, stream proxy, playlist CRUD
│   │   └── roomController.js             # Watch party room creation & management
│   │
│   ├── data/                             # Server-side datasets
│   │   └── whatsapp_emojis.json          # Server emoji database
│   │
│   ├── middleware/                       # Custom Express Middleware
│   │   └── auth.js                       # JWT bearer token verification
│   │
│   ├── routes/                           # Express Router Definitions
│   │   ├── auth.js                       # /api/auth routes
│   │   ├── media.js                      # /api/media routes
│   │   ├── music.js                      # /api/music routes
│   │   └── rooms.js                      # /api/rooms routes
│   │
│   ├── index.js                          # Server entry point, HTTP server & Socket.io setup
│   ├── package.json                      # Server dependencies & scripts
│   └── .env.example                      # Template environment variables
│
└── README.md                             # Comprehensive Project Documentation
```

---

## 🚀 Getting Started & Installation

Follow these instructions to set up SyncStream on your local machine.

### Prerequisites
* **Node.js**: `v18.x` or higher installed ([Download Node.js](https://nodejs.org/))
* **MySQL Database**: Local MySQL server (e.g. through **XAMPP**, **WAMP**, or standalone MySQL 8)
* **TMDB API Key**: Free API key from [TheMovieDatabase](https://developer.themoviedb.org/docs)

### Database Setup
1. Start your **MySQL** service (via XAMPP Control Panel or command line).
2. Create a database named `syncstream_db`:
   ```sql
   CREATE DATABASE syncstream_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. SyncStream automatically initializes the necessary tables (`users`, `watchlist`, `playlists`, `playlist_songs`, `favorite_songs`, `rooms`) on first launch!

### Server Setup
1. Open a terminal in the root directory:
   ```bash
   cd server
   npm install
   ```
2. Create your environment configuration file:
   ```bash
   cp .env.example .env
   ```
3. Fill in your MySQL credentials and TMDB API key in `server/.env` (see table below).
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000` with live Socket.io and MySQL connected.*

### Client Setup
1. In a second terminal window, navigate to the client folder:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite development frontend:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

### Environment Variables Guide

#### `server/.env` Configuration:
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port for the Express backend server | `5000` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASS` | MySQL password | *(leave blank if default XAMPP)* |
| `DB_NAME` | Database name | `syncstream_db` |
| `JWT_SECRET` | Secret key used to sign JWT authentication tokens | `your_super_secret_jwt_key_here` |
| `TMDB_API_KEY` | TMDB API V3 key | `your_tmdb_api_key` |
| `TMDB_ACCESS_TOKEN` | TMDB Read Access Token (Optional) | `your_tmdb_read_access_token` |
| `EMAIL_USER` | Gmail address for password reset emails (Optional) | `your_email@gmail.com` |
| `EMAIL_PASS` | Google App Password for Gmail SMTP (Optional) | `your_google_app_password` |

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | ❌ |
| `GET` | `/api/auth/profile` | Fetch authenticated user profile & preferences | ✅ |
| `PUT` | `/api/auth/profile` | Update username, avatar URL, or theme | ✅ |
| `POST` | `/api/auth/forgot-password` | Send password reset token email | ❌ |
| `POST` | `/api/auth/reset-password` | Set new password using token | ❌ |

### 🎬 Media, Streaming & Manga (`/api/media`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/media/trending` | Fetch trending movies, TV shows, anime, or manga | ❌ |
| `GET` | `/api/media/catalog` | Filterable catalog by genre, year, rating, and sort | ❌ |
| `GET` | `/api/media/search` | Search titles across TMDB & MangaDex | ❌ |
| `GET` | `/api/media/details/:id` | Fetch full metadata, cast, videos & recommendations | ❌ |
| `GET` | `/api/media/tv/:id/season/:season_number` | Fetch season episode listings | ❌ |
| `GET` | `/api/media/manga/:id/chapters` | Fetch paginated MangaDex chapter list | ❌ |
| `GET` | `/api/media/anime/characters` | Universal Anime/Manga character search (AniList GraphQL) | ❌ |
| `POST`| `/api/media/ai/avatar` | Generate studio anime portrait or 3D emoji avatar | ❌ |
| `GET` | `/api/media/watchlist` | Get user's saved library items | ✅ |
| `POST`| `/api/media/watchlist` | Save title to user's library | ✅ |
| `DELETE`| `/api/media/watchlist/:id` | Remove title from user's library | ✅ |

### 🎵 Music Engine (`/api/music`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/music/trending` | Top trending musical tracks | ❌ |
| `GET` | `/api/music/search` | Search songs via YouTube Music API | ❌ |
| `GET` | `/api/music/favorites` | Retrieve user's liked tracks library | ✅ |
| `POST`| `/api/music/favorites` | Add track to user's liked songs | ✅ |
| `DELETE`| `/api/music/favorites/:id` | Remove track from user's liked songs | ✅ |
| `GET` | `/api/music/playlists` | Fetch user's custom playlists | ✅ |
| `POST`| `/api/music/playlists` | Create a new custom playlist | ✅ |
| `PUT` | `/api/music/playlists/:id` | Rename / update playlist description | ✅ |
| `DELETE`| `/api/music/playlists/:id` | Delete playlist and unlink tracks | ✅ |
| `POST`| `/api/music/playlists/:id/songs`| Add track to playlist | ✅ |
| `DELETE`| `/api/music/playlists/:id/songs/:songId`| Remove track from playlist | ✅ |

### 🌐 Watch Parties (`/api/rooms`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/rooms/create` | Create a new Watch Party room | ✅ |
| `GET` | `/api/rooms/:code` | Retrieve active room state & media | ✅ |

---

## 🌐 10 Streaming Servers Reference

SyncStream connects to 10 verified, free streaming mirrors with valid SSL certificates. Each server provides unique strengths:

```text
┌────┬────────────────────┬─────────────────────┬────────────────────────────────────────────────────────┐
│ No │ Server Name        │ Badge               │ Key Capabilities                                       │
├────┼────────────────────┼─────────────────────┼────────────────────────────────────────────────────────┤
│ 01 │ VidSrc TO          │ Ultra Fast (Default)│ Primary fast engine, instant bufferless playback       │
│ 02 │ VidLink PRO        │ Multi-Subs • 4K     │ 4K stream sources with multi-language subtitle tracks  │
│ 03 │ VidFast PRO        │ Lightning Fast      │ Adaptive bitrate cloud nodes, ideal for mobile data    │
│ 04 │ 2Embed CC          │ High Quality        │ Massive cinema and anime archive                       │
│ 05 │ AnyEmbed Stream    │ Cloud Player        │ Multi-source auto-failover engine                      │
│ 06 │ MovieTV Cloud      │ Multi-Source        │ High-res HTML5 player with multi-CDN balancing         │
│ 07 │ EmbedWave Ultra    │ Zero Ads Node       │ Clean, ad-light mirror with pristine visual output     │
│ 08 │ 2Embed Skin        │ Global Mirror       │ High-availability secondary 2Embed node                │
│ 09 │ VidSrc SH          │ Official Mirror     │ Official VidSrc primary cloud domain                   │
│ 10 │ Vidzy Ultra        │ Direct Stream • HD  │ Direct high-definition streaming with subtitle tracks  │
└────┴────────────────────┴─────────────────────┴────────────────────────────────────────────────────────┘
```

---

## ⌨️ Keyboard Shortcuts & Pro Tips

| Shortcut | Action | Where |
| :--- | :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Open Spotlight Instant Search | Anywhere |
| `Space` | Play / Pause active music track | When music player is active |
| `Esc` | Close any open modal / confirmation dialog | Any open dialog |
| `F` | Toggle Fullscreen on video player | Video playback |
| `M` | Mute / Unmute audio | Video & Music playback |

### 💡 Pro Tips:
* **Instant Character & Series Lookup**: You don't need to know the exact title format. Type `koharu from cold sato san` or `yota ramparts of ice` in the profile avatar search to instantly find those characters.
* **Filter Manga vs Anime**: In the avatar picker, use the `Manga Only` pill to quickly browse characters from non-animated manga like *Goodnight Punpun* or *Vagabond*.
* **Background Keep-Alive**: When using SyncStream Music on mobile, you can lock your screen or switch apps—audio keeps playing uninterrupted.
* **Undo Accidental Deletions**: If you confirm removal of a movie from your library, watch for the **Undo Toast** at the bottom of the screen to restore it within 4.5 seconds.

---

## 🔒 Security & Reliability

* **Parent Window Navigation Isolation**: All external video iframes run in sandboxed containers to prevent malicious redirects, click-jacking, or pop-under advertising networks.
* **Sanitized Queries & SQL Injection Immunity**: All database interactions use parameterized MySQL queries via `mysql2`.
* **Password Hashing**: User passwords are encrypted with industry-standard **bcrypt** (salt rounds: 10) before storage.
* **Stateless JWT Tokens**: Secure authentication tokens signed with HS256 and verified through custom middleware.

---

## 📄 License

This project is licensed under the **MIT License** — you are free to modify, distribute, and use it for personal and educational purposes.

<div align="center">
  <br />
  <strong>Built with passion for cinema, anime, and high-performance code.</strong>
  <br />
  <sub>© 2026 SyncStream. All rights reserved.</sub>
</div>
