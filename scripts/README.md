# Database Initialization Script

This script initializes your Postgres database with all required tables, indexes, triggers, and security policies.

Works with any Postgres database (Neon, Railway, Vercel Postgres, Supabase, etc.).

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Get your Postgres database connection string:
   - From your database provider (Neon, Railway, Vercel, Supabase, etc.)
   - Format: `postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]`
   - Example: `postgresql://postgres:mypassword@db.example.com:5432/postgres`

## Setup

1. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   touch .env
   ```

2. Add your database connection string to `.env`:
   ```env
   DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
   ```
   
   Or use `SUPABASE_DB_URL` (for backwards compatibility):
   ```env
   SUPABASE_DB_URL=postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
   ```

## Usage

Run the initialization script:

```bash
npm run init-db
```

Or directly with tsx:

```bash
npx tsx scripts/init-db.ts
```

## What It Does

The script creates:

- ✅ **5 tables**: `trips`, `itinerary_items`, `expenses`, `notes`, `packing_items`
- ✅ **Indexes** for optimized queries
- ✅ **Foreign keys** with CASCADE deletes
- ✅ **Triggers** to auto-update `updated_at` timestamps
- ✅ **Row Level Security (RLS)** policies
- ✅ **Permissions** for authenticated and anonymous users

## Troubleshooting

### Error: "Database connection string not found"
- Make sure you've added `SUPABASE_DB_URL` or `DATABASE_URL` to your `.env` file
- Check that the connection string is correct

### Error: "password authentication failed"
- Verify your database password in the connection string
- Make sure you're using the correct credentials from your database provider

### Error: "relation already exists"
- Tables already exist - this is safe to ignore
- The script uses `CREATE TABLE IF NOT EXISTS` so it won't overwrite existing data

### Error: "permission denied"
- Make sure you're using the correct database user credentials
- Check that your connection string has the right permissions

## Security Note

⚠️ **Important**: Never commit your `.env` file to version control. It contains sensitive database credentials.

The `.env` file should already be in `.gitignore`, but double-check to ensure it's not tracked.

