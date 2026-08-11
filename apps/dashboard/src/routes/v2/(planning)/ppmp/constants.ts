/**
 * PPMP Management Route Constants & Configuration
 * Defines tab structure, search params validation, and route metadata
 */

import { z } from 'zod'
import type { PPMPState } from '@/features/planning/ppmp/types'

export type PPMPManagementTab =
  'my-drafts' | 'for-approval' | 'approved' | 'amendments'

export interface PPMPTabConfig {
  id: PPMPManagementTab
  label: string
  filterState: PPMPState
}

/**
 * PPMP Management Tabs
 * Organize PPMPs by document state for easier navigation and filtering
 */
export const PPMP_MANAGEMENT_TABS: PPMPTabConfig[] = [
  {
    id: 'my-drafts',
    label: 'My Drafts',
    filterState: 'draft' as PPMPState,
  },
  {
    id: 'for-approval',
    label: 'For Approval',
    filterState: 'pending_review' as PPMPState,
  },
  {
    id: 'approved',
    label: 'Approved PPMPs',
    filterState: 'approved' as PPMPState,
  },
  {
    id: 'amendments',
    label: 'Amendments',
    filterState: 'amending' as PPMPState,
  },
]

export const TAB_SLUGS = PPMP_MANAGEMENT_TABS.map((t) => t.id)

/**
 * Zod validation schema for /v2/ppmp search parameters
 * Ensures type-safe URL parameter handling and provides defaults
 */
export const ppmpManagementSearchSchema = z.object({
  view: z.enum(['department', 'office']).optional().default('department'),
  pageNumber: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(5).max(100).optional().default(10),
  searchQuery: z.string().optional(),
  status: z.string().optional(),
  fiscalYearId: z.string().optional(),
  officeId: z.string().optional(),
  lib: z.string().optional(),
  consolidated: z.string().optional(),
  sortBy: z.enum(['date', 'budget', 'code']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type PPMPManagementSearch = z.infer<typeof ppmpManagementSearchSchema>

/**
 * PPMP State to label mapping
 */
export const PPMP_STATE_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  amending: 'Amending',
  superseded: 'Superseded',
  rejected: 'Rejected',
}

/**
 * PPMP State color mapping (Tailwind classes)
 * Used for status badges and indicators
 */
export const PPMP_STATE_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  amending: 'bg-blue-100 text-blue-800',
  superseded: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
}

/**
 * API endpoint constants
 */
export const PPMP_API_ENDPOINTS = {
  LIST: '/ppmps',
  DETAIL: '/ppmps/:id',
  UPDATE_STATE: '/ppmps/:id/state',
  APPROVE: '/ppmps/:id/approve',
  REJECT: '/ppmps/:id/reject',
  AMEND: '/ppmps/:id/amendments',
} as const
