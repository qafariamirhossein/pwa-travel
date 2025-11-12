import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useExpenseStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface BudgetTabProps {
  tripId: string
}

const categories = ['Food', 'Transport', 'Lodging', 'Activities', 'Shopping', 'Other']
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function BudgetTab({ tripId }: BudgetTabProps) {
  const { expenses, loading, fetchExpenses, createExpense, deleteExpense } = useExpenseStore()
  const [showForm, setShowForm] = useState(false)
  const [budget, setBudget] = useState('')
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    currency: 'USD',
    note: '',
  })

  useEffect(() => {
    fetchExpenses(tripId)
    const savedBudget = localStorage.getItem(`budget-${tripId}`)
    if (savedBudget) {
      setBudget(savedBudget)
    }
  }, [tripId, fetchExpenses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createExpense({
      tripId,
      category: formData.category,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      note: formData.note || undefined,
    })

    setFormData({
      category: 'Food',
      amount: '',
      currency: 'USD',
      note: '',
    })
    setShowForm(false)
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const budgetAmount = budget ? parseFloat(budget) : 0
  const remaining = budgetAmount - totalSpent

  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0)
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))

  if (loading) {
    return <div>Loading expenses...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Budget & Expenses</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
            <div className="text-2xl font-bold">
              {budget ? formatCurrency(budgetAmount, 'USD') : 'Not set'}
            </div>
            <Input
              type="number"
              placeholder="Set budget"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value)
                localStorage.setItem(`budget-${tripId}`, e.target.value)
              }}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Spent</div>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent, 'USD')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Remaining</div>
            <div
              className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-green-600'}`}
            >
              {budget ? formatCurrency(remaining, 'USD') : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
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
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="e.g., Dinner at restaurant"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Expense</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Recent Expenses</h3>
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No expenses yet. Add your first expense!
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>{expense.category}</Badge>
                      <span className="font-semibold">
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                    </div>
                    {expense.note && (
                      <p className="text-sm text-muted-foreground">{expense.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteExpense(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

