import { dbApi } from './db-api'
import { tripDB, itineraryDB, expenseDB, noteDB, syncQueueDB } from './db'
import type { Trip, ItineraryItem, Expense, Note, SyncQueueItem } from '@/types'
import { generateId } from './utils'

export class SyncManager {
  private isSyncing = false

  async syncAll(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) {
      return
    }

    // Check if API URL is configured
    const apiUrl = import.meta.env.VITE_API_URL
    if (!apiUrl) {
      console.log('API URL not configured. Running in offline mode only.')
      return
    }

    this.isSyncing = true

    try {
      // Process sync queue
      await this.processSyncQueue()

      // Sync trips
      await this.syncTrips()

      // Sync itinerary items
      await this.syncItineraryItems()

      // Sync expenses
      await this.syncExpenses()

      // Sync notes
      await this.syncNotes()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      this.isSyncing = false
    }
  }

  private async processSyncQueue(): Promise<void> {
    const queue = await syncQueueDB.getAll()

    for (const item of queue) {
      try {
        switch (item.type) {
          case 'trip':
            await this.syncTripQueueItem(item)
            break
          case 'itinerary':
            await this.syncItineraryQueueItem(item)
            break
          case 'expense':
            await this.syncExpenseQueueItem(item)
            break
          case 'note':
            await this.syncNoteQueueItem(item)
            break
        }
        await syncQueueDB.remove(item.id)
      } catch (error) {
        console.error(`Failed to sync queue item ${item.id}:`, error)
      }
    }
  }

  private async syncTripQueueItem(item: SyncQueueItem): Promise<void> {
    const { data, action } = item

    if (action === 'create' || action === 'update') {
      const { error } = await dbApi.upsertTrip(data)

      if (!error) {
        await tripDB.set(data)
      } else {
        throw error
      }
    } else if (action === 'delete') {
      const { error } = await dbApi.deleteTrip(data.id)
      if (!error) {
        await tripDB.delete(data.id)
      } else {
        throw error
      }
    }
  }

  private async syncItineraryQueueItem(item: SyncQueueItem): Promise<void> {
    const { data, action } = item

    if (action === 'create' || action === 'update') {
      const { error } = await dbApi.upsertItineraryItem(data)

      if (!error) {
        await itineraryDB.set(data)
      } else {
        throw error
      }
    } else if (action === 'delete') {
      const { error } = await dbApi.deleteItineraryItem(data.id)
      if (!error) {
        await itineraryDB.delete(data.id)
      } else {
        throw error
      }
    }
  }

  private async syncExpenseQueueItem(item: SyncQueueItem): Promise<void> {
    const { data, action } = item

    if (action === 'create' || action === 'update') {
      const { error } = await dbApi.upsertExpense(data)

      if (!error) {
        await expenseDB.set(data)
      } else {
        throw error
      }
    } else if (action === 'delete') {
      const { error } = await dbApi.deleteExpense(data.id)
      if (!error) {
        await expenseDB.delete(data.id)
      } else {
        throw error
      }
    }
  }

  private async syncNoteQueueItem(item: SyncQueueItem): Promise<void> {
    const { data, action } = item

    if (action === 'create' || action === 'update') {
      const { error } = await dbApi.upsertNote(data)

      if (!error) {
        await noteDB.set(data)
      } else {
        throw error
      }
    } else if (action === 'delete') {
      const { error } = await dbApi.deleteNote(data.id)
      if (!error) {
        await noteDB.delete(data.id)
      } else {
        throw error
      }
    }
  }

  private async syncTrips(): Promise<void> {
    const { data, error } = await dbApi.getTrips()

    if (error) {
      console.error('Error syncing trips:', error)
      return
    }

    if (data) {
      for (const trip of data) {
        await tripDB.set(trip as Trip)
      }
    }
  }

  private async syncItineraryItems(): Promise<void> {
    const trips = await tripDB.getAll()
    for (const trip of trips) {
      const { data, error } = await dbApi.getItineraryItems(trip.id)

      if (error) {
        console.error('Error syncing itinerary items:', error)
        continue
      }

      if (data) {
        for (const item of data) {
          await itineraryDB.set(item as ItineraryItem)
        }
      }
    }
  }

  private async syncExpenses(): Promise<void> {
    const trips = await tripDB.getAll()
    for (const trip of trips) {
      const { data, error } = await dbApi.getExpenses(trip.id)

      if (error) {
        console.error('Error syncing expenses:', error)
        continue
      }

      if (data) {
        for (const expense of data) {
          await expenseDB.set(expense as Expense)
        }
      }
    }
  }

  private async syncNotes(): Promise<void> {
    const trips = await tripDB.getAll()
    for (const trip of trips) {
      const { data, error } = await dbApi.getNotes(trip.id)

      if (error) {
        console.error('Error syncing notes:', error)
        continue
      }

      if (data) {
        for (const note of data) {
          await noteDB.set(note as Note)
        }
      }
    }
  }

  async queueSync(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<void> {
    const queueItem: SyncQueueItem = {
      ...item,
      id: generateId(),
      timestamp: Date.now(),
    }
    await syncQueueDB.add(queueItem)
  }
}

export const syncManager = new SyncManager()

