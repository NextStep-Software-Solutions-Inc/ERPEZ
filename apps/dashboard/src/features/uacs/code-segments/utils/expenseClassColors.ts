/**
 * Expense Class Color Mapping
 * Maps expense class to Tailwind color classes for badges
 */

import type { ExpenseClass } from '../types/commonTypes'

export const expenseClassColors: Record<ExpenseClass, string> = {
  PS: 'bg-green-600',       // Personal Services - Green
  MOOE: 'bg-blue-600',      // Maintenance & Other Operating Expenses - Blue
  CO: 'bg-purple-600',      // Capital Outlay - Purple
  FE: 'bg-orange-600',      // Financial Expenses - Orange
}

/**
 * Get the color class for an expense class
 */
export function getExpenseClassColor(expenseClass: ExpenseClass): string {
  return expenseClassColors[expenseClass] || 'bg-gray-600'
}

/**
 * Get a lighter variant for backgrounds
 */
export const expenseClassBgAccent: Record<ExpenseClass, string> = {
  PS: 'bg-green-50',
  MOOE: 'bg-blue-50',
  CO: 'bg-purple-50',
  FE: 'bg-orange-50',
}

/**
 * Get border color variants
 */
export const expenseClassBorder: Record<ExpenseClass, string> = {
  PS: 'border-green-300',
  MOOE: 'border-blue-300',
  CO: 'border-purple-300',
  FE: 'border-orange-300',
}
