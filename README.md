<div align="center">
  <img src="https://placehold.co/1000x300/1e1e24/00d2ff?text=SyncStream" alt="SyncStream Banner" />
  
  <br />
  <br />

  **An advanced, premium web application for streaming movies, TV shows, anime, and reading manga. Complete with real-time watch parties and an immersive UI.**

  <br />

  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
</div>

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [Features](#-key-features)
3. [Architecture & Tech Stack](#-architecture--tech-stack)
4. [Project Structure](#-project-structure)
5. [Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
6. [API Endpoints](#-api-endpoints)
7. [Deployment](#-deployment)
8. [License](#-license)

---

## 🌌 Overview

**SyncStream** is the ultimate all-in-one entertainment hub. Designed to rival premium streaming platforms, it aggregates vast libraries of content—from blockbuster movies and hit TV series to niche anime and manga chapters. Beyond streaming, SyncStream features **real-time Watch Parties**, allowing users to sync their playback instantly with friends across the globe.

Featuring a cutting-edge **Glassmorphism UI**, intelligent infinite-scrolling catalogs, and sub-millisecond state restoration, SyncStream represents the pinnacle of modern web development.

---

## ✨ Key Features

### 🎬 Infinite Streaming Library
- **Movies & TV Shows:** Deep integration with the **TMDB API** for metadata, trailers, cast lists, and dynamic recommendations.
- **Anime Engine:** Custom TMDB keyword mapping to surface niche anime genres like *Mecha, Isekai, Ecchi, Seinen, and Shounen*.
- **Manga Reader:** A high-performance, paginated manga engine utilizing the **MangaDex API**, capable of seamlessly loading and reading up to 5,000 chapters with a built-in chapter navigation dropdown.

### 🌐 Real-Time Watch Parties
- **Socket.io Integration:** Create secure, private rooms for friends.
- **Synchronized Playback:** When the host plays, pauses, or seeks, the entire room syncs up flawlessly in real-time with zero buffering latency.
- **Live Chat:** Built-in room chat for interacting during the movie.

### ⚡ Intelligent UI/UX
- **Scroll Restoration:** Advanced `sessionStorage` caching means when you hit the "Back" button, you are instantly returned to your exact scroll position and catalog page.
- **Dynamic Search & Filtering:** Over 40+ granular genres across TV, Anime, and Manga categories.
- **Beautiful Aesthetics:** Crafted entirely with custom TailwindCSS tokens, featuring deep dark modes (`#0B0C10`), sleek cyan accents (`#00E5FF`), and gorgeous hover micro-animations.

---

## 🛠 Architecture & Tech Stack

### Frontend (Client)
Built for extreme speed and reactivity.
* **React 18** (Functional Components, Custom Hooks)
* **Vite** (Next-generation lightning-fast bundler)
* **Tailwind CSS v3.4** (Utility-first styling, custom cosmic theme)
* **Lucide-React** (Beautiful, lightweight SVG icons)
* **React Router DOM v6** (Client-side routing)
* **Axios** (Promise-based HTTP client)

### Backend (Server)
Robust, secure, and real-time capable.
* **Node.js & Express.js** (RESTful API framework)
* **Socket.io** (Websocket protocol for live watch parties)
* **Mongoose** (MongoDB Object Modeling)
* **JWT (JSON Web Tokens)** & **Bcryptjs** (Secure Authentication)
* **Helmet & CORS** (API Security)

---

## 📁 Project Structure

```text
SyncStream/
│
├── client/                     # Frontend React Application
│   ├── public/                 # Static assets (Favicons, etc.)
│   ├── src/                    
│   │   ├── components/         # Reusable UI components (Navbar, MangaReader, etc.)
│   │   ├── pages/              # Main Route Views (Home, Catalog, WatchParty, etc.)
│   │   ├── App.jsx             # Root Component & Routes setup
│   │   ├── ScrollRestoration/  # Advanced custom scroll caching logic
│   │   └── index.css           # Global Tailwind directives
│   ├── vite.config.js          # Vite build configuration
│   └── package.json            
│
├── server/                     # Backend Express API
│   ├── controllers/            # Route logic (mediaController.js, authController.js)
│   ├── models/                 # MongoDB Schemas (User.js)
│   ├── routes/                 # Express Routers (/api/media, /api/auth)
│   ├── middleware/             # Custom Express middleware (auth protection)
│   ├── server.js               # Entry point & Socket.io initialization
│   └── package.json            
│
└── README.md                   # Project Documentation
```

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites
- **Node.js**: `v16.x` or higher
- **MongoDB**: A local MongoDB server or a free MongoDB Atlas cluster.
- **TMDB API Key**: Register at [developer.themoviedb.org](https://developer.themoviedb.org/docs) for a free V3 API key.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/SyncStream.git
   cd SyncStream
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

You must create `.env` files in both the `server` and `client` directories.

**In `server/.env`:**
```env
# Server Port
PORT=5000

# MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/syncstream?retryWrites=true&w=majority

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_signature_key

# External APIs
TMDB_API_KEY=your_tmdb_v3_api_key
```

**In `client/.env`:**
```env
# URL pointing to your local Node.js backend
VITE_API_BASE_URL=http://localhost:5000
```

### Running the Application

Open two separate terminal windows.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
*(Server should start on `http://localhost:5000`)*

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
*(Client should start on `http://localhost:5173`)*

Navigate to `http://localhost:5173` in your browser to experience SyncStream!

---

## 🔌 API Endpoints

The backend acts as a powerful proxy and aggregator for external services to prevent exposing your API keys.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/media/trending` | Fetches trending movies, TV shows, anime, or manga. |
| `GET` | `/api/media/catalog` | Fetches paginated catalogs with advanced genre/demographic filtering. |
| `GET` | `/api/media/search` | Executes a global query across TMDB and MangaDex. |
| `GET` | `/api/media/details/:id` | Fetches deep metadata, trailers, and cast info for a specific title. |
| `GET` | `/api/media/tv/:id/season/:season_number` | Retrieves specific episode titles and summaries for TV series. |
| `GET` | `/api/media/manga/:id/chapters` | Recursively paginates to fetch thousands of MangaDex chapters. |
| `POST`| `/api/auth/register` | Registers a new user via bcrypt. |
| `POST`| `/api/auth/login` | Authenticates a user and returns a JWT. |

---

## 📦 Deployment

SyncStream is designed for seamless modern deployment.

- **Frontend:** Can be deployed as a static site. Run `npm run build` in the `/client` directory. The resulting `/dist` folder can be uploaded directly to **Vercel**, **Netlify**, or **Render**.
- **Backend:** The Node.js server can be deployed to **Render Web Services**, **Heroku**, or **DigitalOcean**. 
  - *Important:* Ensure your host supports Websockets (Socket.io) for the Watch Party feature to function properly in production.
  - Set all your Production `.env` variables on your hosting provider dashboard.

---

<div align="center">
  <i>Crafted with passion for cinema, anime, and code.</i>
</div>
