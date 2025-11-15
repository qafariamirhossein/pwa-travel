import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function isOnline(): boolean {
  return navigator.onLine
}

export function getDaysUntil(date: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  const diff = targetDate.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
}

export function isUpcoming(date: string): boolean {
  return getDaysUntil(date) > 0
}

export function isOngoing(startDate: string, endDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  return today >= start && today <= end
}

export function formatCountdown(days: number): string {
  if (days < 0) return 'Past'
  if (days === 0) return 'Today!'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `${days} days`
  if (days < 30) return `${Math.floor(days / 7)} weeks`
  return `${Math.floor(days / 30)} months`
}

