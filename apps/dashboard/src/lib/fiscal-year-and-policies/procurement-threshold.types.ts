import { FunctionConfiguration, RatingScaleItem } from './types'

// Procurement Category (Global master list, seeded)
export type ProcurementCategory = {
  id: string
  name: string
  description?: string
  torRequired?: boolean
  isHighlyTechnicalGoodsServices?: boolean
  createdAt: string
  updatedAt: string
}

// Procurement Mode (backend response)
export type ProcurementMode = {
  id: string
  name: string | null
  description: string | null
  minThreshold: number
  maxThreshold: number | null
  isArchived: boolean
  isActive: boolean
  procurementCategory: {
    id: string
    name: string | null
  } | null
  createdAt: string
  updatedAt: string | null
}

// Procurement Mode Display (frontend model - mapped from backend response)
export type ProcurementModeDisplay = {
  id: string
  modeName: string | null
  description: string | null
  minThreshold: number
  maxThreshold: number | null
  isArchived: boolean
  isActive: boolean
  categoryName: string | null
  categoryId: string
  createdAt: string
  updatedAt: string | null
}

// Procurement Mode Threshold (with effectivity dates)
export type ProcurementModeThreshold = {
  id: string
  procurementModeId: string
  minThreshold: number // 2 decimals, PHP
  maxThreshold?: number // 2 decimals, PHP (nullable for open-ended)
  effectivityStart: string // ISO date string
  effectivityEnd?: string // ISO date string (nullable for open-ended)
  createdAt: string
  updatedAt: string
}

// Procurement Policy Config (ties mode + threshold to fiscal year + org)
export type ProcurementPolicyConfig = {
  id: string
  fiscalYearId: string
  organizationId?: string // Optional initially for flexibility
  procurementModeId: string
  procurementModeThresholdId: string // References threshold as boundary
  minAmount: number // 2 decimals, PHP
  maxAmount?: number // 2 decimals, PHP (nullable)
  createdAt: string
  updatedAt: string
}

// Extended Procurement Policy Config with related data for display
export type ProcurementPolicyConfigWithRelations = ProcurementPolicyConfig & {
  fiscalYearYear?: number
  procurementModeName?: string
  procurementModeDescription?: string
  thresholdMinThreshold?: number
  thresholdMaxThreshold?: number
  thresholdEffectivityStart?: string
  thresholdEffectivityEnd?: string
  createdBy?: string
  updatedBy?: string
}

export type ProcurementMethod = {
  id: string
  fiscalYearId: string
  name: string
  description: string
  minimumThreshold: number
  maximumThreshold: number
  applicableFor: string[]
  requiredDocuments: string[]
}

export type PolicyConfig = {
  id: string
  fiscalYearId: string
  selectedFiscalYearId?: string // Currently selected fiscal year for function configurations
  functionConfigurations?: FunctionConfiguration[] // Function configs for selected fiscal year
  selectedProcurementMethodId: string
  customThresholds: {
    minimumThreshold: number
    maximumThreshold: number
    thresholdValue: number // NEW: Single middle-ground value per fiscal year
  }
  economicIndicators: {
    vatRate: number
    incomeTaxRate: number
    inflationProjected: number
  }
  spmsWeights: {
    strategicMin: number
    strategicMax: number
    coreMin: number
    coreMax: number
    supportMin: number
    supportMax: number
    fullyRequired: {
      strategic: boolean
      core: boolean
      support: boolean
    }
  }
  ratingScale: RatingScaleItem[]
}

// NEW: Tracks all fiscal years assigned to a specific procurement method + threshold combo
export type ProcurementMethodAssignment = {
  id: string
  procurementMethodId: string
  thresholdValue: number
  assignedFiscalYearIds: string[] // List of FY IDs sharing this method + threshold
  createdAt: Date
  updatedAt: Date
}

// REDESIGN: Procurement method threshold value for specific fiscal year
export type ProcurementMethodThreshold = {
  procurementMethodId: string
  fiscalYearId: string
  min: number | null
  max: number | null
  isConfigured: boolean
  isInherited: boolean
}

// NEW: Preview data for save confirmation dialog
export type ThresholdChangePreview = {
  procurementMethodId: string
  methodName: string
  oldMin: number
  oldMax: number
  newMin: number
  newMax: number
}

export type AuditLog = {
  id: string
  timestamp: Date
  user: string
  action: string
  oldValue: string | number
  newValue: string | number
  procurementMethodId?: string
  previousMethodId?: string
  featureType?: 'procurement' | 'economic'
}
