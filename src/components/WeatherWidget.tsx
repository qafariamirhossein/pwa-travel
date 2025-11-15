import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface WeatherWidgetProps {
  destination: string
}

interface WeatherData {
  temp: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
}

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase()
  if (lower.includes('rain') || lower.includes('drizzle')) return CloudRain
  if (lower.includes('snow')) return CloudSnow
  if (lower.includes('cloud')) return Cloud
  return Sun
}

export function WeatherWidget({ destination }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate weather data (in a real app, you'd call a weather API)
    const fetchWeather = async () => {
      setLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock weather data based on destination
      const mockWeather: WeatherData = {
        temp: Math.floor(Math.random() * 20) + 15, // 15-35°C
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
        icon: 'sun',
      }
      
      setWeather(mockWeather)
      setLoading(false)
    }

    fetchWeather()
  }, [destination])

  if (loading) {
    return (
      <Card className="glass-card border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather) return null

  const Icon = getWeatherIcon(weather.condition)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="glass-card border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold mb-1">Weather in {destination}</h3>
              <p className="text-sm text-muted-foreground">{weather.condition}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Thermometer className="h-5 w-5 text-primary" />
            <span className="text-3xl font-bold">{weather.temp}°C</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                Humidity: {weather.humidity}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                Wind: {weather.windSpeed} km/h
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

