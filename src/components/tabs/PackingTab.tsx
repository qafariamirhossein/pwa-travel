import { useState, useEffect } from 'react'
import { Plus, Check, X, Trash2, Luggage } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { generateId } from '@/lib/utils'
import localforage from 'localforage'

interface PackingItem {
  id: string
  tripId: string
  category: string
  name: string
  packed: boolean
  quantity?: number
  notes?: string
}

const packingStore = localforage.createInstance({
  name: 'NomadNote',
  storeName: 'packing',
})

const categories = ['Clothing', 'Electronics', 'Toiletries', 'Documents', 'Accessories', 'Other']

interface PackingTabProps {
  tripId: string
}

export default function PackingTab({ tripId }: PackingTabProps) {
  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: 'Clothing',
    name: '',
    quantity: 1,
    notes: '',
  })

  useEffect(() => {
    loadItems()
  }, [tripId])

  const loadItems = async () => {
    setLoading(true)
    try {
      const allItems: PackingItem[] = []
      await packingStore.iterate((value) => {
        const item = value as PackingItem
        if (item.tripId === tripId) {
          allItems.push(item)
        }
      })
      setItems(allItems.sort((a, b) => a.category.localeCompare(b.category)))
    } catch (error) {
      console.error('Error loading packing items:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveItem = async (item: PackingItem) => {
    await packingStore.setItem(item.id, item)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newItem: PackingItem = {
      id: generateId(),
      tripId,
      category: formData.category,
      name: formData.name,
      packed: false,
      quantity: formData.quantity,
      notes: formData.notes || undefined,
    }

    await saveItem(newItem)
    await loadItems()
    setFormData({ category: 'Clothing', name: '', quantity: 1, notes: '' })
    setShowForm(false)
  }

  const togglePacked = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    
    const updated = { ...item, packed: !item.packed }
    await saveItem(updated)
    await loadItems()
  }

  const deleteItem = async (id: string) => {
    await packingStore.removeItem(id)
    await loadItems()
  }

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, PackingItem[]>)

  const totalItems = items.length
  const packedItems = items.filter(i => i.packed).length
  const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin" />
          <p className="text-muted-foreground">Loading packing list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-1">Packing List</h2>
          <p className="text-muted-foreground">Don't forget anything important</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Progress Card */}
      {totalItems > 0 && (
        <Card className="glass-card border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Luggage className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Packing Progress</p>
                  <p className="text-2xl font-bold">
                    {packedItems} / {totalItems} items
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold gradient-text">{Math.round(progress)}%</p>
              </div>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass-card border-2">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Add New Item</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., Passport, Charger, T-Shirt"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g., Don't forget!"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">Add Item</Button>
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
            <div className="text-6xl mb-4">🧳</div>
            <p className="text-muted-foreground text-lg">
              No items yet. Start adding items to your packing list!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-8 bg-gradient-to-r from-primary to-purple-500 rounded-full" />
                <h3 className="text-xl font-bold">{category}</h3>
                <Badge variant="secondary">{categoryItems.length}</Badge>
              </div>
              <div className="space-y-2">
                {categoryItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`hover:shadow-lg transition-all duration-200 border-l-4 ${
                        item.packed
                          ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
                          : 'border-l-primary'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePacked(item.id)}
                            className={`shrink-0 ${
                              item.packed
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : ''
                            }`}
                          >
                            {item.packed ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <X className="h-5 w-5" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold ${item.packed ? 'line-through text-muted-foreground' : ''}`}>
                                {item.name}
                              </h4>
                              {item.quantity && item.quantity > 1 && (
                                <Badge variant="outline" className="text-xs">
                                  x{item.quantity}
                                </Badge>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-sm text-muted-foreground">{item.notes}</p>
                            )}
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
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

