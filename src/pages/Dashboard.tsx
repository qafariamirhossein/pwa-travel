import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTripStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default function Dashboard() {
  const { trips, loading, fetchTrips } = useTripStore()

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading trips...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Trips</h1>
          <p className="text-muted-foreground mt-1">Plan and manage your adventures</p>
        </div>
        <Link to="/new-trip">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent>
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
            <p className="text-muted-foreground mb-6">
              Start planning your next adventure by creating your first trip!
            </p>
            <Link to="/new-trip">
              <Button>Create Your First Trip</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/trip/${trip.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg overflow-hidden">
                    {trip.coverPhoto ? (
                      <img
                        src={trip.coverPhoto}
                        alt={trip.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{trip.name}</h3>
                    <p className="text-muted-foreground mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {trip.destination}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

