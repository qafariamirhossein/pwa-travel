import { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOnlineMessage, setShowOnlineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOnlineMessage(true)
      setTimeout(() => setShowOnlineMessage(false), 3000)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowOnlineMessage(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-yellow-900 dark:text-yellow-100 px-4 py-3 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm"
        >
          <WifiOff className="h-5 w-5" />
          <span>You're offline. Changes will sync when you reconnect.</span>
        </motion.div>
      )}
      {isOnline && showOnlineMessage && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-green-900 dark:text-green-100 px-4 py-3 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm"
        >
          <Wifi className="h-5 w-5" />
          <span>Back online. Syncing changes...</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

