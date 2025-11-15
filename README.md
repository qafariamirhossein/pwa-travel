# NomadNote - Travel Companion PWA

A Progressive Web App (PWA) for planning, organizing, and managing trips. Works fully offline with automatic sync when online.

## Features

- 🗓️ **Trip Management** - Create, edit, and delete trips with destinations and dates
- 📅 **Itinerary Builder** - Add daily activities with drag-and-drop reordering
- 💰 **Expense Tracker** - Track expenses by category with budget visualization
- 🗺️ **Map View** - Interactive maps with offline tile caching
- 🧾 **Notes** - Markdown-supported notes for each trip
- 📱 **PWA** - Installable, works offline, syncs automatically

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **UI**: Tailwind CSS + ShadCN UI + Framer Motion
- **Offline Storage**: IndexedDB (via localForage)
- **Backend**: Generic REST API (works with any serverless Postgres)
- **Maps**: Leaflet with OpenStreetMap tiles
- **PWA**: Workbox + Vite PWA Plugin

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A backend API with Postgres database (optional - app works offline without it)

## Quick Start

### Option 1: Run Everything Together (Recommended for Development)

```bash
# Install dependencies
npm install

# Set up your database connection string
echo "DATABASE_URL=postgresql://user:password@host:port/database" >> .env

# Initialize database
npm run init-db

# Run both frontend and backend together
npm run dev:all
```

This starts:
- Backend API on `http://localhost:3000`
- Frontend on `http://localhost:5173`
- Vite automatically proxies `/api/*` requests to the backend

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

**For Development (with Vite proxy):**
```env
DATABASE_URL=postgresql://user:password@host:port/database
# VITE_API_URL is optional in dev - Vite will proxy /api/* to backend
```

**For Production:**
```env
DATABASE_URL=postgresql://user:password@host:port/database
VITE_API_URL=https://your-api-url.com
```

**Note**: The app works fully offline without an API. If you don't provide an API URL, the app will function in offline-only mode.

### 3. Initialize Database

Run the database initialization script:

```bash
npm run init-db
```

This creates all required tables in your Postgres database.

### 4. Start Development

**Run both together:**
```bash
npm run dev:all
```

**Or run separately:**
```bash
# Terminal 1
npm run dev:server

# Terminal 2  
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Development Workflow

### Running Both Services

The easiest way is to use `npm run dev:all` which runs both frontend and backend together:

- **Backend API**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`
- **API Proxy**: Vite automatically proxies `/api/*` to `http://localhost:3000`

In development, you don't need to set `VITE_API_URL` - the frontend uses relative URLs that Vite proxies to the backend.

### Running Separately

If you prefer to run them separately:

1. **Backend** (Terminal 1):
   ```bash
   npm run dev:server
   ```

2. **Frontend** (Terminal 2):
   ```bash
   npm run dev
   ```

3. Set `VITE_API_URL=http://localhost:3000` in `.env` if running separately

## Project Structure

```
pwa-travel/
├── server/              # Backend API server
│   ├── index.ts        # Express server
│   └── README.md       # Server documentation
├── public/             # Static assets and PWA icons
├── src/
│   ├── components/     # React components
│   │   ├── ui/        # ShadCN UI components
│   │   ├── tabs/      # Feature tab components
│   │   ├── BottomNav.tsx
│   │   └── OnlineStatus.tsx
│   ├── lib/           # Utilities and services
│   │   ├── db.ts      # IndexedDB operations
│   │   ├── db-api.ts  # Database API client
│   │   ├── sync.ts    # Sync manager
│   │   └── utils.ts    # Helper functions
│   ├── pages/         # Page components
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── scripts/
│   └── init-db.ts     # Database initialization
├── package.json
└── README.md
```

## Offline & Sync Behavior

- **Offline**: All data is stored in IndexedDB. The app works fully offline.
- **Online**: When connected, changes are synced with your backend API automatically.
- **Sync Queue**: Changes made offline are queued and synced when back online.
- **Background Sync**: Automatic sync runs every 30 seconds when online.

## PWA Installation

1. **Chrome/Edge**: Click the install icon in the address bar, or use the menu → "Install NomadNote"
2. **Safari (iOS)**: Tap Share → "Add to Home Screen"
3. **Firefox**: Menu → "Install"

## Deployment

### Frontend (Vercel, Netlify, etc.)

Deploy the `dist` folder after running `npm run build`. Set `VITE_API_URL` to your backend API URL.

### Backend (Railway, Render, Fly.io, etc.)

Deploy the `server/` folder. Set `DATABASE_URL` environment variable in your hosting platform.

## Troubleshooting

### API Sync Not Working

- Verify `.env` file has correct `DATABASE_URL`
- Check your backend API is running (`npm run dev:server`)
- In development, make sure you're using `npm run dev:all` or have the proxy configured
- Review browser console for API errors
- Ensure your backend API implements the required endpoints
- App works offline even without an API

### Service Worker Not Registering

- Ensure you're running on `http://localhost` (not `file://`)
- Check browser console for errors
- Clear browser cache and reload

### Map Not Loading

- Check internet connection (for initial tile load)
- Tiles are cached offline after first load
- Verify Leaflet CSS is imported

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
