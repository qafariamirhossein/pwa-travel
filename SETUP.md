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
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and run these scripts:

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

4. Get your project URL and anon key from Project Settings → API
5. Add them to `.env`

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

### Supabase Sync Not Working
- Verify `.env` file exists and has correct values
- Check Supabase project is active
- Review browser console for API errors
- App works offline even without Supabase

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

