import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Plane, MapPin, Calendar, Image as ImageIcon } from 'lucide-react'
import { useTripStore, useItineraryStore, useExpenseStore, useNoteStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { generateId } from '@/lib/utils'

// Beautiful sample travel images from Unsplash
const sampleTrips = [
  {
    name: 'Summer in Paris',
    destination: 'Paris, France',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop',
    itinerary: [
      { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '10:00', title: 'Arrive at CDG Airport', location: 'Charles de Gaulle Airport', notes: 'Pick up rental car, check into hotel' },
      { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '14:00', title: 'Visit Eiffel Tower', location: 'Champ de Mars, Paris', notes: 'Book tickets in advance, best views at sunset' },
      { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '19:00', title: 'Dinner at Le Comptoir', location: '5th Arrondissement', notes: 'Traditional French cuisine' },
      { date: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '09:00', title: 'Louvre Museum Tour', location: 'Musée du Louvre', notes: 'See Mona Lisa and Venus de Milo' },
      { date: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '15:00', title: 'Seine River Cruise', location: 'Seine River', notes: 'Beautiful views of Paris landmarks' },
      { date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '10:00', title: 'Versailles Palace Day Trip', location: 'Versailles', notes: 'Full day tour, bring comfortable shoes' },
    ],
    expenses: [
      { category: 'Transport', amount: 850, currency: 'USD', note: 'Round trip flights' },
      { category: 'Lodging', amount: 1200, currency: 'USD', note: '7 nights hotel' },
      { category: 'Food', amount: 450, currency: 'USD', note: 'Restaurants and cafes' },
      { category: 'Activities', amount: 280, currency: 'USD', note: 'Museum tickets and tours' },
    ],
    notes: [
      { content: '**Must-see places:**\n- Eiffel Tower at sunset\n- Louvre Museum (book skip-the-line tickets)\n- Notre-Dame Cathedral\n- Montmartre neighborhood\n\n**Food recommendations:**\n- Croissants from Du Pain et des Idées\n- Macarons from Ladurée\n- Baguette sandwiches from local boulangeries' },
      { content: '**Packing list:**\n- Comfortable walking shoes (lots of walking!)\n- Light jacket for evenings\n- Universal adapter for electronics\n- Camera for photos\n- Phrasebook or translation app' },
    ],
  },
  {
    name: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
    endDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    coverPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=800&fit=crop',
    itinerary: [
      { date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '08:00', title: 'Arrive at Narita Airport', location: 'Narita International Airport', notes: 'Take N\'EX train to Tokyo Station' },
      { date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '14:00', title: 'Shibuya Crossing', location: 'Shibuya, Tokyo', notes: 'World\'s busiest intersection' },
      { date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '18:00', title: 'Sushi Dinner', location: 'Tsukiji Outer Market', notes: 'Fresh sushi experience' },
      { date: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '09:00', title: 'Senso-ji Temple', location: 'Asakusa, Tokyo', notes: 'Tokyo\'s oldest temple' },
      { date: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '15:00', title: 'Harajuku Shopping', location: 'Harajuku, Tokyo', notes: 'Unique fashion and street food' },
      { date: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '10:00', title: 'Mount Fuji Day Trip', location: 'Fuji Five Lakes', notes: 'Full day tour, weather permitting' },
    ],
    expenses: [
      { category: 'Transport', amount: 1200, currency: 'USD', note: 'Round trip flights' },
      { category: 'Lodging', amount: 980, currency: 'USD', note: '7 nights ryokan' },
      { category: 'Food', amount: 520, currency: 'USD', note: 'Sushi, ramen, and local cuisine' },
      { category: 'Activities', amount: 350, currency: 'USD', note: 'Temples, tours, and experiences' },
      { category: 'Shopping', amount: 400, currency: 'USD', note: 'Souvenirs and gifts' },
    ],
    notes: [
      { content: '**Cultural tips:**\n- Bow when greeting\n- Remove shoes indoors\n- Cash is preferred (many places don\'t accept cards)\n- Learn basic Japanese phrases\n- Be quiet on trains\n\n**Must-try foods:**\n- Ramen from Ichiran\n- Sushi from Tsukiji\n- Takoyaki (octopus balls)\n- Matcha desserts' },
      { content: '**JR Pass:**\nConsider getting a Japan Rail Pass if traveling outside Tokyo. It\'s only available for tourists and must be purchased before arriving in Japan.' },
    ],
  },
  {
    name: 'Santorini Sunset',
    destination: 'Santorini, Greece',
    startDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    endDate: new Date(Date.now() + 97 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    coverPhoto: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200&h=800&fit=crop',
    itinerary: [
      { date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '12:00', title: 'Arrive at Santorini Airport', location: 'Santorini Airport', notes: 'Transfer to Oia hotel' },
      { date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '18:00', title: 'Sunset in Oia', location: 'Oia, Santorini', notes: 'Famous sunset spot, arrive early' },
      { date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '20:00', title: 'Dinner with Caldera View', location: 'Oia, Santorini', notes: 'Romantic dinner overlooking the caldera' },
      { date: new Date(Date.now() + 91 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '09:00', title: 'Wine Tasting Tour', location: 'Santorini Wineries', notes: 'Visit 3 local wineries' },
      { date: new Date(Date.now() + 91 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '15:00', title: 'Red Beach', location: 'Akrotiri, Santorini', notes: 'Unique red sand beach' },
      { date: new Date(Date.now() + 92 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '10:00', title: 'Ancient Akrotiri', location: 'Akrotiri Archaeological Site', notes: 'Minoan Bronze Age settlement' },
      { date: new Date(Date.now() + 92 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '14:00', title: 'Black Sand Beach', location: 'Perissa Beach', notes: 'Relax and swim' },
    ],
    expenses: [
      { category: 'Transport', amount: 1100, currency: 'USD', note: 'Round trip flights' },
      { category: 'Lodging', amount: 1400, currency: 'USD', note: '7 nights with caldera view' },
      { category: 'Food', amount: 680, currency: 'USD', note: 'Greek cuisine and seafood' },
      { category: 'Activities', amount: 250, currency: 'USD', note: 'Wine tours and boat trips' },
    ],
    notes: [
      { content: '**Best sunset spots:**\n- Oia Castle (most popular, arrive 2 hours early)\n- Imerovigli (less crowded)\n- Fira (good alternative)\n\n**Local specialties:**\n- Fava (yellow split pea puree)\n- Tomatokeftedes (tomato fritters)\n- Fresh seafood\n- Assyrtiko wine' },
      { content: '**Photography tips:**\n- Golden hour is 6-8 PM\n- Blue domes in Oia are iconic\n- White buildings make great backgrounds\n- Bring a tripod for sunset photos\n\n**What to pack:**\n- Sunscreen (very strong sun)\n- Comfortable sandals\n- Light clothing\n- Camera with extra batteries' },
    ],
  },
  {
    name: 'Iceland Road Trip',
    destination: 'Reykjavik, Iceland',
    startDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days from now
    endDate: new Date(Date.now() + 130 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    coverPhoto: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&h=800&fit=crop',
    itinerary: [
      { date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '06:00', title: 'Arrive at Keflavik Airport', location: 'Keflavik Airport', notes: 'Pick up rental 4x4 vehicle' },
      { date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '10:00', title: 'Blue Lagoon', location: 'Grindavik', notes: 'Relax in geothermal spa' },
      { date: new Date(Date.now() + 121 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '08:00', title: 'Golden Circle Tour', location: 'Thingvellir, Geysir, Gullfoss', notes: 'Full day tour of iconic sites' },
      { date: new Date(Date.now() + 122 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '09:00', title: 'Start Ring Road', location: 'Route 1', notes: 'Begin 10-day road trip' },
      { date: new Date(Date.now() + 123 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '10:00', title: 'Jökulsárlón Glacier Lagoon', location: 'Vatnajökull National Park', notes: 'Icebergs and seals' },
      { date: new Date(Date.now() + 125 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '22:00', title: 'Northern Lights Hunt', location: 'Akureyri', notes: 'Best viewing in winter months' },
    ],
    expenses: [
      { category: 'Transport', amount: 800, currency: 'USD', note: 'Round trip flights' },
      { category: 'Transport', amount: 1200, currency: 'USD', note: '10-day car rental (4x4)' },
      { category: 'Lodging', amount: 1500, currency: 'USD', note: '10 nights hotels/guesthouses' },
      { category: 'Food', amount: 600, currency: 'USD', note: 'Restaurants and groceries' },
      { category: 'Activities', amount: 450, currency: 'USD', note: 'Blue Lagoon, tours, entrance fees' },
    ],
    notes: [
      { content: '**Ring Road highlights:**\n- Golden Circle (Thingvellir, Geysir, Gullfoss)\n- Jökulsárlón Glacier Lagoon\n- Diamond Beach\n- Dettifoss Waterfall\n- Myvatn Geothermal Area\n- Akureyri (capital of the north)\n\n**Weather:**\n- Very unpredictable, check forecasts daily\n- Pack layers (can be cold even in summer)\n- Wind can be very strong' },
      { content: '**Northern Lights:**\n- Best seen September to March\n- Need clear, dark skies\n- Check aurora forecast apps\n- Get away from city lights\n- Be patient, may need multiple attempts\n\n**Driving tips:**\n- Drive carefully, roads can be icy\n- Fill up gas whenever possible (stations are sparse)\n- Download offline maps\n- Watch for sheep on roads' },
    ],
  },
  {
    name: 'Bali Paradise',
    destination: 'Bali, Indonesia',
    startDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 150 days from now
    endDate: new Date(Date.now() + 160 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    coverPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=800&fit=crop',
    itinerary: [
      { date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '14:00', title: 'Arrive at Denpasar Airport', location: 'Ngurah Rai Airport', notes: 'Transfer to Ubud hotel' },
      { date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '18:00', title: 'Ubud Monkey Forest', location: 'Ubud, Bali', notes: 'See long-tailed macaques' },
      { date: new Date(Date.now() + 151 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '06:00', title: 'Sunrise at Mount Batur', location: 'Mount Batur', notes: 'Early morning hike, bring headlamp' },
      { date: new Date(Date.now() + 152 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '09:00', title: 'Tegalalang Rice Terraces', location: 'Tegalalang, Ubud', notes: 'Iconic rice terraces, great for photos' },
      { date: new Date(Date.now() + 153 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '10:00', title: 'Waterfall Tour', location: 'Tegenungan, Kanto Lampo', notes: 'Visit multiple waterfalls' },
      { date: new Date(Date.now() + 154 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '08:00', title: 'Move to Seminyak', location: 'Seminyak, Bali', notes: 'Beach area, great for surfing' },
      { date: new Date(Date.now() + 155 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '09:00', title: 'Beach Day', location: 'Seminyak Beach', notes: 'Relax, surf, or take a yoga class' },
    ],
    expenses: [
      { category: 'Transport', amount: 950, currency: 'USD', note: 'Round trip flights' },
      { category: 'Lodging', amount: 800, currency: 'USD', note: '10 nights (mix of hotels and villas)' },
      { category: 'Food', amount: 350, currency: 'USD', note: 'Local warungs and restaurants' },
      { category: 'Activities', amount: 280, currency: 'USD', note: 'Tours, entrance fees, activities' },
    ],
    notes: [
      { content: '**Must-visit places:**\n- Ubud (cultural heart, rice terraces)\n- Seminyak (beaches, nightlife)\n- Canggu (surfing, cafes)\n- Tanah Lot Temple (sea temple)\n- Uluwatu Temple (cliffside temple)\n\n**Local food:**\n- Nasi Goreng (fried rice)\n- Mie Goreng (fried noodles)\n- Babi Guling (suckling pig)\n- Fresh fruit smoothies\n- Bintang beer' },
      { content: '**Cultural etiquette:**\n- Dress modestly when visiting temples\n- Remove shoes before entering temples\n- Don\'t point with your index finger\n- Use your right hand for giving/receiving\n- Be respectful of local customs\n\n**What to pack:**\n- Light, breathable clothing\n- Swimwear\n- Sunscreen and insect repellent\n- Comfortable sandals\n- Sarong for temple visits' },
    ],
  },
]

interface SampleDataSeederProps {
  onComplete?: () => void
}

export default function SampleDataSeeder({ onComplete }: SampleDataSeederProps) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const createTrip = useTripStore((state) => state.createTrip)
  const createItem = useItineraryStore((state) => state.createItem)
  const createExpense = useExpenseStore((state) => state.createExpense)
  const createNote = useNoteStore((state) => state.createNote)

  const handleSeedData = async () => {
    setLoading(true)
    setProgress(0)

    try {
      const totalSteps = sampleTrips.length * 4 // trips + itinerary + expenses + notes
      let currentStep = 0

      for (const tripData of sampleTrips) {
        // Create trip
        const trip = await createTrip({
          name: tripData.name,
          destination: tripData.destination,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          coverPhoto: tripData.coverPhoto,
        })
        currentStep++
        setProgress((currentStep / totalSteps) * 100)

        // Create itinerary items
        for (let i = 0; i < tripData.itinerary.length; i++) {
          const item = tripData.itinerary[i]
          await createItem({
            tripId: trip.id,
            date: item.date,
            time: item.time,
            title: item.title,
            location: item.location,
            notes: item.notes,
            order: i,
          })
        }
        currentStep++
        setProgress((currentStep / totalSteps) * 100)

        // Create expenses
        for (const expense of tripData.expenses) {
          await createExpense({
            tripId: trip.id,
            category: expense.category,
            amount: expense.amount,
            currency: expense.currency,
            note: expense.note,
          })
        }
        currentStep++
        setProgress((currentStep / totalSteps) * 100)

        // Create notes
        for (const note of tripData.notes) {
          await createNote({
            tripId: trip.id,
            content: note.content,
          })
        }
        currentStep++
        setProgress((currentStep / totalSteps) * 100)
      }

      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Error seeding sample data:', error)
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <Card className="glass-card border-2 border-dashed border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-purple-500" />
              </div>
            </div>
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold gradient-text">Explore Sample Trips</h3>
            <p className="text-muted-foreground text-lg">
              Add beautiful sample trips with images, itineraries, expenses, and notes to see the app in action!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
            {sampleTrips.map((trip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="relative h-32 rounded-lg overflow-hidden border-2 border-border/50 group-hover:border-primary/50 transition-all">
                  <img
                    src={trip.coverPhoto}
                    alt={trip.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white font-bold text-sm drop-shadow-lg">{trip.name}</p>
                    <p className="text-white/90 text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {trip.destination}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {loading && (
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Creating sample trips... {Math.round(progress)}%
              </p>
            </div>
          )}

          <Button
            onClick={handleSeedData}
            disabled={loading}
            size="lg"
            className="w-full md:w-auto min-w-[200px]"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Adding Sample Data...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Add Sample Trips
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            This will add {sampleTrips.length} sample trips with complete itineraries, expenses, and notes
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

