import { useState, useEffect } from 'react'
import { Plus, Clock, MapPin, Trash2 } from 'lucide-react'
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
    return <div>Loading itinerary...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Itinerary</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
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
      )}

      {Object.keys(groupedItems).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No activities yet. Add your first activity!</p>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          {Object.entries(groupedItems)
            .sort()
            .map(([date, dayItems]) => (
              <div key={date} className="space-y-2">
                <h3 className="text-lg font-semibold mb-2">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <Droppable droppableId={date}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {dayItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div {...provided.dragHandleProps} className="cursor-grab">
                                        ⋮⋮
                                      </div>
                                      <h4 className="font-semibold">{item.title}</h4>
                                    </div>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                      {item.time && (
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-3 w-3" />
                                          {item.time}
                                        </div>
                                      )}
                                      {item.location && (
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-3 w-3" />
                                          {item.location}
                                        </div>
                                      )}
                                      {item.notes && <p className="mt-2">{item.notes}</p>}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteItem(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
        </DragDropContext>
      )}
    </div>
  )
}

