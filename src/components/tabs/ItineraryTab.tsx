import { useState, useEffect } from 'react'
import { Plus, Clock, MapPin, Trash2, GripVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useItineraryStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { generateId } from '@/lib/utils'
import type { ItineraryItem } from '@/types'

interface ItineraryTabProps {
  tripId: string
}

export default function ItineraryTab({ tripId }: ItineraryTabProps) {
  const { items, loading, fetchItems, createItem, updateItem, deleteItem, reorderItems } =
    useItineraryStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    title: '',
    location: '',
    notes: '',
  })

  useEffect(() => {
    fetchItems(tripId)
  }, [tripId, fetchItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const existingItems = items.filter((item) => item.date === formData.date)
    const order = existingItems.length

    await createItem({
      tripId,
      ...formData,
      order,
    })

    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: '',
      title: '',
      location: '',
      notes: '',
    })
    setShowForm(false)
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const reorderedItems = Array.from(items)
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1)
    reorderedItems.splice(result.destination.index, 0, reorderedItem)

    // Update order based on new positions
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index,
    }))

    await reorderItems(updatedItems)
  }

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = []
    }
    acc[item.date].push(item)
    return acc
  }, {} as Record<string, ItineraryItem[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin" />
          <p className="text-muted-foreground">Loading itinerary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-1">Itinerary</h2>
          <p className="text-muted-foreground">Plan your daily activities and adventures</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Add Activity
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass-card border-2">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Add New Activity</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time (optional)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Visit Eiffel Tower"
                />
              </div>

              <div>
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Paris, France"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Activity</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
        )}
      </AnimatePresence>

      {Object.keys(groupedItems).length === 0 ? (
        <Card className="glass-card border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-muted-foreground text-lg">
              No activities yet. Add your first activity to start planning!
            </p>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-8">
            {Object.entries(groupedItems)
              .sort()
              .map(([date, dayItems]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-12 bg-gradient-to-r from-primary to-purple-500 rounded-full" />
                    <h3 className="text-xl font-bold">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="flex-1 h-1 bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {dayItems.length} {dayItems.length === 1 ? 'activity' : 'activities'}
                    </span>
                  </div>
                  <Droppable droppableId={date}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-3 transition-all ${
                          snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg p-2' : ''
                        }`}
                      >
                        {dayItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                  scale: snapshot.isDragging ? 1.02 : 1,
                                }}
                                whileHover={{ scale: 1.01 }}
                              >
                                <Card
                                  className={`hover:shadow-lg transition-all duration-200 border-l-4 ${
                                    index % 4 === 0
                                      ? 'border-l-blue-500'
                                      : index % 4 === 1
                                      ? 'border-l-purple-500'
                                      : index % 4 === 2
                                      ? 'border-l-pink-500'
                                      : 'border-l-cyan-500'
                                  } ${snapshot.isDragging ? 'shadow-2xl' : ''}`}
                                >
                                  <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        <GripVertical className="h-5 w-5" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-bold text-lg mb-3">{item.title}</h4>
                                        <div className="space-y-2 text-sm">
                                          {item.time && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                              <Clock className="h-4 w-4 text-primary" />
                                              <span className="font-medium">{item.time}</span>
                                            </div>
                                          )}
                                          {item.location && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                              <MapPin className="h-4 w-4 text-primary" />
                                              <span>{item.location}</span>
                                            </div>
                                          )}
                                          {item.notes && (
                                            <p className="mt-3 text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                              {item.notes}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteItem(item.id)}
                                        className="hover:bg-destructive/10 hover:text-destructive shrink-0"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </motion.div>
              ))}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}

