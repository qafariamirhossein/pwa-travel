import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  if (!date) return 'Invalid Date'
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return 'Invalid Date'
  return dateObj.toLocaleDateString('en-US', {
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
  if (!date) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(date)
  if (isNaN(targetDate.getTime())) return 0
  targetDate.setHours(0, 0, 0, 0)
  const diff = targetDate.getTime() - today.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return isNaN(days) ? 0 : days
}

export function getDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  const diff = end.getTime() - start.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
  return isNaN(days) ? 0 : days
}

export function isUpcoming(date: string): boolean {
  if (!date) return false
  const days = getDaysUntil(date)
  return !isNaN(days) && days > 0
}

export function isOngoing(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return today >= start && today <= end
}

export function formatCountdown(days: number): string {
  if (isNaN(days) || days < 0) return 'Past'
  if (days === 0) return 'Today!'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `${days} days`
  if (days < 30) return `${Math.floor(days / 7)} weeks`
  return `${Math.floor(days / 30)} months`
}

