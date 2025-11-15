import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useTripStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Location {
  id: string
  tripId: string
  tripName: string
  destination: string
  lat: number
  lon: number
}

export default function MapPage() {
  const { trips, fetchTrips } = useTripStore()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  useEffect(() => {
    const loadLocations = async () => {
      setLoading(true)
      const allLocations: Location[] = []

      // Geocode all trip destinations
      for (const trip of trips) {
        if (trip.destination) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trip.destination)}&limit=1`
            )
            const data = await response.json()
            if (data.length > 0) {
              allLocations.push({
                id: trip.id,
                tripId: trip.id,
                tripName: trip.name,
                destination: trip.destination,
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
              })
            }
          } catch (error) {
            console.error(`Error geocoding ${trip.destination}:`, error)
          }
        }
      }

      setLocations(allLocations)

      // Set map center to first location or default
      if (allLocations.length > 0) {
        setCenter([allLocations[0].lat, allLocations[0].lon])
      }

      setLoading(false)
    }

    if (trips.length > 0) {
      loadLocations()
    } else {
      setLoading(false)
    }
  }, [trips])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-4xl font-bold gradient-text mb-2">All Trips Map</h1>
        <p className="text-muted-foreground">View all your trip destinations on one map</p>
      </div>

      {trips.length === 0 ? (
        <Card className="glass-card border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-muted-foreground text-lg mb-4">
              No trips yet. Create your first trip to see it on the map!
            </p>
            <Link to="/new-trip">
              <Button>Create Your First Trip</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="glass-card mb-6">
            <CardContent className="p-0">
              <div className="h-[600px] w-full">
                <MapContainer
                  center={center}
                  zoom={2}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {locations.map((loc) => (
                    <Marker key={loc.id} position={[loc.lat, loc.lon]}>
                      <Popup>
                        <div>
                          <strong>{loc.tripName}</strong>
                          <br />
                          {loc.destination}
                          <br />
                          <Link to={`/trip/${loc.tripId}`}>
                            <Button variant="link" className="p-0 h-auto mt-2">
                              View Trip →
                            </Button>
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => {
              const location = locations.find((loc) => loc.tripId === trip.id)
              return (
                <Link key={trip.id} to={`/trip/${trip.id}`}>
                  <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{trip.name}</h3>
                      <p className="text-sm text-muted-foreground">{trip.destination}</p>
                      {location && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📍 Mapped
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

