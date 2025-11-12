import { useState, useEffect } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
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
    return <div>Loading notes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Notes</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {editingId ? 'Edit Note' : 'New Note'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
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
      )}

      {notes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No notes yet. Create your first note!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {note.date && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(note.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Updated: {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

