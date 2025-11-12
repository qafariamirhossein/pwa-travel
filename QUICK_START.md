# Quick Start Guide

Get NomadNote up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

That's it! The app will run at `http://localhost:5173`

## Optional: Enable Cloud Sync

If you want data to sync across devices:

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL scripts from `README.md` in the Supabase SQL editor
4. Copy your project URL and anon key
5. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
6. Add your credentials to `.env`
7. Restart the dev server

**Note**: The app works perfectly offline without Supabase! Cloud sync is optional.

## First Steps

1. Click "New Trip" to create your first trip
2. Add activities to your itinerary
3. Track expenses in the Budget tab
4. Write notes with Markdown support
5. View everything on the map

## Install as PWA

1. Look for the install prompt in your browser
2. Or use the Settings page → "Install App"
3. The app will work offline after installation!

## Troubleshooting

**Service worker not working?**
- Make sure you're on `http://localhost` (not `file://`)
- Check browser console for errors

**Map not loading?**
- Initial load requires internet connection
- Tiles are cached for offline use after first load

**Sync not working?**
- Check `.env` file has correct Supabase credentials
- App works offline even without Supabase

Enjoy planning your trips! 🗺️✈️

