# Vercel Deployment Guide

This guide explains how to deploy both the frontend and backend of this PWA Travel app to Vercel.

## Architecture Overview

- **Frontend**: React + Vite app (static files served from `dist/`)
- **Backend**: Express API converted to Vercel serverless functions (in `api/` directory)
- **Database**: PostgreSQL (you'll need to provide your own database)

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com))
2. A PostgreSQL database (you can use [Supabase](https://supabase.com), [Neon](https://neon.tech), [Railway](https://railway.app), or any PostgreSQL provider)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step-by-Step Deployment

### 1. Prepare Your Database

1. Set up a PostgreSQL database with your preferred provider
2. Get your database connection string (format: `postgresql://user:password@host:port/database`)
3. Initialize the database schema by running:
   ```bash
   npm run init-db
   ```
   (Make sure to set `DATABASE_URL` in your `.env` file first)

### 2. Install Vercel CLI (Optional)

If you want to test locally or deploy via CLI:

```bash
npm i -g vercel
```

### 3. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Connect your repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect the project settings

2. **Configure environment variables:**
   - In the project settings, go to "Environment Variables"
   - Add the following:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `VITE_API_URL`: Leave empty (will use same domain) OR set to your Vercel deployment URL
     - `NODE_ENV`: `production`

3. **Configure build settings:**
   - Vercel should auto-detect from `vercel.json`, but verify:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete

#### Option B: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NODE_ENV production

# Deploy to production
vercel --prod
```

### 4. Configure Frontend API URL

After deployment, Vercel will give you a URL like `https://your-app.vercel.app`.

**Option 1: Use same domain (Recommended)**
- Leave `VITE_API_URL` empty or unset
- The frontend will use relative URLs (`/api/...`) which will be handled by Vercel's serverless functions
- Update your frontend code to use relative URLs (already configured in `src/lib/db-api.ts`)

**Option 2: Set explicit API URL**
- Set `VITE_API_URL` to `https://your-app.vercel.app`
- Rebuild and redeploy

### 5. Verify Deployment

1. **Check frontend:**
   - Visit `https://your-app.vercel.app`
   - The app should load

2. **Check API:**
   - Visit `https://your-app.vercel.app/api/trips` (should return `[]` or your trips)
   - Visit `https://your-app.vercel.app/health` (should return `{"status":"ok",...}`)

3. **Test the app:**
   - Create a trip
   - Add itinerary items
   - Add expenses
   - Verify data syncs correctly

## Project Structure for Vercel

```
pwa-travel/
├── api/                    # Vercel serverless functions
│   └── [...path].ts        # Catch-all API handler
├── dist/                   # Built frontend (generated)
├── server/                 # Original Express server (for local dev)
├── src/                    # Frontend source
├── vercel.json             # Vercel configuration
└── package.json
```

## Environment Variables

### Required for Production:

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: `production`

### Optional:

- `VITE_API_URL`: API base URL (leave empty to use same domain)
- `SUPABASE_DB_URL`: Alternative database URL (if using Supabase)

## How It Works

1. **Frontend**: Built by Vite into `dist/` folder, served as static files
2. **API Routes**: All `/api/*` requests are handled by `api/[...path].ts` serverless function
3. **Routing**: `vercel.json` rewrites:
   - `/api/*` → serverless function
   - `/*` → `index.html` (for React Router)

## Troubleshooting

### API Returns 404

- Check that `api/[...path].ts` exists
- Verify `vercel.json` has correct rewrites
- Check Vercel function logs in dashboard

### Database Connection Errors

- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Check database allows connections from Vercel's IPs
- Ensure SSL is enabled if required (handled automatically in production)

### Frontend Can't Connect to API

- Check browser console for errors
- Verify `VITE_API_URL` is set correctly (or leave empty for same-domain)
- Check network tab to see if API requests are going to correct URL

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles without errors (`npm run build` locally)

## Local Development

For local development, you can still use the Express server:

```bash
# Run both frontend and backend
npm run dev:all

# Or separately
npm run dev:server  # Backend on :3000
npm run dev         # Frontend on :5173
```

The Vercel serverless functions are only used in production deployment.

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. You can:

- Set up branch previews for pull requests
- Configure custom domains
- Set up environment-specific variables (production, preview, development)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## Notes

- The app works **fully offline** even without the API
- API is only needed for syncing data across devices
- Serverless functions have cold start times (usually < 1 second)
- Database connections are pooled and reused across function invocations

