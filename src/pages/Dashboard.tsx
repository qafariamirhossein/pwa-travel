import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Calendar, Sparkles, Plane, Clock, TrendingUp, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTripStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, getDaysUntil, isOngoing, isUpcoming, formatCountdown, getDaysBetween } from '@/lib/utils'
import { TravelTips } from '@/components/TravelTips'

const gradients = [
  'from-blue-500 via-purple-500 to-pink-500',
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-orange-400 via-red-500 to-pink-500',
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-violet-500 via-purple-500 to-fuchsia-500',
  'from-rose-400 via-pink-500 to-red-500',
]

const travelQuotes = [
  "The world is a book, and those who do not travel read only one page.",
  "Travel makes one modest. You see what a tiny place you occupy in the world.",
  "Adventure is worthwhile in itself.",
  "To travel is to live.",
  "Life is either a daring adventure or nothing at all.",
  "The journey of a thousand miles begins with a single step.",
]

export default function Dashboard() {
  const { trips, loading, fetchTrips } = useTripStore()
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    ongoingTrips: 0,
    totalDays: 0,
    nextTrip: null as { trip: any; days: number } | null,
  })

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  useEffect(() => {
    // Calculate statistics
    const upcoming = trips.filter(t => isUpcoming(t.startDate))
    const ongoing = trips.filter(t => isOngoing(t.startDate, t.endDate))
    const totalDays = trips.reduce((sum, trip) => sum + getDaysBetween(trip.startDate, trip.endDate), 0)
    
    // Find next trip
    const nextTrip = upcoming
      .map(trip => ({ trip, days: getDaysUntil(trip.startDate) }))
      .sort((a, b) => a.days - b.days)[0] || null

    setStats({
      totalTrips: trips.length,
      upcomingTrips: upcoming.length,
      ongoingTrips: ongoing.length,
      totalDays: isNaN(totalDays) ? 0 : totalDays,
      nextTrip,
    })
  }, [trips])

  useEffect(() => {
    // Rotate quotes
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % travelQuotes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
            />
            <p className="text-muted-foreground">Loading your adventures...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              My Adventures
            </h1>
            <p className="text-lg text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Plan and manage your travels
            </p>
          </div>
          <Link to="/new-trip">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="w-full md:w-auto">
                <Plus className="h-5 w-5 mr-2" />
                New Trip
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Statistics & Next Trip */}
      {trips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="glass-card border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Trips</p>
                    <p className="text-3xl font-bold">{isNaN(stats.totalTrips) ? 0 : stats.totalTrips}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 border-purple-200 dark:border-purple-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                    <p className="text-3xl font-bold">{isNaN(stats.upcomingTrips) ? 0 : stats.upcomingTrips}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Plane className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 border-pink-200 dark:border-pink-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ongoing</p>
                    <p className="text-3xl font-bold">{isNaN(stats.ongoingTrips) ? 0 : stats.ongoingTrips}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Days</p>
                    <p className="text-3xl font-bold">{isNaN(stats.totalDays) ? 0 : stats.totalDays}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Trip Countdown */}
          {stats.nextTrip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass-card border-2 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
                  <CardContent className="bg-background/95 backdrop-blur-sm p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">Next Adventure</p>
                        <h3 className="text-2xl font-bold mb-2">{stats.nextTrip.trip.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {stats.nextTrip.trip.destination}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            {formatDate(stats.nextTrip.trip.startDate)}
                          </div>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-sm text-muted-foreground mb-1">Departure in</p>
                        <p className="text-4xl font-bold gradient-text">
                          {formatCountdown(stats.nextTrip.days)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Travel Quote */}
      {trips.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="glass-card border-2 border-dashed">
            <CardContent className="p-6 text-center">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg italic text-muted-foreground"
              >
                "{travelQuotes[quoteIndex]}"
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Travel Tips */}
      {trips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <TravelTips />
        </motion.div>
      )}

      {trips.length === 0 ? (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-2 border-dashed p-12 md:p-16 text-center max-w-2xl mx-auto">
              <CardContent className="space-y-6">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="inline-block"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-purple-500" />
                    </div>
                  </div>
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Start Your Journey</h3>
                  <p className="text-muted-foreground text-lg">
                    Create your first trip and begin planning your next adventure!
                  </p>
                </div>
                <Link to="/new-trip">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="mt-4">
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Trip
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Show Travel Tips even when no trips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TravelTips />
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, index) => {
            const gradient = gradients[index % gradients.length]
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/trip/${trip.id}`}>
                  <Card className="h-full overflow-hidden group cursor-pointer border-2 hover:border-primary/50 transition-all duration-300">
                    <div className={`relative h-56 bg-gradient-to-br ${gradient} overflow-hidden`}>
                      {trip.coverPhoto ? (
                        <motion.img
                          src={trip.coverPhoto}
                          alt={trip.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="h-20 w-20 text-white/80" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-1">
                          {trip.name}
                        </h3>
                        <p className="text-white/90 flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          {trip.destination}
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-6 bg-card/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </span>
                      </div>
                      <motion.div
                        className="mt-4 pt-4 border-t border-border/50"
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-sm font-semibold text-primary group-hover:underline">
                          View Details →
                        </span>
                      </motion.div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

