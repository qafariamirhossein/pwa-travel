import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin" />
          <p className="text-muted-foreground">Loading expenses...</p>
        </div>
      </div>
    )
  }

  const budgetPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-1">Budget & Expenses</h2>
          <p className="text-muted-foreground">Track your spending and stay on budget</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-muted-foreground">Total Budget</div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-lg">💰</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-3">
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

        <Card className="glass-card border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-lg">💸</span>
              </div>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(totalSpent, 'USD')}</div>
            {budgetAmount > 0 && (
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {budgetPercentage.toFixed(1)}% of budget used
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`glass-card border-2 ${
          remaining < 0 
            ? 'border-red-200 dark:border-red-800' 
            : 'border-green-200 dark:border-green-800'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-muted-foreground">Remaining</div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                remaining < 0 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                <span className={`text-lg ${
                  remaining < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {remaining < 0 ? '⚠️' : '✅'}
                </span>
              </div>
            </div>
            <div
              className={`text-3xl font-bold ${
                remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}
            >
              {budget ? formatCurrency(remaining, 'USD') : '-'}
            </div>
            {budget && remaining < 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                Over budget by {formatCurrency(Math.abs(remaining), 'USD')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="glass-card border-2">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Add New Expense</h3>
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
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Recent Expenses</h3>
          {expenses.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
            </span>
          )}
        </div>
        {expenses.length === 0 ? (
          <Card className="glass-card border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">💳</div>
              <p className="text-muted-foreground text-lg">
                No expenses yet. Add your first expense to start tracking!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="text-xs px-3 py-1">{expense.category}</Badge>
                          <span className="text-2xl font-bold">
                            {formatCurrency(expense.amount, expense.currency)}
                          </span>
                        </div>
                        {expense.note && (
                          <p className="text-sm text-muted-foreground mb-2">{expense.note}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(expense.createdAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExpense(expense.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

