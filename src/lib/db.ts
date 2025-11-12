import localforage from 'localforage'
import type { Trip, ItineraryItem, Expense, Note, SyncQueueItem } from '@/types'

// Initialize stores with configuration
const tripsStore = localforage.createInstance({
  name: 'NomadNote',
  storeName: 'trips',
  description: 'NomadNote trips storage',
})

const itineraryStore = localforage.createInstance({
  name: 'NomadNote',
  storeName: 'itinerary',
  description: 'NomadNote itinerary storage',
})

const expensesStore = localforage.createInstance({
  name: 'NomadNote',
  storeName: 'expenses',
  description: 'NomadNote expenses storage',
})

const notesStore = localforage.createInstance({
  name: 'NomadNote',
  storeName: 'notes',
  description: 'NomadNote notes storage',
})

const syncQueueStore = localforage.createInstance({
  name: 'NomadNote',
  storeName: 'syncQueue',
  description: 'NomadNote sync queue storage',
})

// Trip operations
export const tripDB = {
  async getAll(): Promise<Trip[]> {
    const trips: Trip[] = []
    await tripsStore.iterate((value) => {
      trips.push(value as Trip)
    })
    return trips.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  async get(id: string): Promise<Trip | null> {
    return await tripsStore.getItem(id)
  },

  async set(trip: Trip): Promise<void> {
    await tripsStore.setItem(trip.id, trip)
  },

  async delete(id: string): Promise<void> {
    await tripsStore.removeItem(id)
  },
}

// Itinerary operations
export const itineraryDB = {
  async getByTrip(tripId: string): Promise<ItineraryItem[]> {
    const items: ItineraryItem[] = []
    await itineraryStore.iterate((value) => {
      const item = value as ItineraryItem
      if (item.tripId === tripId) {
        items.push(item)
      }
    })
    return items.sort((a, b) => a.order - b.order)
  },

  async set(item: ItineraryItem): Promise<void> {
    await itineraryStore.setItem(item.id, item)
  },

  async delete(id: string): Promise<void> {
    await itineraryStore.removeItem(id)
  },

  async deleteByTrip(tripId: string): Promise<void> {
    const items = await this.getByTrip(tripId)
    await Promise.all(items.map((item) => itineraryStore.removeItem(item.id)))
  },
}

// Expense operations
export const expenseDB = {
  async getByTrip(tripId: string): Promise<Expense[]> {
    const expenses: Expense[] = []
    await expensesStore.iterate((value) => {
      const expense = value as Expense
      if (expense.tripId === tripId) {
        expenses.push(expense)
      }
    })
    return expenses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async set(expense: Expense): Promise<void> {
    await expensesStore.setItem(expense.id, expense)
  },

  async delete(id: string): Promise<void> {
    await expensesStore.removeItem(id)
  },

  async deleteByTrip(tripId: string): Promise<void> {
    const expenses = await this.getByTrip(tripId)
    await Promise.all(expenses.map((expense) => expensesStore.removeItem(expense.id)))
  },
}

// Note operations
export const noteDB = {
  async getByTrip(tripId: string): Promise<Note[]> {
    const notes: Note[] = []
    await notesStore.iterate((value) => {
      const note = value as Note
      if (note.tripId === tripId) {
        notes.push(note)
      }
    })
    return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  async set(note: Note): Promise<void> {
    await notesStore.setItem(note.id, note)
  },

  async delete(id: string): Promise<void> {
    await notesStore.removeItem(id)
  },

  async deleteByTrip(tripId: string): Promise<void> {
    const notes = await this.getByTrip(tripId)
    await Promise.all(notes.map((note) => notesStore.removeItem(note.id)))
  },
}

// Sync queue operations
export const syncQueueDB = {
  async getAll(): Promise<SyncQueueItem[]> {
    const items: SyncQueueItem[] = []
    await syncQueueStore.iterate((value) => {
      items.push(value as SyncQueueItem)
    })
    return items.sort((a, b) => a.timestamp - b.timestamp)
  },

  async add(item: SyncQueueItem): Promise<void> {
    await syncQueueStore.setItem(item.id, item)
  },

  async remove(id: string): Promise<void> {
    await syncQueueStore.removeItem(id)
  },

  async clear(): Promise<void> {
    await syncQueueStore.clear()
  },
}

