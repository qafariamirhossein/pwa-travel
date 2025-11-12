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
- **Backend**: Supabase (auth, database, storage)
- **Maps**: Leaflet with OpenStreetMap tiles
- **PWA**: Workbox + Vite PWA Plugin

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account (optional - app works offline without it)

## Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: The app works fully offline without Supabase. If you don't provide credentials, the app will function in offline-only mode.

### 3. Set Up Supabase (Optional)

If you want cloud sync, create the following tables in your Supabase project:

#### Trips Table
```sql
CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  cover_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);
```

#### Itinerary Items Table
```sql
CREATE TABLE itinerary_items (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  title TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Expenses Table
```sql
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Notes Table
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
  date DATE,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

### 6. Preview Production Build

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

### 7. Deploy to Vercel

The project is configured for easy deployment on Vercel:

1. **Install Vercel CLI** (optional, for local deployment):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Push your code to GitHub/GitLab/Bitbucket
   - Go to [vercel.com](https://vercel.com) and import your repository
   - Vercel will automatically detect the Vite framework
   - Add environment variables in the Vercel dashboard:
     - `VITE_SUPABASE_URL` - Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts and add environment variables when asked.

**Note**: The `vercel.json` configuration file is already set up with:
- SPA routing (all routes serve `index.html`)
- Proper caching headers for PWA assets
- Service worker configuration

## Project Structure

```
pwa-travel/
├── public/                 # Static assets and PWA icons
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # ShadCN UI components
│   │   ├── tabs/          # Feature tab components
│   │   ├── BottomNav.tsx  # Bottom navigation
│   │   └── OnlineStatus.tsx # Online/offline indicator
│   ├── lib/               # Utilities and services
│   │   ├── db.ts          # IndexedDB operations
│   │   ├── sync.ts        # Sync manager
│   │   ├── supabase.ts    # Supabase client
│   │   └── utils.ts       # Helper functions
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx
│   │   ├── TripDetail.tsx
│   │   ├── TripEdit.tsx
│   │   ├── NewTrip.tsx
│   │   └── Settings.tsx
│   ├── store/             # Zustand stores
│   │   └── useTripStore.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## Offline & Sync Behavior

- **Offline**: All data is stored in IndexedDB. The app works fully offline.
- **Online**: When connected, changes are synced with Supabase automatically.
- **Sync Queue**: Changes made offline are queued and synced when back online.
- **Background Sync**: Automatic sync runs every 30 seconds when online.

## PWA Installation

1. **Chrome/Edge**: Click the install icon in the address bar, or use the menu → "Install NomadNote"
2. **Safari (iOS)**: Tap Share → "Add to Home Screen"
3. **Firefox**: Menu → "Install"

## PWA Icons

**Important**: Replace the placeholder icon files in `public/` with actual icons:

- `pwa-192x192.png` - 192x192px icon
- `pwa-512x512.png` - 512x512px icon  
- `apple-touch-icon.png` - 180x180px for iOS

You can generate these from a single source image using tools like:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add routes in `src/App.tsx`
3. Update stores in `src/store/` if needed
4. Add types in `src/types/index.ts`

### Code Style

- TypeScript strict mode enabled
- ESLint configured
- Prettier recommended (add if needed)

## Troubleshooting

### Service Worker Not Registering

- Ensure you're running on `http://localhost` (not `file://`)
- Check browser console for errors
- Clear browser cache and reload

### Supabase Sync Not Working

- Verify `.env` file has correct credentials
- Check Supabase project is active
- Review browser console for API errors
- App works offline even without Supabase

### Map Not Loading

- Check internet connection (for initial tile load)
- Tiles are cached offline after first load
- Verify Leaflet CSS is imported

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

