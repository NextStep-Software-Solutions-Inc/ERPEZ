/**
 * Schedule Parser - Task 2.4
 * Safely parses flexible schedule values without crashing on non-ISO inputs
 * Handles: ISO dates, multiple dates, predefined strings ("N/A", "various dates", etc.)
 */

import type { ScheduleValueType, HybridScheduleValue } from '../types'

export type ScheduleType = 'date' | 'predefined_string' | 'month_range' | 'text' | 'invalid'

/**
 * Parse schedule value into a standardized format
 * NEVER throws - always returns valid HybridScheduleValue
 */
export function parseScheduleValue(value: ScheduleValueType): HybridScheduleValue {
  if (!value) {
    return {
      type: 'text',
      value: '',
      displayText: 'Not specified',
    }
  }

  // Handle string inputs
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase()

    // Predefined strings
    if (trimmed === 'n/a' || trimmed === 'not applicable') {
      return {
        type: 'predefined_string',
        value: 'N/A',
        displayText: 'N/A',
      }
    }
    if (trimmed === 'various dates' || trimmed === 'various') {
      return {
        type: 'predefined_string',
        value: 'various dates',
        displayText: 'Various dates',
      }
    }
    if (trimmed === 'as the need arises') {
      return {
        type: 'predefined_string',
        value: 'as the need arises',
        displayText: 'As the need arises',
      }
    }

    // Check if it's a single ISO date (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return {
          type: 'date',
          value: date,
          displayText: formatDate(date),
        }
      }
    }

    // Check for complete date format (DD/MM/YYYY)
    const completeMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (completeMatch) {
      const [, dayStr, monthStr, yearStr] = completeMatch
      const day = parseInt(dayStr, 10)
      const month = parseInt(monthStr, 10)
      const year = parseInt(yearStr, 10)

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const date = new Date(year, month - 1, day)
        if (!isNaN(date.getTime())) {
          return {
            type: 'date',
            value: date,
            displayText: formatCompleteDate(date),
          }
        }
      }
    }

    // Check for comma-separated complete dates (e.g., "15/01/2024, 28/02/2024")
    if (value.includes(',')) {
      const parts = value.split(',').map((s) => s.trim())
      const validDates: Date[] = []

      for (const part of parts) {
        const match = part.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
        if (match) {
          const [, dayStr, monthStr, yearStr] = match
          const day = parseInt(dayStr, 10)
          const month = parseInt(monthStr, 10)
          const year = parseInt(yearStr, 10)
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const date = new Date(year, month - 1, day)
            if (!isNaN(date.getTime())) {
              validDates.push(date)
            }
          }
        }
      }

      if (validDates.length > 0) {
        return {
          type: 'month_range',
          value: validDates as any,
          displayText: validDates.map((d) => formatCompleteDate(d)).join(', '),
        }
      }
    }

    // Check for month/year format (MM/YYYY or M/YYYY)
    const monthYearMatch = value.match(/^(\d{1,2})\/(\d{4})$/)
    if (monthYearMatch) {
      const [, monthStr, yearStr] = monthYearMatch
      const month = parseInt(monthStr, 10)
      const year = parseInt(yearStr, 10)

      if (month >= 1 && month <= 12) {
        const date = new Date(year, month - 1, 1)
        return {
          type: 'date',
          value: date,
          displayText: formatMonthYear(month, year),
        }
      }
    }

    // Check for comma-separated months (e.g., "01/2024, 07/2024")
    if (value.includes(',')) {
      const parts = value.split(',').map((s) => s.trim())
      const validMonthYears: { month: number; year: number }[] = []

      for (const part of parts) {
        const match = part.match(/^(\d{1,2})\/(\d{4})$/)
        if (match) {
          const [, monthStr, yearStr] = match
          const month = parseInt(monthStr, 10)
          const year = parseInt(yearStr, 10)
          if (month >= 1 && month <= 12) {
            validMonthYears.push({ month, year })
          }
        }
      }

      if (validMonthYears.length > 0) {
        return {
          type: 'month_range',
          value: validMonthYears as any,
          displayText: validMonthYears.map((my) => formatMonthYear(my.month, my.year)).join(', '),
        }
      }
    }

    // Default: treat as freeform text
    return {
      type: 'text',
      value: value,
      displayText: value,
    }
  }

  // Handle Date objects
  if (value instanceof Date) {
    if (!isNaN(value.getTime())) {
      return {
        type: 'date',
        value: value,
        displayText: formatDate(value),
      }
    }
  }

  // Fallback
  return {
    type: 'text',
    value: String(value),
    displayText: String(value),
  }
}

/**
 * Format a Date object as "DD MMM YYYY"
 */
function formatCompleteDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

/**
 * Format a Date object as "MMM DD, YYYY"
 */
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

/**
 * Format month and year as "MMM YYYY"
 */
function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1, 1)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' }
  return date.toLocaleDateString('en-US', options)
}

/**
 * Get display text for export (Excel/PDF)
 * Returns a safe string that won't cause crashes
 */
export function getScheduleDisplayText(value: ScheduleValueType): string {
  if (!value) return ''

  const parsed = parseScheduleValue(value)
  return parsed.displayText
}

/**
 * Batch parse multiple schedule values
 */
export function parseScheduleValues(values: ScheduleValueType[]): HybridScheduleValue[] {
  return values.map(parseScheduleValue)
}
