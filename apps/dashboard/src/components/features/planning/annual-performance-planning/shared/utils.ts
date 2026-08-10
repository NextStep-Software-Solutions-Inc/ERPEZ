/**
 * Shared utilities for Annual Performance Planning Module
 */

import { APP_MODULE_CONSTANTS } from './constants'

/**
 * Format date to ISO string
 */
export const formatDateToISO = (date: Date | string): string => {
  if (typeof date === 'string') return date
  return date.toISOString()
}

/**
 * Parse date string to readable format
 */
export const formatDateDisplay = (dateString?: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Validate date range
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return true
  const start = new Date(startDate)
  const end = new Date(endDate)
  return start < end
}

/**
 * Validate fiscal year
 */
export const isValidFiscalYear = (year: number): boolean => {
  return year >= APP_MODULE_CONSTANTS.FISCAL_YEAR.MIN_YEAR && year <= APP_MODULE_CONSTANTS.FISCAL_YEAR.MAX_YEAR
}

/**
 * Get status badge color
 */
export const getStatusBadgeColor = (status?: string): string => {
  const colors: Record<string, string> = {
    Draft: 'bg-blue-100 text-blue-800 border-blue-200',
    Locked: 'bg-gray-100 text-gray-800 border-gray-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    Setup: 'bg-blue-100 text-blue-800 border-blue-200',
    Closed: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return colors[status || 'Draft'] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Get status icon/emoji
 */
export const getStatusIcon = (status?: string): string => {
  const icons: Record<string, string> = {
    Draft: '✏️',
    Locked: '🔒',
    Active: '✓',
    Setup: '⚙️',
    Closed: '🔒',
  }
  return icons[status || 'Draft'] || '○'
}

/**
 * Check if fiscal year is editable
 */
export const isFiscalYearEditable = (status?: string, isLocked?: boolean): boolean => {
  return status !== 'Locked' && status !== 'Active' && !isLocked
}

/**
 * Debounce function for search
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Generate unique ID
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
