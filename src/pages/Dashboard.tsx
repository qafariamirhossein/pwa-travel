import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Calendar, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTripStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

const gradients = [
  'from-blue-500 via-purple-500 to-pink-500',
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-orange-400 via-red-500 to-pink-500',
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-violet-500 via-purple-500 to-fuchsia-500',
  'from-rose-400 via-pink-500 to-red-500',
]

export default function Dashboard() {
  const { trips, loading, fetchTrips } = useTripStore()

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

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

      {trips.length === 0 ? (
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

