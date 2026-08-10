/**
 * Market Scoping Custom Actions Utility
 * Defines and manages available actions based on form status
 * Location: src/features/planning/market-scoping/utils/
 */

import type { MarketScopingForm } from '../types/marketScopingTypes'

export type ActionType = 'view' | 'edit' | 'delete' | 'download-pdf'

export interface CustomAction {
  id: ActionType
  label: string
  icon: string
  isDestructive?: boolean
  isVisible: (form: MarketScopingForm) => boolean
  isDisabled?: (form: MarketScopingForm) => boolean
}

/**
 * Define custom actions with visibility rules based on status
 */
export const MARKET_SCOPING_ACTIONS: Record<ActionType, CustomAction> = {
  view: {
    id: 'view',
    label: 'View Details',
    icon: 'Eye',
    isVisible: (_form) => true, // Always visible
    isDisabled: (_form) => false,
  },
  edit: {
    id: 'edit',
    label: 'Edit',
    icon: 'Edit2',
    isVisible: (form) => {
      const s = (form.status || '').toLowerCase()
      return s === 'draft' || s === 'returned'
    },
    isDisabled: (_form) => false,
  },
  delete: {
    id: 'delete',
    label: 'Delete',
    icon: 'Trash2',
    isDestructive: true,
    isVisible: (form) => {
      const s = (form.status || '').toLowerCase()
      return s === 'draft' || s === 'returned'
    },
    isDisabled: (_form) => false,
  },
  'download-pdf': {
    id: 'download-pdf',
    label: 'Download PDF',
    icon: 'Download',
    isVisible: (form) => form.status === 'Approved' && !!form.pdfUrl,
    isDisabled: (form) => !form.pdfUrl,
  },
}

/**
 * Get available actions for a given form
 * @param form - The market scoping form
 * @returns Array of visible actions for this form
 */
export function getAvailableActions(form: MarketScopingForm): ActionType[] {
  return (Object.keys(MARKET_SCOPING_ACTIONS) as ActionType[]).filter((actionId) => {
    const action = MARKET_SCOPING_ACTIONS[actionId]
    return action.isVisible(form)
  })
}

/**
 * Check if a specific action is available for a form
 * @param form - The market scoping form
 * @param actionId - The action to check
 * @returns True if action is available and visible
 */
export function isActionAvailable(form: MarketScopingForm, actionId: ActionType): boolean {
  const action = MARKET_SCOPING_ACTIONS[actionId]
  return action.isVisible(form) && !(action.isDisabled?.(form) ?? false)
}
