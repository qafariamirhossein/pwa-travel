import { supabase } from './supabase'
import { tripDB, itineraryDB, expenseDB, noteDB, syncQueueDB } from './db'
import type { Trip, ItineraryItem, Expense, Note, SyncQueueItem } from '@/types'
import { generateId } from './utils'

export class SyncManager {
  private isSyncing = false

  async syncAll(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) {
      return
    }

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl) {
      console.log('Supabase not configured. Running in offline mode only.')
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
      const { error } = await supabase
        .from('trips')
        .upsert(data, { onConflict: 'id' })

      if (!error) {
        await tripDB.set(data)
      } else {
        throw error
      }
    } else if (action === 'delete') {
      const { error } = await supabase.from('trips').delete().eq('id', data.id)
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
      const { error } = await supabase
        .from('itinerary_items')
        .upsert(data, { onConflict: 'id' })

      if (!error) {
        await itineraryDB.set(data)
      } else {
        throw error
      }
    } else if (action === 'delete') {
      const { error } = await supabase.from('itinerary_items').delete().eq('id', data.id)
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
      const { error } = await supabase
        .from('expenses')
        .upsert(data, { onConflict: 'id' })

      if (!error) {
        await expenseDB.set(data)
      } else {
        throw error
      }
    } else if (action === 'delete') {
      const { error } = await supabase.from('expenses').delete().eq('id', data.id)
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
      const { error } = await supabase
        .from('notes')
        .upsert(data, { onConflict: 'id' })

      if (!error) {
        await noteDB.set(data)
      } else {
        throw error
      }
    } else if (action === 'delete') {
      const { error } = await supabase.from('notes').delete().eq('id', data.id)
      if (!error) {
        await noteDB.delete(data.id)
      } else {
        throw error
      }
    }
  }

  private async syncTrips(): Promise<void> {
    const { data, error } = await supabase.from('trips').select('*').order('updated_at', { ascending: false })

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
      const { data, error } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('trip_id', trip.id)
        .order('order', { ascending: true })

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
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', trip.id)
        .order('created_at', { ascending: false })

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
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('trip_id', trip.id)
        .order('updated_at', { ascending: false })

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

