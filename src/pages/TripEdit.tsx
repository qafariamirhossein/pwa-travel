import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plane, MapPin, Calendar, Image as ImageIcon, ArrowLeft } from 'lucide-react'
import { useTripStore } from '@/store/useTripStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TripEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTrip, updateTrip } = useTripStore()
  const [loading, setLoading] = useState(false)
  const trip = id ? getTrip(id) : null

  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    coverPhoto: '',
  })

  useEffect(() => {
    if (trip) {
      setFormData({
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate.split('T')[0],
        endDate: trip.endDate.split('T')[0],
        coverPhoto: trip.coverPhoto || '',
      })
    }
  }, [trip])

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Trip not found</div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateTrip(id!, {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      })
      navigate(`/trip/${id}`)
    } catch (error) {
      console.error('Error updating trip:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(`/trip/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-bold gradient-text mb-2">Edit Trip</h1>
        <p className="text-muted-foreground text-lg">
          Update your trip details
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
              Trip Details
            </CardTitle>
            <CardDescription>
              Update the information about your trip
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                  <Plane className="h-4 w-4 text-primary" />
                  Trip Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Summer in Europe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Destination
                </Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                  placeholder="e.g., Paris, France"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverPhoto" className="text-base font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Cover Photo URL (optional)
                </Label>
                <Input
                  id="coverPhoto"
                  type="url"
                  value={formData.coverPhoto}
                  onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                />
                <p className="text-xs text-muted-foreground">
                  Add a beautiful cover image for your trip. You can use Unsplash or any image URL.
                </p>
                {formData.coverPhoto && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 rounded-lg overflow-hidden border-2 border-border"
                  >
                    <img
                      src={formData.coverPhoto}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23ddd" width="400" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not found%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} size="lg" className="flex-1">
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/trip/${id}`)}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

