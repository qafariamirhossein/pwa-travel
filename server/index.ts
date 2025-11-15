/**
 * Simple Backend API Server
 * 
 * This server connects to your Postgres database using a connection string
 * and provides REST API endpoints for the frontend.
 * 
 * Environment Variables:
 *   DATABASE_URL - Postgres connection string
 *   PORT - Server port (default: 3000)
 *   NODE_ENV - Environment (development/production)
 */

import express from 'express'
import cors from 'cors'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL not found in environment variables')
  console.error('Please set DATABASE_URL in your .env file')
  process.exit(1)
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Test database connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message)
  } else {
    console.log('✅ Connected to database')
  }
})

// ============================================
// TRIPS ENDPOINTS
// ============================================

// Get all trips
app.get('/api/trips', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trips ORDER BY updated_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching trips:', error)
    res.status(500).json({ error: 'Failed to fetch trips' })
  }
})

// Create or update a trip (upsert)
app.post('/api/trips', async (req, res) => {
  try {
    const trip = req.body
    const result = await pool.query(
      `INSERT INTO trips (id, name, destination, start_date, end_date, cover_photo, created_at, updated_at, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         destination = EXCLUDED.destination,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         cover_photo = EXCLUDED.cover_photo,
         updated_at = EXCLUDED.updated_at,
         user_id = EXCLUDED.user_id
       RETURNING *`,
      [
        trip.id,
        trip.name,
        trip.destination,
        trip.startDate || trip.start_date,
        trip.endDate || trip.end_date,
        trip.coverPhoto || trip.cover_photo || null,
        trip.createdAt || trip.created_at || new Date().toISOString(),
        trip.updatedAt || trip.updated_at || new Date().toISOString(),
        trip.userId || trip.user_id || null,
      ]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error upserting trip:', error)
    res.status(500).json({ error: 'Failed to save trip' })
  }
})

// Delete a trip
app.delete('/api/trips/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM trips WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting trip:', error)
    res.status(500).json({ error: 'Failed to delete trip' })
  }
})

// ============================================
// ITINERARY ENDPOINTS
// ============================================

// Get itinerary items for a trip
app.get('/api/trips/:tripId/itinerary', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM itinerary_items WHERE trip_id = $1 ORDER BY "order" ASC',
      [req.params.tripId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching itinerary items:', error)
    res.status(500).json({ error: 'Failed to fetch itinerary items' })
  }
})

// Create or update an itinerary item (upsert)
app.post('/api/itinerary', async (req, res) => {
  try {
    const item = req.body
    const result = await pool.query(
      `INSERT INTO itinerary_items (id, trip_id, date, time, title, location, notes, "order", created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         trip_id = EXCLUDED.trip_id,
         date = EXCLUDED.date,
         time = EXCLUDED.time,
         title = EXCLUDED.title,
         location = EXCLUDED.location,
         notes = EXCLUDED.notes,
         "order" = EXCLUDED."order",
         updated_at = EXCLUDED.updated_at
       RETURNING *`,
      [
        item.id,
        item.tripId || item.trip_id,
        item.date,
        item.time || null,
        item.title,
        item.location || null,
        item.notes || null,
        item.order || 0,
        item.createdAt || item.created_at || new Date().toISOString(),
        item.updatedAt || item.updated_at || new Date().toISOString(),
      ]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error upserting itinerary item:', error)
    res.status(500).json({ error: 'Failed to save itinerary item' })
  }
})

// Delete an itinerary item
app.delete('/api/itinerary/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM itinerary_items WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting itinerary item:', error)
    res.status(500).json({ error: 'Failed to delete itinerary item' })
  }
})

// ============================================
// EXPENSES ENDPOINTS
// ============================================

// Get expenses for a trip
app.get('/api/trips/:tripId/expenses', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE trip_id = $1 ORDER BY created_at DESC',
      [req.params.tripId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({ error: 'Failed to fetch expenses' })
  }
})

// Create or update an expense (upsert)
app.post('/api/expenses', async (req, res) => {
  try {
    const expense = req.body
    const result = await pool.query(
      `INSERT INTO expenses (id, trip_id, category, amount, currency, note, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         trip_id = EXCLUDED.trip_id,
         category = EXCLUDED.category,
         amount = EXCLUDED.amount,
         currency = EXCLUDED.currency,
         note = EXCLUDED.note,
         updated_at = EXCLUDED.updated_at
       RETURNING *`,
      [
        expense.id,
        expense.tripId || expense.trip_id,
        expense.category,
        expense.amount,
        expense.currency || 'USD',
        expense.note || null,
        expense.createdAt || expense.created_at || new Date().toISOString(),
        expense.updatedAt || expense.updated_at || new Date().toISOString(),
      ]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error upserting expense:', error)
    res.status(500).json({ error: 'Failed to save expense' })
  }
})

// Delete an expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({ error: 'Failed to delete expense' })
  }
})

// ============================================
// NOTES ENDPOINTS
// ============================================

// Get notes for a trip
app.get('/api/trips/:tripId/notes', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE trip_id = $1 ORDER BY updated_at DESC',
      [req.params.tripId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching notes:', error)
    res.status(500).json({ error: 'Failed to fetch notes' })
  }
})

// Create or update a note (upsert)
app.post('/api/notes', async (req, res) => {
  try {
    const note = req.body
    const result = await pool.query(
      `INSERT INTO notes (id, trip_id, date, content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         trip_id = EXCLUDED.trip_id,
         date = EXCLUDED.date,
         content = EXCLUDED.content,
         updated_at = EXCLUDED.updated_at
       RETURNING *`,
      [
        note.id,
        note.tripId || note.trip_id,
        note.date || null,
        note.content,
        note.createdAt || note.created_at || new Date().toISOString(),
        note.updatedAt || note.updated_at || new Date().toISOString(),
      ]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error upserting note:', error)
    res.status(500).json({ error: 'Failed to save note' })
  }
})

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notes WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    res.status(500).json({ error: 'Failed to delete note' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Database: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`) // Hide password
})

