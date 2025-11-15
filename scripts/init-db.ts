#!/usr/bin/env node
/**
 * Database Initialization Script
 * 
 * This script initializes a Postgres database with all required tables.
 * Works with any Postgres database (Neon, Railway, Vercel Postgres, Supabase, etc.).
 * 
 * Usage:
 *   npm run init-db
 *   or
 *   npx tsx scripts/init-db.ts
 * 
 * Environment Variables Required:
 *   DATABASE_URL - Postgres connection string
 *     Format: postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
 *   Or SUPABASE_DB_URL (for backwards compatibility)
 */

import pg from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env') })

const SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TRIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.trips (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  cover_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID
);

-- Indexes for trips
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_updated_at ON public.trips(updated_at DESC);

-- ============================================
-- 2. ITINERARY_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.itinerary_items (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT,
  title TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for itinerary_items
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON public.itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_order ON public.itinerary_items(trip_id, "order");

-- ============================================
-- 3. EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- ============================================
-- 4. NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notes (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  date TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notes
CREATE INDEX IF NOT EXISTS idx_notes_trip_id ON public.notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);

-- ============================================
-- 5. PACKING_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.packing_items (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  packed BOOLEAN NOT NULL DEFAULT FALSE,
  quantity INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for packing_items
CREATE INDEX IF NOT EXISTS idx_packing_items_trip_id ON public.packing_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_packing_items_category ON public.packing_items(category);

-- ============================================
-- 6. FUNCTION TO UPDATE updated_at TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. TRIGGERS FOR AUTO-UPDATE updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_itinerary_items_updated_at ON public.itinerary_items;
CREATE TRIGGER update_itinerary_items_updated_at
  BEFORE UPDATE ON public.itinerary_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_packing_items_updated_at ON public.packing_items;
CREATE TRIGGER update_packing_items_updated_at
  BEFORE UPDATE ON public.packing_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Note: RLS policies are Supabase-specific and require the auth schema.
-- These are commented out for compatibility with standard Postgres databases.
-- Uncomment if using Supabase and the auth schema exists.

-- ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.trips;
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.itinerary_items;
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.expenses;
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.notes;
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.packing_items;

-- Create policies
-- CREATE POLICY "Allow all for authenticated users" ON public.trips
--   FOR ALL
--   USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
--   WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- CREATE POLICY "Allow all for authenticated users" ON public.itinerary_items
--   FOR ALL
--   USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
--   WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- CREATE POLICY "Allow all for authenticated users" ON public.expenses
--   FOR ALL
--   USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
--   WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- CREATE POLICY "Allow all for authenticated users" ON public.notes
--   FOR ALL
--   USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
--   WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- CREATE POLICY "Allow all for authenticated users" ON public.packing_items
--   FOR ALL
--   USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
--   WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================
-- Note: These grants are Supabase-specific and require the authenticated/anon roles.
-- These are commented out for compatibility with standard Postgres databases.
-- Uncomment if using Supabase.

-- GRANT USAGE ON SCHEMA public TO authenticated, anon;
-- GRANT ALL ON public.trips TO authenticated, anon;
-- GRANT ALL ON public.itinerary_items TO authenticated, anon;
-- GRANT ALL ON public.expenses TO authenticated, anon;
-- GRANT ALL ON public.notes TO authenticated, anon;
-- GRANT ALL ON public.packing_items TO authenticated, anon;
`

async function initDatabase() {
  // Get connection string from environment
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

  if (!dbUrl) {
    console.error('❌ Error: Database connection string not found!')
    console.error('\nPlease set one of these environment variables:')
    console.error('  - DATABASE_URL')
    console.error('  - SUPABASE_DB_URL (for backwards compatibility)')
    console.error('\nGet your connection string from your database provider:')
    console.error('  Format: postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]')
    console.error('  Examples: Neon, Railway, Vercel Postgres, Supabase, etc.')
    process.exit(1)
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected successfully!')

    console.log('📊 Creating tables and indexes...')
    await client.query(SQL)
    console.log('✅ Database initialized successfully!')

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('trips', 'itinerary_items', 'expenses', 'notes', 'packing_items')
      ORDER BY table_name;
    `)

    console.log('\n📋 Created tables:')
    result.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`)
    })

    console.log('\n🎉 Database initialization complete!')
  } catch (error) {
    console.error('❌ Error initializing database:')
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
    } else {
      console.error(error)
    }
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Database connection closed.')
  }
}

// Run the script
initDatabase().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

