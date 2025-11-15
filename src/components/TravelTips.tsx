import { useState } from 'react'
import { Lightbulb, ChevronRight, MapPin, Plane, Camera, Utensils } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const travelTips = [
  {
    category: 'Planning',
    icon: MapPin,
    tips: [
      'Research local customs and cultural norms before you go',
      'Download offline maps for your destination',
      'Make copies of important documents (passport, tickets)',
      'Check visa requirements well in advance',
      'Learn a few basic phrases in the local language',
    ],
  },
  {
    category: 'Packing',
    icon: Plane,
    tips: [
      'Pack light - you can always buy things you need',
      'Roll clothes instead of folding to save space',
      'Bring a reusable water bottle',
      'Pack a first aid kit with essentials',
      'Keep valuables in your carry-on',
    ],
  },
  {
    category: 'Photography',
    icon: Camera,
    tips: [
      'Wake up early for the best lighting',
      'Take photos of signs and menus for reference',
      'Backup photos daily to cloud storage',
      'Don\'t forget to put the camera down and enjoy the moment',
      'Ask locals for the best photo spots',
    ],
  },
  {
    category: 'Food',
    icon: Utensils,
    tips: [
      'Try local street food - it\'s often the best',
      'Eat where locals eat, not just tourist spots',
      'Stay hydrated, especially in hot climates',
      'Research dietary restrictions in advance',
      'Take photos of dishes you loved to recreate later',
    ],
  },
]

export function TravelTips() {
  const [selectedCategory, setSelectedCategory] = useState(0)

  return (
    <Card className="glass-card border-2">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Travel Tips</h3>
            <p className="text-sm text-muted-foreground">Helpful advice for your journey</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {travelTips.map((category, index) => {
            const Icon = category.icon
            return (
              <Button
                key={index}
                variant={selectedCategory === index ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(index)}
                className="shrink-0"
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.category}
              </Button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="space-y-3">
              {travelTips[selectedCategory].tips.map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{tip}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

