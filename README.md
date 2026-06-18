# SyncStream

**SyncStream** is an advanced, premium web application built for watching movies, TV shows, and anime, as well as reading manga—all synchronized across devices with real-time watch parties. It utilizes cutting-edge APIs to provide users with an ultra-smooth, ad-free streaming and reading experience.

---

## 🌟 Key Features

- **Massive Content Library:** Integrated deeply with TMDB and MangaDex, providing access to tens of thousands of movies, TV series, anime, and manga chapters.
- **Real-Time Watch Parties:** Powered by Socket.io, users can create private rooms and invite friends to watch movies or anime together in perfect synchronization.
- **Custom Embedded Players:** Seamlessly plays 1080p and 4K content via secure proxy embeds and external streaming APIs (like VidSrc) directly in your browser.
- **Advanced Manga Reader:** An ultra-fast, paginated manga engine utilizing the MangaDex API, allowing you to read up to 5,000 chapters seamlessly with dynamic dropdown navigation.
- **Smart Cataloging:** Deep filtering using TMDB Keyword mappings, allowing you to find niche genres like *Ecchi, Mecha, Isekai, Shounen, and Seinen* that standard platforms ignore.
- **Infinite Scrolling & Scroll Restoration:** Smoothly load thousands of movies with lazy-loading mechanisms. Browser navigation securely restores your exact scroll position and loaded pages so you never lose your place.
- **Sleek UI/UX:** Built entirely with TailwindCSS, featuring a "glassmorphism" aesthetic, cosmic dark themes, and buttery smooth micro-animations.

---

## 🛠️ Technology Stack

**Frontend (Client)**
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS 3.4
- **Routing:** React Router DOM v6
- **Icons:** Lucide-React
- **State Management & Data Fetching:** React Hooks (`useState`, `useEffect`, `useContext`) and Axios

**Backend (Server)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Database:** MongoDB (via Mongoose)
- **Real-Time Websockets:** Socket.io
- **Security:** Helmet, CORS, and custom API Rate Limiting

**External APIs**
- **Media Metadata:** The Movie Database (TMDB) API
- **Manga Infrastructure:** MangaDex API
- **Streaming Servers:** VidSrc & custom embedded players

---

## 🚀 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)
- A [TMDB API Key](https://developer.themoviedb.org/docs)

### 1. Clone the Repository
Clone the project locally into your designated workspace.
```bash
git clone https://github.com/your-username/SyncStream.git
cd SyncStream
```

### 2. Setup the Backend Server
1. Navigate into the `server` directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and configure it:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   TMDB_API_KEY=your_tmdb_api_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Setup the Frontend Client
1. Open a new terminal window and navigate into the `client` directory:
   ```bash
   cd client
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 4. Enjoy SyncStream!
Open your browser and navigate to `http://localhost:5173`. You can now browse movies, read manga, and host watch parties locally!

---

## 🔒 Production Deployment
SyncStream is optimized for production environments:
- The frontend is compiled into highly optimized static chunks via `npm run build` and can be hosted freely on Vercel, Netlify, or Render.
- The backend server is stateless (except for websockets) and can be hosted efficiently on Render, Heroku, or DigitalOcean Apps. 
- Ensure your production `.env` files correctly link the frontend to the live backend URL, and configure CORS properly to prevent unauthorized API requests.
