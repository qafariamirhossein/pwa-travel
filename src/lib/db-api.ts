/**
 * Generic Database API Client
 * 
 * This client makes HTTP requests to a backend API that connects to Postgres.
 * The backend should accept a Postgres connection string and handle all database operations.
 * 
 * Environment Variables:
 *   VITE_API_URL - Base URL of your backend API (optional in dev, uses Vite proxy)
 *                  In production: https://api.example.com
 *                  In development: leave empty to use Vite proxy (http://localhost:5173/api -> http://localhost:3000/api)
 */

// In development, if VITE_API_URL is not set, use relative URLs (Vite will proxy to backend)
// In production, use the provided API URL or relative URLs if on same domain
// When VITE_API_URL is not set, we use relative URLs which work when frontend/backend are on same domain
const API_URL = import.meta.env.VITE_API_URL || ''

// Only log info in dev mode, no warning needed in production when using relative URLs
if (import.meta.env.DEV && !API_URL) {
  console.log('Using relative API URLs (Vite proxy)')
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

class DatabaseApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    // If baseUrl is empty (dev mode with proxy), use relative URLs
    this.baseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : ''
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    // In development with proxy, use relative URLs (baseUrl is empty)
    // In production, use full URL
    const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        return {
          data: null,
          error: new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`),
        }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Network error'),
      }
    }
  }

  // Trips
  async getTrips(): Promise<{ data: any[] | null; error: Error | null }> {
    return this.request<any[]>('/api/trips')
  }

  async upsertTrip(trip: any): Promise<{ error: Error | null }> {
    const { error } = await this.request('/api/trips', {
      method: 'POST',
      body: JSON.stringify(trip),
    })
    return { error }
  }

  async deleteTrip(id: string): Promise<{ error: Error | null }> {
    const { error } = await this.request(`/api/trips/${id}`, {
      method: 'DELETE',
    })
    return { error }
  }

  // Itinerary Items
  async getItineraryItems(tripId: string): Promise<{ data: any[] | null; error: Error | null }> {
    return this.request<any[]>(`/api/trips/${tripId}/itinerary`)
  }

  async upsertItineraryItem(item: any): Promise<{ error: Error | null }> {
    const { error } = await this.request('/api/itinerary', {
      method: 'POST',
      body: JSON.stringify(item),
    })
    return { error }
  }

  async deleteItineraryItem(id: string): Promise<{ error: Error | null }> {
    const { error } = await this.request(`/api/itinerary/${id}`, {
      method: 'DELETE',
    })
    return { error }
  }

  // Expenses
  async getExpenses(tripId: string): Promise<{ data: any[] | null; error: Error | null }> {
    return this.request<any[]>(`/api/trips/${tripId}/expenses`)
  }

  async upsertExpense(expense: any): Promise<{ error: Error | null }> {
    const { error } = await this.request('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    })
    return { error }
  }

  async deleteExpense(id: string): Promise<{ error: Error | null }> {
    const { error } = await this.request(`/api/expenses/${id}`, {
      method: 'DELETE',
    })
    return { error }
  }

  // Notes
  async getNotes(tripId: string): Promise<{ data: any[] | null; error: Error | null }> {
    return this.request<any[]>(`/api/trips/${tripId}/notes`)
  }

  async upsertNote(note: any): Promise<{ error: Error | null }> {
    const { error } = await this.request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    })
    return { error }
  }

  async deleteNote(id: string): Promise<{ error: Error | null }> {
    const { error } = await this.request(`/api/notes/${id}`, {
      method: 'DELETE',
    })
    return { error }
  }
}

export const dbApi = new DatabaseApiClient(API_URL)

