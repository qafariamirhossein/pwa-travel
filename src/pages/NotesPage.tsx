import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTripStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import { noteDB } from '@/lib/db'
import type { Note } from '@/types'

export default function NotesPage() {
  const { trips, fetchTrips } = useTripStore()
  const [allNotes, setAllNotes] = useState<(Note & { tripName: string; tripId: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  useEffect(() => {
    const loadAllNotes = async () => {
      setLoading(true)
      const notes: (Note & { tripName: string; tripId: string })[] = []

      // Get all notes from all trips
      for (const trip of trips) {
        const tripNotes = await noteDB.getByTrip(trip.id)
        tripNotes.forEach((note) => {
          notes.push({
            ...note,
            tripName: trip.name,
            tripId: trip.id,
          })
        })
      }

      // Sort by updated date (most recent first)
      notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

      setAllNotes(notes)
      setLoading(false)
    }

    if (trips.length > 0) {
      loadAllNotes()
    } else {
      setLoading(false)
    }
  }, [trips])

  // Group notes by trip
  const notesByTrip = trips.map((trip) => {
    const tripNotes = allNotes.filter((n) => n.tripId === trip.id)
    return {
      trip,
      notes: tripNotes,
    }
  }).filter((item) => item.notes.length > 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin" />
            <p className="text-muted-foreground">Loading notes...</p>
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
        <h1 className="text-4xl font-bold gradient-text mb-2">All Notes</h1>
        <p className="text-muted-foreground">View all your notes from all trips</p>
      </div>

      {allNotes.length === 0 ? (
        <Card className="glass-card border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-muted-foreground text-lg mb-4">
              No notes yet. Create notes in your trips to see them here!
            </p>
            <Link to="/">
              <Button>View Trips</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <Card className="glass-card mb-8 border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Notes</div>
                  <div className="text-3xl font-bold">{allNotes.length}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Across Trips</div>
                  <div className="text-3xl font-bold">{notesByTrip.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Notes (Recent First) */}
          <div className="space-y-6 mb-8">
            <h3 className="text-2xl font-bold">Recent Notes</h3>
            <div className="space-y-4">
              {allNotes.slice(0, 10).map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4 pb-4 border-b border-border/50">
                        <div className="flex-1">
                          <Link to={`/trip/${note.tripId}`}>
                            <h4 className="font-semibold text-primary hover:underline mb-2">
                              {note.tripName}
                            </h4>
                          </Link>
                          {note.date && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-muted-foreground">
                                {new Date(note.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Last updated: {new Date(note.updatedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <Link to={`/trip/${note.tripId}`}>
                          <Button variant="outline" size="sm">
                            View Trip →
                          </Button>
                        </Link>
                      </div>
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary">
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Notes by Trip */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Notes by Trip</h3>
            {notesByTrip.length === 0 ? (
              <Card className="glass-card border-2 border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No notes recorded yet
                </CardContent>
              </Card>
            ) : (
              notesByTrip.map((item, index) => (
                <motion.div
                  key={item.trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Link to={`/trip/${item.trip.id}`}>
                            <h4 className="text-xl font-bold hover:text-primary transition-colors">
                              {item.trip.name}
                            </h4>
                          </Link>
                          <p className="text-sm text-muted-foreground">{item.trip.destination}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{item.notes.length}</div>
                          <p className="text-xs text-muted-foreground">
                            {item.notes.length === 1 ? 'note' : 'notes'}
                          </p>
                        </div>
                      </div>
                      <Link to={`/trip/${item.trip.id}`}>
                        <Button variant="outline" className="w-full">
                          View All Notes →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

