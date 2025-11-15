import { Link, useLocation } from 'react-router-dom'
import { Home, Map, DollarSign, FileText, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', icon: Home, label: 'Trips' },
  { path: '/map', icon: Map, label: 'Map' },
  { path: '/budget', icon: DollarSign, label: 'Budget' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="relative">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
        
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
        
        <div className="relative flex items-center justify-around h-20 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path === '/' && location.pathname.startsWith('/trip'))

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="relative"
                >
                  <div className={cn(
                    'p-2 rounded-xl transition-all duration-200',
                    isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                </motion.div>
                <span className={cn(
                  'text-xs mt-1 font-medium transition-all duration-200',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

