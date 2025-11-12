import { create } from 'zustand'
import { tripDB, itineraryDB, expenseDB, noteDB } from '@/lib/db'
import { syncManager } from '@/lib/sync'
import { generateId } from '@/lib/utils'
import type { Trip, ItineraryItem, Expense, Note } from '@/types'

interface TripStore {
  trips: Trip[]
  loading: boolean
  fetchTrips: () => Promise<void>
  createTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Trip>
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>
  deleteTrip: (id: string) => Promise<void>
  getTrip: (id: string) => Trip | undefined
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  loading: false,

  fetchTrips: async () => {
    set({ loading: true })
    try {
      const trips = await tripDB.getAll()
      set({ trips, loading: false })
    } catch (error) {
      console.error('Error fetching trips:', error)
      set({ loading: false })
    }
  },

  createTrip: async (tripData) => {
    const now = new Date().toISOString()
    const trip: Trip = {
      ...tripData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }

    await tripDB.set(trip)
    set((state) => ({ trips: [trip, ...state.trips] }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'trip',
        action: 'create',
        data: trip,
      })
      await syncManager.syncAll()
    }

    return trip
  },

  updateTrip: async (id, updates) => {
    const trip = get().trips.find((t) => t.id === id)
    if (!trip) return

    const updated: Trip = {
      ...trip,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await tripDB.set(updated)
    set((state) => ({
      trips: state.trips.map((t) => (t.id === id ? updated : t)),
    }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'trip',
        action: 'update',
        data: updated,
      })
      await syncManager.syncAll()
    }
  },

  deleteTrip: async (id) => {
    await tripDB.delete(id)
    await itineraryDB.deleteByTrip(id)
    await expenseDB.deleteByTrip(id)
    await noteDB.deleteByTrip(id)

    set((state) => ({
      trips: state.trips.filter((t) => t.id !== id),
    }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'trip',
        action: 'delete',
        data: { id },
      })
      await syncManager.syncAll()
    }
  },

  getTrip: (id) => {
    return get().trips.find((t) => t.id === id)
  },
}))

interface ItineraryStore {
  items: ItineraryItem[]
  loading: boolean
  fetchItems: (tripId: string) => Promise<void>
  createItem: (item: Omit<ItineraryItem, 'id'>) => Promise<ItineraryItem>
  updateItem: (id: string, updates: Partial<ItineraryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  reorderItems: (items: ItineraryItem[]) => Promise<void>
}

export const useItineraryStore = create<ItineraryStore>((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async (tripId) => {
    set({ loading: true })
    try {
      const items = await itineraryDB.getByTrip(tripId)
      set({ items, loading: false })
    } catch (error) {
      console.error('Error fetching itinerary items:', error)
      set({ loading: false })
    }
  },

  createItem: async (itemData) => {
    const item: ItineraryItem = {
      ...itemData,
      id: generateId(),
    }

    await itineraryDB.set(item)
    set((state) => ({ items: [...state.items, item] }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'itinerary',
        action: 'create',
        data: item,
      })
      await syncManager.syncAll()
    }

    return item
  },

  updateItem: async (id, updates) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return

    const updated: ItineraryItem = {
      ...item,
      ...updates,
    }

    await itineraryDB.set(updated)
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? updated : i)),
    }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'itinerary',
        action: 'update',
        data: updated,
      })
      await syncManager.syncAll()
    }
  },

  deleteItem: async (id) => {
    await itineraryDB.delete(id)
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'itinerary',
        action: 'delete',
        data: { id },
      })
      await syncManager.syncAll()
    }
  },

  reorderItems: async (items) => {
    await Promise.all(items.map((item, index) => {
      const updated = { ...item, order: index }
      return itineraryDB.set(updated)
    }))

    set({ items })

    // Queue sync for all updated items
    if (navigator.onLine) {
      for (const item of items) {
        await syncManager.queueSync({
          type: 'itinerary',
          action: 'update',
          data: item,
        })
      }
      await syncManager.syncAll()
    }
  },
}))

interface ExpenseStore {
  expenses: Expense[]
  loading: boolean
  fetchExpenses: (tripId: string) => Promise<void>
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  loading: false,

  fetchExpenses: async (tripId) => {
    set({ loading: true })
    try {
      const expenses = await expenseDB.getByTrip(tripId)
      set({ expenses, loading: false })
    } catch (error) {
      console.error('Error fetching expenses:', error)
      set({ loading: false })
    }
  },

  createExpense: async (expenseData) => {
    const now = new Date().toISOString()
    const expense: Expense = {
      ...expenseData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }

    await expenseDB.set(expense)
    set((state) => ({ expenses: [...state.expenses, expense] }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'expense',
        action: 'create',
        data: expense,
      })
      await syncManager.syncAll()
    }

    return expense
  },

  updateExpense: async (id, updates) => {
    const expense = get().expenses.find((e) => e.id === id)
    if (!expense) return

    const updated: Expense = {
      ...expense,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await expenseDB.set(updated)
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? updated : e)),
    }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'expense',
        action: 'update',
        data: updated,
      })
      await syncManager.syncAll()
    }
  },

  deleteExpense: async (id) => {
    await expenseDB.delete(id)
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'expense',
        action: 'delete',
        data: { id },
      })
      await syncManager.syncAll()
    }
  },
}))

interface NoteStore {
  notes: Note[]
  loading: boolean
  fetchNotes: (tripId: string) => Promise<void>
  createNote: (note: Omit<Note, 'id' | 'updatedAt' | 'createdAt'>) => Promise<Note>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  loading: false,

  fetchNotes: async (tripId) => {
    set({ loading: true })
    try {
      const notes = await noteDB.getByTrip(tripId)
      set({ notes, loading: false })
    } catch (error) {
      console.error('Error fetching notes:', error)
      set({ loading: false })
    }
  },

  createNote: async (noteData) => {
    const now = new Date().toISOString()
    const note: Note = {
      ...noteData,
      id: generateId(),
      updatedAt: now,
      createdAt: now,
    }

    await noteDB.set(note)
    set((state) => ({ notes: [...state.notes, note] }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'note',
        action: 'create',
        data: note,
      })
      await syncManager.syncAll()
    }

    return note
  },

  updateNote: async (id, updates) => {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return

    const updated: Note = {
      ...note,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await noteDB.set(updated)
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
    }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'note',
        action: 'update',
        data: updated,
      })
      await syncManager.syncAll()
    }
  },

  deleteNote: async (id) => {
    await noteDB.delete(id)
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    }))

    // Queue sync
    if (navigator.onLine) {
      await syncManager.queueSync({
        type: 'note',
        action: 'delete',
        data: { id },
      })
      await syncManager.syncAll()
    }
  },
}))

