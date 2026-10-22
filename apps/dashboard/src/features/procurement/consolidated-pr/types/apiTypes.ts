/**
 * Consolidated PR API Contract Types
 * Matches backend Swagger spec for /consolidated-prs endpoints.
 */

import type { MonthlyQuantitiesApi } from '../../purchase-requests-pr/types/apiTypes'

export type { MonthlyQuantitiesApi }

// ─── GET /consolidated-prs ────────────────────────────────────────────────────

export interface ConsolidatedPR {
  id: string
  cprNumber: string
  consolidationDate: string
  description: string
  status: string
}

export interface ConsolidatedPrBacResolution {
  id: string
  procurementProjectId: string
  projectTitle: string
  resolutionNumber: string
  resolutionType: string
  dateResolved: string
  status: string
  resolvedLocation?: string
  abc: number
  sourceType: string
}

export interface ConsolidatedPrDetail {
  id: string
  cprNumber: string
  consolidationDate: string
  description: string
  purpose: string
  status: string
  prs?: ConsolidatedPrLinkedPr[]
  modeOfProcurement?: string
  bacResolutions?: ConsolidatedPrBacResolution[]
}

export interface ConsolidatedPrLinkedPr {
  purchaseRequestId: string
  prNumber: string
  officeId: string
  officeName: string
  prType: string
  totalAmount: number
  items: ConsolidatedPrLinkedItem[]
}

export interface ConsolidatedPrLinkedItem {
  prItemId: string
  consolidatedPRItemId?: string
  name: string
  description: string
  category: string
  fund: string
  unit: string
  unitPrice: number
  totalQuantity: number
  totalAmount: number
  stockNo: string
  monthlyQuantities: MonthlyQuantitiesApi
  procurementModeId?: string
  allowPartial?: boolean
}

// ─── POST /consolidated-prs ───────────────────────────────────────────────────

export interface CreateConsolidatedPrPayload {
  consolidationDate: string
  description: string
  purpose: string
}

// ─── POST /consolidated-prs/{id}/prs ──────────────────────────────────────────

export interface AddPrsToConsolidatedPrPayload {
  purchaseRequestIds: string[]
}

// ─── PATCH /consolidated-prs/{id}/items/{itemId} ──────────────────────────────

export interface UpdateConsolidatedPrItemPayload {
  procurementModeId?: string
  allowPartial: boolean
}

// ─── GET /consolidated-prs/{id}/eligible-prs ──────────────────────────────────

export interface EligiblePrItem {
  prItemId: string
  name: string
  description: string
  category: string
  fund: string
  unit: string
  unitPrice: number
  totalQuantity: number
  totalAmount: number
  stockNo: string
  monthlyQuantities: MonthlyQuantitiesApi
}

export interface EligiblePr {
  purchaseRequestId: string
  prNumber: string
  officeId: string
  officeName: string
  prType: string
  totalAmount: number
  items: EligiblePrItem[]
}

// ─── GET /procurement-modes (used for MOP dropdown) ──────────────────────────
export interface ProcurementModeOption {
  id: string
  name: string
  description?: string
  procurementCategory?: {
    id: string
    name: string
  }
  isActive: boolean
  isArchived: boolean
}

export interface ProcurementModesApiResponse {
  data: ProcurementModeOption[]
  pageNumber: number
  pageSize: number
  totalPages: number
}