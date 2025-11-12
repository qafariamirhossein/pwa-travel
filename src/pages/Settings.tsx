import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Download } from 'lucide-react'

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }

    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('The app is already installed or installation is not available.')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    setDeferredPrompt(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={toggleTheme} variant="outline" className="w-full">
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Switch to Dark Mode
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Switch to Light Mode
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Install App</CardTitle>
            <CardDescription>Install NomadNote as a Progressive Web App</CardDescription>
          </CardHeader>
          <CardContent>
            {deferredPrompt ? (
              <Button onClick={handleInstall} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                The app is already installed or installation is not available on this device.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>NomadNote - Your Travel Companion</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              NomadNote helps you plan, organize, and manage your trips. All data is stored
              locally and synced when you're online.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

