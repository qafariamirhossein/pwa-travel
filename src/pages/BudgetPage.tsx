import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTripStore, useExpenseStore } from '@/store/useTripStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { expenseDB } from '@/lib/db'
import type { Expense } from '@/types'

const categories = ['Food', 'Transport', 'Lodging', 'Activities', 'Shopping', 'Other']
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function BudgetPage() {
  const { trips, fetchTrips } = useTripStore()
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  useEffect(() => {
    const loadAllExpenses = async () => {
      setLoading(true)
      const expenses: Expense[] = []

      // Get all expenses from all trips
      for (const trip of trips) {
        const tripExpenses = await expenseDB.getByTrip(trip.id)
        expenses.push(...tripExpenses)
      }

      setAllExpenses(expenses)
      setLoading(false)
    }

    if (trips.length > 0) {
      loadAllExpenses()
    } else {
      setLoading(false)
    }
  }, [trips])

  const totalSpent = allExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = allExpenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0)
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))

  // Group expenses by trip
  const expensesByTrip = trips.map((trip) => {
    const tripExpenses = allExpenses.filter((e) => e.tripId === trip.id)
    const tripTotal = tripExpenses.reduce((sum, e) => sum + e.amount, 0)
    return {
      trip,
      expenses: tripExpenses,
      total: tripTotal,
    }
  }).filter((item) => item.expenses.length > 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin" />
            <p className="text-muted-foreground">Loading expenses...</p>
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
        <h1 className="text-4xl font-bold gradient-text mb-2">Budget Overview</h1>
        <p className="text-muted-foreground">Track expenses across all your trips</p>
      </div>

      {allExpenses.length === 0 ? (
        <Card className="glass-card border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-muted-foreground text-lg mb-4">
              No expenses yet. Add expenses to your trips to see them here!
            </p>
            <Link to="/">
              <Button>View Trips</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">💰</span>
                  </div>
                </div>
                <div className="text-3xl font-bold">{formatCurrency(totalSpent, 'USD')}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Across {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Expenses</div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 text-lg">📊</span>
                  </div>
                </div>
                <div className="text-3xl font-bold">{allExpenses.length}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Expense {allExpenses.length === 1 ? 'entry' : 'entries'}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-muted-foreground">Average per Trip</div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-lg">📈</span>
                  </div>
                </div>
                <div className="text-3xl font-bold">
                  {formatCurrency(expensesByTrip.length > 0 ? totalSpent / expensesByTrip.length : 0, 'USD')}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {expensesByTrip.length} {expensesByTrip.length === 1 ? 'trip' : 'trips'} with expenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <Card className="glass-card mb-8">
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
                        padding: '8px',
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

          {/* Expenses by Trip */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Expenses by Trip</h3>
            {expensesByTrip.length === 0 ? (
              <Card className="glass-card border-2 border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No expenses recorded yet
                </CardContent>
              </Card>
            ) : (
              expensesByTrip.map((item, index) => (
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
                          <div className="text-2xl font-bold">{formatCurrency(item.total, 'USD')}</div>
                          <p className="text-xs text-muted-foreground">
                            {item.expenses.length} {item.expenses.length === 1 ? 'expense' : 'expenses'}
                          </p>
                        </div>
                      </div>
                      <Link to={`/trip/${item.trip.id}`}>
                        <Button variant="outline" className="w-full">
                          View Trip Details →
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

