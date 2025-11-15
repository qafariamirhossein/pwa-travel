/**
 * Vercel Serverless Function - API Handler
 * 
 * This is a catch-all route handler for all API endpoints.
 * It adapts the Express server logic to work with Vercel's serverless functions.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import pg from 'pg'

const { Pool } = pg

// Initialize database connection pool
// Note: In serverless, connections are reused across invocations
let pool: pg.Pool | null = null

function getPool(): pg.Pool {
  if (!pool) {
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in environment variables')
    }

    pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // Serverless-friendly connection pool settings
      max: 1, // Limit connections per function instance
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }

  return pool
}

// CORS headers
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res)
    return res.status(200).end()
  }

  setCorsHeaders(res)

  const path = (req.query.path as string[]) || []
  const method = req.method
  const pool = getPool()

  try {
    // ============================================
    // TRIPS ENDPOINTS
    // ============================================

    // GET /api/trips
    if (path.length === 1 && path[0] === 'trips' && method === 'GET') {
      const result = await pool.query(
        'SELECT * FROM trips ORDER BY updated_at DESC'
      )
      return res.json(result.rows)
    }

    // POST /api/trips
    if (path.length === 1 && path[0] === 'trips' && method === 'POST') {
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
      return res.json(result.rows[0])
    }

    // DELETE /api/trips/:id
    if (path.length === 2 && path[0] === 'trips' && method === 'DELETE') {
      await pool.query('DELETE FROM trips WHERE id = $1', [path[1]])
      return res.json({ success: true })
    }

    // ============================================
    // ITINERARY ENDPOINTS
    // ============================================

    // GET /api/trips/:tripId/itinerary
    if (
      path.length === 3 &&
      path[0] === 'trips' &&
      path[2] === 'itinerary' &&
      method === 'GET'
    ) {
      const result = await pool.query(
        'SELECT * FROM itinerary_items WHERE trip_id = $1 ORDER BY "order" ASC',
        [path[1]]
      )
      return res.json(result.rows)
    }

    // POST /api/itinerary
    if (path.length === 1 && path[0] === 'itinerary' && method === 'POST') {
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
      return res.json(result.rows[0])
    }

    // DELETE /api/itinerary/:id
    if (path.length === 2 && path[0] === 'itinerary' && method === 'DELETE') {
      await pool.query('DELETE FROM itinerary_items WHERE id = $1', [path[1]])
      return res.json({ success: true })
    }

    // ============================================
    // EXPENSES ENDPOINTS
    // ============================================

    // GET /api/trips/:tripId/expenses
    if (
      path.length === 3 &&
      path[0] === 'trips' &&
      path[2] === 'expenses' &&
      method === 'GET'
    ) {
      const result = await pool.query(
        'SELECT * FROM expenses WHERE trip_id = $1 ORDER BY created_at DESC',
        [path[1]]
      )
      return res.json(result.rows)
    }

    // POST /api/expenses
    if (path.length === 1 && path[0] === 'expenses' && method === 'POST') {
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
      return res.json(result.rows[0])
    }

    // DELETE /api/expenses/:id
    if (path.length === 2 && path[0] === 'expenses' && method === 'DELETE') {
      await pool.query('DELETE FROM expenses WHERE id = $1', [path[1]])
      return res.json({ success: true })
    }

    // ============================================
    // NOTES ENDPOINTS
    // ============================================

    // GET /api/trips/:tripId/notes
    if (
      path.length === 3 &&
      path[0] === 'trips' &&
      path[2] === 'notes' &&
      method === 'GET'
    ) {
      const result = await pool.query(
        'SELECT * FROM notes WHERE trip_id = $1 ORDER BY updated_at DESC',
        [path[1]]
      )
      return res.json(result.rows)
    }

    // POST /api/notes
    if (path.length === 1 && path[0] === 'notes' && method === 'POST') {
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
      return res.json(result.rows[0])
    }

    // DELETE /api/notes/:id
    if (path.length === 2 && path[0] === 'notes' && method === 'DELETE') {
      await pool.query('DELETE FROM notes WHERE id = $1', [path[1]])
      return res.json({ success: true })
    }

    // Health check - /api/health
    if (path.length === 1 && path[0] === 'health' && method === 'GET') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() })
    }

    // 404 for unmatched routes
    return res.status(404).json({ error: 'Not found' })
  } catch (error) {
    console.error('API Error:', error)
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Internal server error' })
  }
}

