import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Edit, Trash2 } from 'lucide-react'
import { useTripStore, useItineraryStore, useExpenseStore, useNoteStore } from '@/store/useTripStore'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import ItineraryTab from '@/components/tabs/ItineraryTab'
import MapTab from '@/components/tabs/MapTab'
import BudgetTab from '@/components/tabs/BudgetTab'
import NotesTab from '@/components/tabs/NotesTab'

export default function TripDetail() {
  const { id } = useParams<{ id: string }>()
  const { getTrip, deleteTrip } = useTripStore()
  const { fetchItems } = useItineraryStore()
  const { fetchExpenses } = useExpenseStore()
  const { fetchNotes } = useNoteStore()
  const [activeTab, setActiveTab] = useState('itinerary')

  const trip = id ? getTrip(id) : null

  useEffect(() => {
    if (id) {
      fetchItems(id)
      fetchExpenses(id)
      fetchNotes(id)
    }
  }, [id, fetchItems, fetchExpenses, fetchNotes])

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Trip not found</div>
      </div>
    )
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      await deleteTrip(trip.id)
      window.location.href = '/'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="relative h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg overflow-hidden mb-4">
          {trip.coverPhoto ? (
            <img
              src={trip.coverPhoto}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">{trip.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{trip.name}</h1>
            <p className="text-muted-foreground text-lg">{trip.destination}</p>
          </div>

          <div className="flex gap-2">
            <Link to={`/trip/${trip.id}/edit`}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary">
          <ItineraryTab tripId={trip.id} />
        </TabsContent>

        <TabsContent value="map">
          <MapTab tripId={trip.id} destination={trip.destination} />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetTab tripId={trip.id} />
        </TabsContent>

        <TabsContent value="notes">
          <NotesTab tripId={trip.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

