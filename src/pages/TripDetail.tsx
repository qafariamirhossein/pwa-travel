import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Edit, Trash2, ArrowLeft, MapPin, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTripStore, useItineraryStore, useExpenseStore, useNoteStore } from '@/store/useTripStore'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ItineraryTab from '@/components/tabs/ItineraryTab'
import MapTab from '@/components/tabs/MapTab'
import BudgetTab from '@/components/tabs/BudgetTab'
import NotesTab from '@/components/tabs/NotesTab'
import PackingTab from '@/components/tabs/PackingTab'
import { WeatherWidget } from '@/components/WeatherWidget'
import { formatDate } from '@/lib/utils'

export default function TripDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Trip not found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      await deleteTrip(trip.id)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        {trip.coverPhoto ? (
          <motion.img
            src={trip.coverPhoto}
            alt={trip.name}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl">
              {trip.name}
            </h1>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 z-10"
        >
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate('/')}
            className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 z-10 flex gap-2"
        >
          <Link to={`/trip/${trip.id}/edit`}>
            <Button
              variant="secondary"
              size="icon"
              className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80"
            >
              <Edit className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            className="backdrop-blur-md"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Trip Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-semibold">{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <span>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <WeatherWidget destination={trip.destination} />
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-muted/50 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger 
              value="itinerary" 
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all text-xs md:text-sm"
            >
              Itinerary
            </TabsTrigger>
            <TabsTrigger 
              value="map"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all text-xs md:text-sm"
            >
              Map
            </TabsTrigger>
            <TabsTrigger 
              value="budget"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all text-xs md:text-sm"
            >
              Budget
            </TabsTrigger>
            <TabsTrigger 
              value="packing"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all text-xs md:text-sm"
            >
              Packing
            </TabsTrigger>
            <TabsTrigger 
              value="notes"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all text-xs md:text-sm"
            >
              Notes
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="itinerary" className="mt-0">
              <ItineraryTab tripId={trip.id} />
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <MapTab tripId={trip.id} destination={trip.destination} />
            </TabsContent>

            <TabsContent value="budget" className="mt-0">
              <BudgetTab tripId={trip.id} />
            </TabsContent>

            <TabsContent value="packing" className="mt-0">
              <PackingTab tripId={trip.id} />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <NotesTab tripId={trip.id} />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  )
}

