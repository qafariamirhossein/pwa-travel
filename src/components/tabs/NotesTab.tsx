import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Edit2, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNoteStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import ReactMarkdown from 'react-markdown'

interface NotesTabProps {
  tripId: string
}

export default function NotesTab({ tripId }: NotesTabProps) {
  const { notes, loading, fetchNotes, createNote, updateNote, deleteNote } = useNoteStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    content: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchNotes(tripId)
  }, [tripId, fetchNotes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await updateNote(editingId, {
        content: formData.content,
        date: formData.date || undefined,
      })
      setEditingId(null)
    } else {
      await createNote({
        tripId,
        content: formData.content,
        date: formData.date || undefined,
      })
    }

    setFormData({
      content: '',
      date: new Date().toISOString().split('T')[0],
    })
    setShowForm(false)
  }

  const handleEdit = (note: typeof notes[0]) => {
    setEditingId(note.id)
    setFormData({
      content: note.content,
      date: note.date || new Date().toISOString().split('T')[0],
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      content: '',
      date: new Date().toISOString().split('T')[0],
    })
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin" />
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-1">Notes</h2>
          <p className="text-muted-foreground">Capture your thoughts and memories</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          {editingId ? 'Edit Note' : 'New Note'}
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
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {editingId ? 'Edit Note' : 'Create New Note'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Date (optional)</Label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="content">Content (Markdown supported)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  required
                  placeholder="Write your notes here... Markdown is supported!"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update Note' : 'Save Note'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
        )}
      </AnimatePresence>

      {notes.length === 0 ? (
        <Card className="glass-card border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-muted-foreground text-lg">
              No notes yet. Create your first note to capture your memories!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-border/50">
                    <div className="flex-1">
                      {note.date && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-primary">
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
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(note)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNote(note.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

