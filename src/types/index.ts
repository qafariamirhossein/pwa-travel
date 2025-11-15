export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  coverPhoto?: string
  createdAt: string
  updatedAt: string
  userId?: string
}

export interface ItineraryItem {
  id: string
  tripId: string
  date: string
  time?: string
  title: string
  location?: string
  notes?: string
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface Expense {
  id: string
  tripId: string
  category: string
  amount: number
  currency: string
  note?: string
  createdAt: string
  updatedAt?: string
}

export interface Note {
  id: string
  tripId: string
  date?: string
  content: string
  updatedAt: string
  createdAt?: string
}

export interface SyncQueueItem {
  id: string
  type: 'trip' | 'itinerary' | 'expense' | 'note'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
}

export interface AppState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: number | null
}

export interface PackingItem {
  id: string
  tripId: string
  category: string
  name: string
  packed: boolean
  quantity?: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

