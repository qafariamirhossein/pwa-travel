import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTripStore } from '@/store/useTripStore'
import { syncManager } from '@/lib/sync'
import { OnlineStatus } from '@/components/OnlineStatus'
import { BottomNav } from '@/components/BottomNav'
import Dashboard from '@/pages/Dashboard'
import TripDetail from '@/pages/TripDetail'
import TripEdit from '@/pages/TripEdit'
import NewTrip from '@/pages/NewTrip'
import Settings from '@/pages/Settings'

function App() {
  const fetchTrips = useTripStore((state) => state.fetchTrips)

  useEffect(() => {
    // Initial data load
    fetchTrips()

    // Set up online/offline listeners
    const handleOnline = () => {
      syncManager.syncAll()
    }

    window.addEventListener('online', handleOnline)

    // Periodic sync when online
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        syncManager.syncAll()
      }
    }, 30000) // Sync every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline)
      clearInterval(syncInterval)
    }
  }, [fetchTrips])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <OnlineStatus />
        <main className="pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/trip/:id/edit" element={<TripEdit />} />
            <Route path="/new-trip" element={<NewTrip />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App

