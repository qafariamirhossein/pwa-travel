# Setup Instructions

## Quick Setup (Offline Mode)

The app works immediately without any configuration!

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and start using the app.

## Full Setup (With Cloud Sync)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create a `.env` file in the root directory:

```bash
# Copy this content to .env
VITE_API_URL=https://your-api-url.com
```

### 3. Set Up Backend API and Database

1. Set up a serverless Postgres database (e.g., Neon, Railway, Vercel Postgres, etc.)
2. Get your Postgres connection string
3. Set up a backend API that connects to your Postgres database using the connection string
4. The backend should implement REST endpoints (see README.md for details)
5. Initialize your database by running:

```bash
npm run init-db
```

This will create the required tables. The script uses `DATABASE_URL` or `SUPABASE_DB_URL` from your `.env` file.

Alternatively, you can manually create the tables using SQL:

#### Create Trips Table
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

#### Create Itinerary Items Table
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

#### Create Expenses Table
```sql
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES expenses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Create Notes Table
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

4. Make sure your backend API is running and accessible
5. Add the API URL to `.env` as `VITE_API_URL`

### 4. Replace PWA Icons

Replace placeholder icons in `public/`:
- `pwa-192x192.png` (192x192px)
- `pwa-512x512.png` (512x512px)
- `apple-touch-icon.png` (180x180px)

Use tools like [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator).

### 5. Run the App

```bash
npm run dev
```

## Build for Production

```bash
npm run build
npm run preview
```

## Troubleshooting

### Service Worker Issues
- Must run on `http://localhost` (not `file://`)
- Clear browser cache if issues persist
- Check browser console for errors

### API Sync Not Working
- Verify `.env` file exists and has correct `VITE_API_URL`
- Check your backend API is running and accessible
- Ensure your backend implements the required REST endpoints
- Review browser console for API errors
- App works offline even without an API

### Map Not Loading
- Requires internet for initial tile load
- Tiles cached offline after first load
- Check Leaflet CSS is imported

## Next Steps

1. Start the dev server
2. Create your first trip
3. Add activities to itinerary
4. Track expenses
5. Write notes
6. Install as PWA!

Enjoy! 🗺️✈️

