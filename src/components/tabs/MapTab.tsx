import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useItineraryStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapTabProps {
  tripId: string
  destination: string
}

export default function MapTab({ tripId, destination }: MapTabProps) {
  const { items, fetchItems } = useItineraryStore()
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems(tripId)
  }, [tripId, fetchItems])

  useEffect(() => {
    // Geocode destination to get coordinates
    if (destination) {
      // Using Nominatim (OpenStreetMap geocoding) - free and no API key required
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)])
          }
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [destination])

  // Get unique locations from itinerary items
  const locations = items
    .filter((item) => item.location)
    .map((item) => ({
      id: item.id,
      title: item.title,
      location: item.location!,
      lat: 0,
      lon: 0,
    }))

  // Geocode locations (simplified - in production, you'd batch these)
  useEffect(() => {
    locations.forEach((loc) => {
      if (loc.location) {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc.location)}&limit=1`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.length > 0) {
              loc.lat = parseFloat(data[0].lat)
              loc.lon = parseFloat(data[0].lon)
            }
          })
          .catch(() => {})
      }
    })
  }, [items])

  if (loading) {
    return <div>Loading map...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Map View</h2>
      <Card>
        <CardContent className="p-0">
          <div className="h-[500px] w-full">
            <MapContainer
              center={center}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={center}>
                <Popup>{destination}</Popup>
              </Marker>
              {locations.map((loc) => {
                if (loc.lat && loc.lon) {
                  return (
                    <Marker key={loc.id} position={[loc.lat, loc.lon]}>
                      <Popup>{loc.title}</Popup>
                    </Marker>
                  )
                }
                return null
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {items.filter((item) => item.location).length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Add locations to your itinerary items to see them on the map.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

