/**
 * Performance Review – Workflow Store (Zustand)
 * Manages in-memory session state, status transitions, and audit trail.
 */

import { create } from 'zustand'
import type {
  EvaluationSession,
  KPICategory,
  KPILineItem,
  QETRating,
  RatingScaleType,
  RatingLevel,
  WorkflowStatus,
  OPCRReference,
  MOVFile,
  KPIMeasurement,
} from '../types'
import type { OpcrItemRating } from '@/services/api/ratings'
import {
  computeKPIAverage,
  computeCategoryAverage,
  computeFinalRating,
} from '../hooks/usePerformanceCalculation'
import { getAdjectivalRating } from '../types'
import type { OPCRItem } from '@/lib/opcr'
import {
  getOpcrIdForItem,
  opcrItemMatchesReference,
} from '../utils/opcrReferences'
import { PerformanceMeasure } from '@/components/features/planning/kpi'

const DEFAULT_API_RATING_LEVELS: RatingLevel[] = [
  { level: 5, description: 'Outstanding', min: 4.5, max: 5 },
  { level: 4, description: 'Very Satisfactory', min: 3.5, max: 4.49 },
  { level: 3, description: 'Satisfactory', min: 2.5, max: 3.49 },
  { level: 2, description: 'Unsatisfactory', min: 1.5, max: 2.49 },
  { level: 1, description: 'Poor', min: 1, max: 1.49 },
]

function mapFunctionCategory(value?: string | null): KPICategory {
  const normalized = value?.toUpperCase() ?? ''
  if (normalized.includes('CORE')) return 'CORE'
  if (normalized.includes('SUPPORT')) return 'SUPPORT'
  return 'STRATEGIC'
}

function formatTargetValue(value: number | null) {
  return value === null || value === undefined ? 'N/A' : String(value)
}

function buildTargetSummary(item: OPCRItem) {
  return [
    `Assigned Annual: ${formatTargetValue(item.assignedTargetAnnual)}`,
    `Assigned Q1-Q4: ${[
      item.assignedTargetQ1,
      item.assignedTargetQ2,
      item.assignedTargetQ3,
      item.assignedTargetQ4,
    ]
      .map(formatTargetValue)
      .join(' / ')}`,
    `KPI Q1-Q4: ${[item.q1Target, item.q2Target, item.q3Target, item.q4Target]
      .map(formatTargetValue)
      .join(' / ')}`,
  ].join(' · ')
}

function deriveFileType(url: string): 'pdf' | 'image' | 'document' {
  if (!url) return 'document'
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.endsWith('.pdf')) return 'pdf'
  if (
    lowerUrl.endsWith('.jpg') ||
    lowerUrl.endsWith('.jpeg') ||
    lowerUrl.endsWith('.png') ||
    lowerUrl.endsWith('.gif')
  ) {
    return 'image'
  }
  return 'document'
}

function extractInitialMOVFiles(item: OPCRItem): MOVFile[] {
  const evaluationItem = item as any
  const opcrItemMOVs = evaluationItem?.opcrItemMOVs ?? []

  if (!Array.isArray(opcrItemMOVs) || opcrItemMOVs.length === 0) {
    return []
  }

  return opcrItemMOVs
    .filter((mov: any) => mov.attachedUrl)
    .map((mov: any, index: number) => ({
      id: mov.id,
      name: mov.requirementName,
      url: mov.attachedUrl,
      fileType: deriveFileType(mov.attachedUrl),
      uploadedAt: mov.uploadedDate || new Date().toISOString(),
      uploadedBy: mov.createdBy || 'System',
      configuredMOVIndex: index,
    }))
}

function buildInitialRating(
  ratings: any[] | undefined,
  type: 'self' | 'final',
): QETRating {
  const result: QETRating = {
    quality: null,
    efficiency: null,
    timeliness: null,
    average: null,
  }

  if (!ratings) return result

  for (const r of ratings) {
    if (!r.dimension) continue
    const dim = r.dimension.trim().toLowerCase()
    const val = type === 'self' ? r.selfRating : r.pmtRating

    if (val !== undefined && val !== null) {
      if (dim === 'quality' || dim === 'q') {
        result.quality = val
        result.qualityId = r.id
      } else if (dim === 'efficiency' || dim === 'e') {
        result.efficiency = val
        result.efficiencyId = r.id
      } else if (dim === 'timeliness' || dim === 't') {
        result.timeliness = val
        result.timelinessId = r.id
      }
    }
  }

  return result
}

function mapOPCRItemToKPILineItem(
  item: OPCRItem,
  existingItem?: KPILineItem,
  fallbackOpcrId = 'opcr-items',
  kpiMeasurements?: KPIMeasurement[],
  masterKPIs?: any[],
): KPILineItem {
  const kpiAssignment = (item as any).kpiAssignment
  const fyActiveKPI = kpiAssignment?.fyActiveKPI
  const kpiName = fyActiveKPI?.name?.trim() || item.kpiName?.trim() || 'Untitled KPI'
  const officeName = kpiAssignment?.officeName?.trim() || item.officeName?.trim() || 'Unassigned Office'
  const targetInfo = {
    assignedTargetAnnual: item.assignedTargetAnnual,
    assignedTargetQ1: item.assignedTargetQ1,
    assignedTargetQ2: item.assignedTargetQ2,
    assignedTargetQ3: item.assignedTargetQ3,
    assignedTargetQ4: item.assignedTargetQ4,
    q1Target: item.q1Target,
    q2Target: item.q2Target,
    q3Target: item.q3Target,
    q4Target: item.q4Target,
  }

  // Find KPI Measurement configuration
  let measurement: KPIMeasurement | undefined

  // 0. Direct match from item's nested KPI Assignment
  const nestedMeasurements = (item as any).kpiAssignment?.fyActiveKPI?.FYActiveKPIMeasurements
  if (Array.isArray(nestedMeasurements) && nestedMeasurements.length > 0) {
    measurement = nestedMeasurements[0]
  }

  if (!measurement && kpiMeasurements) {
    // 1. Direct match by kpiId/masterKPIId if present on item
    const kpiId =
      (item as any).kpiId ||
      (item as any).masterKPIId ||
      (item as any).masterKpiId
    if (kpiId) {
      measurement = kpiMeasurements.find((m) => m.kpiId === kpiId)
    }

    // 2. Fallback to name matching
    if (!measurement && masterKPIs) {
      const nameToMatch = kpiName.toLowerCase()
      const foundKpi = masterKPIs.find(
        (k) => k.name?.trim().toLowerCase() === nameToMatch,
      )
      if (foundKpi) {
        measurement = kpiMeasurements.find((m) => m.kpiId === foundKpi.id)
      }
    }
  }

  // Map dimensions -> tags (Rating Inputs)
  let tags: Array<'quality' | 'efficiency' | 'timeliness'> =
    existingItem?.tags ?? ['quality', 'efficiency', 'timeliness']
  if (measurement && measurement.dimensions) {
    const matchedTags: Array<'quality' | 'efficiency' | 'timeliness'> = []
    const dims = measurement.dimensions
    if (
      dims.some(
        (d) => d && (d.toLowerCase() === 'quality' || d.toLowerCase() === 'q'),
      )
    ) {
      matchedTags.push('quality')
    }
    if (
      dims.some(
        (d) =>
          d && (d.toLowerCase() === 'efficiency' || d.toLowerCase() === 'e'),
      )
    ) {
      matchedTags.push('efficiency')
    }
    if (
      dims.some(
        (d) =>
          d && (d.toLowerCase() === 'timeliness' || d.toLowerCase() === 't'),
      )
    ) {
      matchedTags.push('timeliness')
    }
    if (matchedTags.length > 0) {
      tags = matchedTags
    }
  }

  // Map moVs -> configuredMOVs (Upload MOV section)
  const configuredMOVs = measurement
    ? (measurement.moVs.filter((m): m is string => m !== null && m !== '') ??
      [])
    : (existingItem?.configuredMOVs ?? [])

  // Map isMOVEditable -> MOV edit toggle
  const isMOVEditable =
    measurement !== undefined
      ? measurement.isMOVEditable
      : (existingItem?.isMOVEditable ?? true)

  // Map isScaleEditable -> Rating configuration toggle
  const isScaleEditable =
    measurement !== undefined
      ? measurement.isScaleEditable
      : (existingItem?.isScaleEditable ?? true)

  // ratingScaleTemplateId -> store for future integration
  const ratingScaleTemplateId = measurement
    ? measurement.ratingScaleTemplateId
    : (existingItem?.ratingScaleTemplateId ?? null)
  const fyActiveKPIMeasurementId = measurement
    ? measurement.id
    : (existingItem?.fyActiveKPIMeasurementId ?? null)

  const evaluationItem = item as any

  return {
    id: item.id,
    opcrItemId: item.id,
    opcrId: item.opcrId ?? fallbackOpcrId,
    category: mapFunctionCategory(fyActiveKPI?.functionCategory ?? item.functionCategory),
    kpiName,
    officeName,
    opcrFiscalYear: item.fiscalYear,
    measurementUnit: item.measurementUnit,
    distributionBehavior: item.distributionBehavior,
    targetInfo,
    functionDescription: officeName,
    successIndicator: kpiName,
    target: buildTargetSummary(item),
    weight: fyActiveKPI?.weight ?? 1,
    tags,
    isScaleEditable,
    isMOVEditable,
    scaleType: existingItem?.scaleType ?? 'NON_FIXED',
    ratingLevels: existingItem?.ratingLevels ?? DEFAULT_API_RATING_LEVELS,
    configuredMOVs,
    ratingScaleTemplateId,
    fyActiveKPIMeasurementId,
    selfRating: existingItem?.selfRating ?? buildInitialRating(item.opcrItemRatings, 'self'),
    finalRating: existingItem?.finalRating ?? buildInitialRating(item.opcrItemRatings, 'final'),
    finalizationRemark: existingItem?.finalizationRemark ?? '',
    actual: existingItem?.actual ?? evaluationItem.actualAccomplishment ?? '',
    movFiles: existingItem?.movFiles ?? extractInitialMOVFiles(item),
    justification: existingItem?.justification ?? evaluationItem.justification ?? '',
    ratingScaleLabel:
      existingItem?.ratingScaleLabel ??
      '5 - Outstanding · 4 - Very Satisfactory · 3 - Satisfactory · 2 - Unsatisfactory · 1 - Poor',
  }
}

// ─── Store Interface ──────────────────────────────────────────────────────────
interface PerformanceReviewState {
  // OPCR Selection
  selectedFiscalYear: string
  selectedDeliveryUnitId: string
  selectedOpcrId: string | null
  availableOpcrs: OPCRReference[]

  // Active Session
  currentSession: EvaluationSession | null
  sessionCache: Record<string, EvaluationSession>

  // Active step (tab index)
  activeStep: 0 | 1 | 2 | 3 | 4 // 0=selection, 1=ratee, 2=pmt, 3=report, 4=ranking

  // Actions
  setSelectedFiscalYear: (year: string) => void
  setSelectedDeliveryUnitId: (id: string) => void
  setSelectedOpcrId: (id: string) => void
  setAvailableOpcrs: (opcrs: OPCRReference[]) => void
  returnToSelection: () => void
  loadSession: (
    opcrId: string,
    currentUserId: string,
    currentUserName: string,
    kpiMeasurements?: KPIMeasurement[],
    masterKPIs?: any[],
    items?: OPCRItem[],
    reviewStatus?: string | null,
  ) => void
  loadOPCRItems: (
    items: OPCRItem[],
    currentUserId: string,
    currentUserName: string,
    kpiMeasurements?: KPIMeasurement[],
    masterKPIs?: any[],
  ) => void
  setActiveStep: (step: 0 | 1 | 2 | 3 | 4) => void

  // KPI mutations
  updateSelfRating: (
    kpiId: string,
    field: keyof QETRating,
    value: number | null,
  ) => void
  updateFunctionDescription: (
    kpiId: string,
    functionDescription: string,
  ) => void
  updateRatingScaleLabel: (kpiId: string, ratingScaleLabel: string) => void
  updateScaleType: (kpiId: string, scaleType: RatingScaleType) => void
  updateRatingLevel: (
    kpiId: string,
    level: RatingLevel['level'],
    updates: Partial<Pick<RatingLevel, 'description' | 'min' | 'max'>>,
  ) => void
  updateActual: (kpiId: string, actual: string) => void
  updateJustification: (kpiId: string, justification: string) => void
  addMOVFile: (kpiId: string, file: MOVFile) => void
  removeMOVFile: (kpiId: string, fileId: string) => void
  // Configured MOVs (template-level names)
  addConfiguredMOVName: (kpiId: string, name: string) => void
  updateConfiguredMOVName: (kpiId: string, index: number, name: string) => void
  removeConfiguredMOVName: (kpiId: string, index: number) => void
  updateIsScaleEditable: (kpiId: string, isScaleEditable: boolean) => void
  updateIsMOVEditable: (kpiId: string, isMOVEditable: boolean) => void
  updateFinalRating: (
    kpiId: string,
    field: keyof QETRating,
    value: number | null,
  ) => void
  updateFinalizationRemark: (kpiId: string, remark: string) => void
  loadRatings: (ratings: OpcrItemRating[], performanceMeasures: unknown[]) => void
  syncItemRatings: (itemId: string, ratings: OpcrItemRating[]) => void
  setSelfRatingId: (
    kpiId: string,
    field: 'quality' | 'efficiency' | 'timeliness',
    ratingId: string,
  ) => void

  // Workflow transitions
  submitForReview: (userId: string, userName: string) => void
  approveFinalization: (userId: string, userName: string) => void
  returnForRevision: (userId: string, userName: string, comment: string) => void
  finalizeEvaluation: (userId: string, userName: string) => void

  // Computed updater (call after every rating mutation)
  _recompute: () => void
}

function deriveOpcrProgress(session: EvaluationSession) {
  return {
    selfRatingDone:
      session.status === 'SUBMITTED_FOR_REVIEW' ||
      session.status === 'FINALIZED',
    finalizationDone: session.status === 'FINALIZED',
  }
}

function persistSessionState(
  state: Pick<PerformanceReviewState, 'availableOpcrs' | 'sessionCache'>,
  session: EvaluationSession,
  extra: Partial<PerformanceReviewState> = {},
) {
  const progress = deriveOpcrProgress(session)

  return {
    ...extra,
    currentSession: session,
    sessionCache: {
      ...state.sessionCache,
      [session.opcrId]: session,
    },
    availableOpcrs: state.availableOpcrs.map((opcr) =>
      opcr.id === session.opcrId
        ? {
            ...opcr,
            selfRatingDone: progress.selfRatingDone,
            finalizationDone: progress.finalizationDone,
          }
        : opcr,
    ),
  }
}

function areOpcrReferencesEqual(
  left: OPCRReference[],
  right: OPCRReference[],
) {
  if (left.length !== right.length) return false

  return left.every((item, index) => {
    const other = right[index]
    return (
      item.id === other.id &&
      item.title === other.title &&
      item.fiscalYear === other.fiscalYear &&
      item.deliveryUnitId === other.deliveryUnitId &&
      item.deliveryUnitName === other.deliveryUnitName &&
      item.status === other.status &&
      item.kpiCount === other.kpiCount &&
      item.selfRatingDone === other.selfRatingDone &&
      item.finalizationDone === other.finalizationDone &&
      item.rateeName === other.rateeName &&
      item.sector === other.sector &&
      item.cluster === other.cluster
    )
  })
}

// ─── Store Implementation ─────────────────────────────────────────────────────
export const usePerformanceReviewStore = create<PerformanceReviewState>()(
  (set, get) => ({
    selectedFiscalYear: '',
    selectedDeliveryUnitId: '',
    selectedOpcrId: null,
    availableOpcrs: [],
    currentSession: null,
    sessionCache: {},
    activeStep: 0,

    setSelectedFiscalYear: (year) => set({ selectedFiscalYear: year }),
    setSelectedDeliveryUnitId: (id) => set({ selectedDeliveryUnitId: id }),
    setSelectedOpcrId: (id) => set({ selectedOpcrId: id }),
    returnToSelection: () =>
      set({
        currentSession: null,
        selectedOpcrId: null,
        activeStep: 0,
      }),
    setAvailableOpcrs: (opcrs) =>
      set((state) => {
        const nextAvailableOpcrs = opcrs.map((opcr) => {
          const session =
            state.sessionCache[opcr.id] ??
            (state.currentSession?.opcrId === opcr.id
              ? state.currentSession
              : null)
          const progress = session
            ? deriveOpcrProgress(session)
            : {
                selfRatingDone: opcr.selfRatingDone ?? false,
                finalizationDone: opcr.finalizationDone ?? false,
              }

          return {
            ...opcr,
            ...progress,
          }
        })

        if (areOpcrReferencesEqual(nextAvailableOpcrs, state.availableOpcrs)) {
          return state
        }

        return {
          availableOpcrs: nextAvailableOpcrs,
        }
      }),

    setActiveStep: (step) => set({ activeStep: step }),

    loadSession: (
      opcrId,
      currentUserId,
      currentUserName,
      kpiMeasurements,
      masterKPIs,
      items,
      reviewStatus,
    ) => {
      const opcr = get().availableOpcrs.find((o) => o.id === opcrId)
      if (!opcr) return

      const realItemsForOpcr =
        items?.filter((item) => opcrItemMatchesReference(item, opcr)) ?? []
      const liveSession = get().currentSession
      if (liveSession?.opcrId === opcrId && realItemsForOpcr.length === 0) {
        set({
          currentSession: liveSession,
          selectedOpcrId: opcrId,
          activeStep: 1,
        })
        return
      }

      const cachedSession = get().sessionCache[opcrId]
      if (cachedSession && realItemsForOpcr.length === 0) {
        set({
          currentSession: cachedSession,
          selectedOpcrId: opcrId,
          activeStep: 1,
        })
        return
      }

      const existingItemsById = new Map(
        (liveSession?.opcrId === opcrId
          ? liveSession.kpiItems
          : (cachedSession?.kpiItems ?? [])
        ).map((item) => [item.id, item]),
      )
      const kpiItems =
        realItemsForOpcr.length > 0
          ? realItemsForOpcr.map((item) =>
              mapOPCRItemToKPILineItem(
                item,
                existingItemsById.get(item.id),
                opcrId,
                kpiMeasurements,
                masterKPIs,
              ),
            )
          : []
      // Determine session status: prefer the API reviewStatus, fall back to computed flags
      const normalizedReview = reviewStatus?.trim().toUpperCase() ?? ''
      const sessionStatus: WorkflowStatus =
        normalizedReview.includes('FINAL')
          ? 'FINALIZED'
          : normalizedReview.includes('RETURN') || normalizedReview.includes('REJECT')
            ? 'REJECTED_FOR_REVISION'
            : normalizedReview.includes('SUBMIT') || normalizedReview.includes('REVIEW')
              ? 'SUBMITTED_FOR_REVIEW'
              : opcr.finalizationDone
                ? 'FINALIZED'
                : opcr.selfRatingDone
                  ? 'SUBMITTED_FOR_REVIEW'
                  : 'OPEN_FOR_RATING'

      const session: EvaluationSession = {
        id: `session-${opcrId}-${Date.now()}`,
        opcrId,
        fiscalYear: opcr.fiscalYear,
        deliveryUnitId: opcr.deliveryUnitId,
        deliveryUnitName: opcr.deliveryUnitName,
        rateeId: currentUserId,
        rateeName: currentUserName,
        status: sessionStatus,
        kpiItems,
        categoryAverages: { STRATEGIC: null, CORE: null, SUPPORT: null },
        finalRatingScore: null,
        adjectivalRating: null,
        submittedAt: null,
        submittedBy: null,
        reviewedAt: null,
        reviewedBy: null,
        finalizedAt: null,
        finalizedBy: null,
        rejectedAt: null,
        rejectedBy: null,
        rejectionComment: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      set((state) =>
        persistSessionState(state, session, {
          selectedOpcrId: opcrId,
          activeStep: 1,
        }),
      )
    },

    loadOPCRItems: (
      items,
      currentUserId,
      currentUserName,
      kpiMeasurements,
      masterKPIs,
    ) => {
      const existingSession = get().currentSession
      const existingById = new Map(
        existingSession?.kpiItems.map((item) => [item.id, item]) ?? [],
      )
      const firstItem = items[0]
      const opcrId = firstItem ? getOpcrIdForItem(firstItem) : 'opcr-items'
      const fiscalYear =
        firstItem?.fiscalYear !== null && firstItem?.fiscalYear !== undefined
          ? String(firstItem.fiscalYear)
          : get().selectedFiscalYear
      const deliveryUnitId = firstItem?.officeId ?? 'opcr-items'
      const deliveryUnitName =
        firstItem?.officeName?.trim() || 'Performance Review'
      const now = new Date().toISOString()
      const kpiItems = items.map((item) =>
        mapOPCRItemToKPILineItem(
          item,
          existingById.get(item.id),
          opcrId,
          kpiMeasurements,
          masterKPIs,
        ),
      )
      const sessionStatus =
        existingSession?.opcrId === opcrId
          ? existingSession.status
          : 'OPEN_FOR_RATING'
      const session: EvaluationSession = {
        id:
          existingSession?.opcrId === opcrId
            ? existingSession.id
            : `session-${opcrId}`,
        opcrId,
        fiscalYear,
        deliveryUnitId,
        deliveryUnitName,
        rateeId:
          existingSession?.opcrId === opcrId
            ? existingSession.rateeId
            : currentUserId,
        rateeName:
          existingSession?.opcrId === opcrId
            ? existingSession.rateeName
            : currentUserName,
        status: sessionStatus,
        kpiItems,
        categoryAverages:
          existingSession?.opcrId === opcrId
            ? existingSession.categoryAverages
            : { STRATEGIC: null, CORE: null, SUPPORT: null },
        finalRatingScore:
          existingSession?.opcrId === opcrId
            ? existingSession.finalRatingScore
            : null,
        adjectivalRating:
          existingSession?.opcrId === opcrId
            ? existingSession.adjectivalRating
            : null,
        submittedAt:
          existingSession?.opcrId === opcrId
            ? existingSession.submittedAt
            : null,
        submittedBy:
          existingSession?.opcrId === opcrId
            ? existingSession.submittedBy
            : null,
        reviewedAt:
          existingSession?.opcrId === opcrId
            ? existingSession.reviewedAt
            : null,
        reviewedBy:
          existingSession?.opcrId === opcrId
            ? existingSession.reviewedBy
            : null,
        finalizedAt:
          existingSession?.opcrId === opcrId
            ? existingSession.finalizedAt
            : null,
        finalizedBy:
          existingSession?.opcrId === opcrId
            ? existingSession.finalizedBy
            : null,
        rejectedAt:
          existingSession?.opcrId === opcrId
            ? existingSession.rejectedAt
            : null,
        rejectedBy:
          existingSession?.opcrId === opcrId
            ? existingSession.rejectedBy
            : null,
        rejectionComment:
          existingSession?.opcrId === opcrId
            ? existingSession.rejectionComment
            : null,
        createdAt:
          existingSession?.opcrId === opcrId ? existingSession.createdAt : now,
        updatedAt: now,
      }
      const progress = deriveOpcrProgress(session)
      const opcrReference: OPCRReference = {
        id: opcrId,
        title: `OPCR ${fiscalYear} - ${deliveryUnitName}`,
        fiscalYear,
        deliveryUnitId,
        deliveryUnitName,
        status: 'APPROVED',
        kpiCount: kpiItems.length,
        rateeName: session.rateeName,
        selfRatingDone: progress.selfRatingDone,
        finalizationDone: progress.finalizationDone,
      }

      set((state) => ({
        selectedFiscalYear: fiscalYear,
        selectedDeliveryUnitId: deliveryUnitId,
        selectedOpcrId: opcrId,
        currentSession: session,
        sessionCache: {
          ...state.sessionCache,
          [opcrId]: session,
        },
        availableOpcrs: [
          opcrReference,
          ...state.availableOpcrs.filter((opcr) => opcr.id !== opcrId),
        ],
      }))
    },

    updateSelfRating: (kpiId, field, value) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) => {
          if (item.id !== kpiId) return item
          const updated = {
            ...item,
            selfRating: { ...item.selfRating, [field]: value },
          }
          updated.selfRating.average = computeKPIAverage(updated, 'self')
          return updated
        })
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
      get()._recompute()
    },

    updateFunctionDescription: (kpiId, functionDescription) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) =>
          item.id === kpiId ? { ...item, functionDescription } : item,
        )
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    updateRatingScaleLabel: (kpiId, ratingScaleLabel) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) =>
          item.id === kpiId ? { ...item, ratingScaleLabel } : item,
        )
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    updateScaleType: (kpiId, scaleType) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) =>
          item.id === kpiId ? { ...item, scaleType } : item,
        )
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    updateRatingLevel: (kpiId, level, updates) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) => {
          if (item.id !== kpiId) return item
          const ratingLevels = item.ratingLevels.map((entry) =>
            entry.level === level ? { ...entry, ...updates } : entry,
          )
          return { ...item, ratingLevels }
        })
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    updateActual: (kpiId, actual) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) =>
          item.id === kpiId ? { ...item, actual } : item,
        )
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    updateJustification: (kpiId, justification) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) =>
          item.id === kpiId ? { ...item, justification } : item,
        )
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    addConfiguredMOVName: (kpiId, name) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) =>
          item.id === kpiId
            ? {
                ...item,
                configuredMOVs: [...(item.configuredMOVs ?? []), name],
              }
            : item,
        )
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    updateConfiguredMOVName: (kpiId, index, name) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) => {
          if (item.id !== kpiId) return item
          const configuredMOVs = [...(item.configuredMOVs ?? [])]
          if (index < 0 || index >= configuredMOVs.length) return item
          configuredMOVs[index] = name
          return { ...item, configuredMOVs }
        })
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    removeConfiguredMOVName: (kpiId, index) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) => {
          if (item.id !== kpiId) return item
          const configuredMOVs = (item.configuredMOVs ?? []).filter(
            (_, i) => i !== index,
          )
          return { ...item, configuredMOVs }
        })
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    addMOVFile: (kpiId, file) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) =>
          item.id === kpiId
            ? { ...item, movFiles: [...item.movFiles, file] }
            : item,
        )
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    removeMOVFile: (kpiId, fileId) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) =>
          item.id === kpiId
            ? {
                ...item,
                movFiles: item.movFiles.filter((f) => f.id !== fileId),
              }
            : item,
        )
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    updateIsScaleEditable: (kpiId, isScaleEditable) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) =>
          item.id === kpiId ? { ...item, isScaleEditable } : item,
        )
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    updateIsMOVEditable: (kpiId, isMOVEditable) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) =>
          item.id === kpiId ? { ...item, isMOVEditable } : item,
        )
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },

    updateFinalRating: (kpiId, field, value) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) => {
          if (item.id !== kpiId) return item
          const updated = {
            ...item,
            finalRating: { ...item.finalRating, [field]: value },
          }
          updated.finalRating.average = computeKPIAverage(updated, 'final')
          return updated
        })
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
            updatedAt: new Date().toISOString(),
          },
        }
      })
      get()._recompute()
    },

    updateFinalizationRemark: (kpiId, remark) => {
      set((state) => {
        if (!state.currentSession) return state
        const nextSession: EvaluationSession = {
          ...state.currentSession,
          kpiItems: state.currentSession.kpiItems.map((item) =>
            item.id === kpiId ? { ...item, finalizationRemark: remark } : item,
          ),
          updatedAt: new Date().toISOString(),
        }

        return persistSessionState(state, nextSession)
      })
    },

    loadRatings: (ratings, performanceMeasures: any) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) => {
          const kpiRatings = ratings.filter(
            (r) =>
              r.fyActiveKPIMeasurementId === item.id ||
              r.fyActiveKPIMeasurementId === item.opcrItemId,
          )

          const selfRating = {
            quality: null as number | null,
            efficiency: null as number | null,
            timeliness: null as number | null,
            average: null as number | null,
            qualityId: undefined as string | undefined,
            efficiencyId: undefined as string | undefined,
            timelinessId: undefined as string | undefined,
          }

          kpiRatings.forEach((rating) => {
            const pm =
              performanceMeasures.find(
                (p: any) => p.id === rating.id,
              ) || rating.id
            if (!pm) return

            const name = pm.name.toLowerCase()
            // if (name === 'quality' || name === 'q') {
            //   selfRating. = rating.pmtRating
            //   selfRating.qualityId = rating.id
            // } else if (name === 'efficiency' || name === 'e') {
            //   selfRating.efficiency = rating.numericalRating
            //   selfRating.efficiencyId = rating.id
            // } else if (name === 'timeliness' || name === 't') {
            //   selfRating.timeliness = rating.numericalRating
            //   selfRating.timelinessId = rating.id
            // }
          })

          const activeDims = [
            selfRating.quality,
            selfRating.efficiency,
            selfRating.timeliness,
          ].filter((v) => v !== null)
          selfRating.average =
            activeDims.length > 0
              ? Number(
                  (
                    activeDims.reduce((a, b) => a + b, 0) / activeDims.length
                  ).toFixed(2),
                )
              : null

          return {
            ...item,
            selfRating: {
              ...item.selfRating,
              ...selfRating,
            },
          }
        })

        return persistSessionState(state, {
          ...state.currentSession,
          kpiItems,
          updatedAt: new Date().toISOString(),
        })
      })
      get()._recompute()
    },

    syncItemRatings: (itemId, ratings) => {
      set((state) => {
        if (!state.currentSession) return state

        const targetItem = state.currentSession.kpiItems.find(
          (item) => item.id === itemId,
        )
        if (!targetItem) return state

        const selfRating = {
          quality: null as number | null,
          efficiency: null as number | null,
          timeliness: null as number | null,
          average: null as number | null,
          qualityId: undefined as string | undefined,
          efficiencyId: undefined as string | undefined,
          timelinessId: undefined as string | undefined,
        }

        const finalRating = {
          quality: null as number | null,
          efficiency: null as number | null,
          timeliness: null as number | null,
          average: null as number | null,
          qualityId: undefined as string | undefined,
          efficiencyId: undefined as string | undefined,
          timelinessId: undefined as string | undefined,
        }

        let finalizationRemark = ''

        ratings.forEach((rating) => {
          const dim = rating.dimension?.toLowerCase()
          if (dim === 'quality' || dim === 'q') {
            selfRating.quality = rating.selfRating
            selfRating.qualityId = rating.id
            finalRating.quality = rating.pmtRating ?? null
            finalRating.qualityId = rating.id
            if (rating.pmtRemark) finalizationRemark = rating.pmtRemark
          } else if (dim === 'efficiency' || dim === 'e') {
            selfRating.efficiency = rating.selfRating
            selfRating.efficiencyId = rating.id
            finalRating.efficiency = rating.pmtRating ?? null
            finalRating.efficiencyId = rating.id
            if (rating.pmtRemark) finalizationRemark = rating.pmtRemark
          } else if (dim === 'timeliness' || dim === 't') {
            selfRating.timeliness = rating.selfRating
            selfRating.timelinessId = rating.id
            finalRating.timeliness = rating.pmtRating ?? null
            finalRating.timelinessId = rating.id
            if (rating.pmtRemark) finalizationRemark = rating.pmtRemark
          }
        })

        const activeSelfDims = [
          selfRating.quality,
          selfRating.efficiency,
          selfRating.timeliness,
        ].filter((v) => v !== null)
        selfRating.average =
          activeSelfDims.length > 0
            ? Number(
                (
                  activeSelfDims.reduce((a, b) => a + b, 0) /
                  activeSelfDims.length
                ).toFixed(2),
              )
            : null

        const activeFinalDims = [
          finalRating.quality,
          finalRating.efficiency,
          finalRating.timeliness,
        ].filter((v) => v !== null)
        finalRating.average =
          activeFinalDims.length > 0
            ? Number(
                (
                  activeFinalDims.reduce((a, b) => a + b, 0) /
                  activeFinalDims.length
                ).toFixed(2),
              )
            : null

        // Check if anything actually changed to prevent infinite re-renders
        const isSame =
          targetItem.selfRating.quality === selfRating.quality &&
          targetItem.selfRating.efficiency === selfRating.efficiency &&
          targetItem.selfRating.timeliness === selfRating.timeliness &&
          targetItem.selfRating.qualityId === selfRating.qualityId &&
          targetItem.selfRating.efficiencyId === selfRating.efficiencyId &&
          targetItem.selfRating.timelinessId === selfRating.timelinessId &&
          targetItem.finalRating.quality === finalRating.quality &&
          targetItem.finalRating.efficiency === finalRating.efficiency &&
          targetItem.finalRating.timeliness === finalRating.timeliness &&
          targetItem.finalRating.qualityId === finalRating.qualityId &&
          targetItem.finalRating.efficiencyId === finalRating.efficiencyId &&
          targetItem.finalRating.timelinessId === finalRating.timelinessId &&
          targetItem.finalizationRemark === finalizationRemark

        if (isSame) return state

        const kpiItems = state.currentSession.kpiItems.map((item) => {
          if (item.id !== itemId) return item
          return {
            ...item,
            selfRating: {
              ...item.selfRating,
              ...selfRating,
            },
            finalRating: {
              ...item.finalRating,
              ...finalRating,
            },
            finalizationRemark: finalizationRemark || item.finalizationRemark,
          }
        })

        return persistSessionState(state, {
          ...state.currentSession,
          kpiItems,
          updatedAt: new Date().toISOString(),
        })
      })
      get()._recompute()
    },

    setSelfRatingId: (kpiId, field, ratingId) => {
      set((state) => {
        if (!state.currentSession) return state
        const kpiItems = state.currentSession.kpiItems.map((item) => {
          if (item.id !== kpiId) return item
          const fieldIdKey =
            field === 'quality'
              ? 'qualityId'
              : field === 'efficiency'
                ? 'efficiencyId'
                : 'timelinessId'
          return {
            ...item,
            selfRating: {
              ...item.selfRating,
              [fieldIdKey]: ratingId,
            },
          }
        })
        return {
          currentSession: {
            ...state.currentSession,
            kpiItems,
          },
        }
      })
    },

    submitForReview: (_userId, userName) => {
      set((state) => {
        if (!state.currentSession) return state
        const nextSession: EvaluationSession = {
          ...state.currentSession,
          status: 'SUBMITTED_FOR_REVIEW',
          submittedAt: new Date().toISOString(),
          submittedBy: userName,
          updatedAt: new Date().toISOString(),
        }
        return {
          ...persistSessionState(state, nextSession),
          activeStep: 2,
        }
      })
    },

    approveFinalization: (_userId, userName) => {
      set((state) => {
        if (!state.currentSession) return state
        const nextSession: EvaluationSession = {
          ...state.currentSession,
          status: 'FINALIZED',
          finalizedAt: new Date().toISOString(),
          finalizedBy: userName,
          updatedAt: new Date().toISOString(),
        }
        return {
          ...persistSessionState(state, nextSession),
          activeStep: 3,
        }
      })
      get()._recompute()
    },

    returnForRevision: (_userId, userName, comment) => {
      set((state) => {
        if (!state.currentSession) return state
        const nextSession: EvaluationSession = {
          ...state.currentSession,
          status: 'REJECTED_FOR_REVISION',
          rejectedAt: new Date().toISOString(),
          rejectedBy: userName,
          rejectionComment: comment,
          updatedAt: new Date().toISOString(),
        }
        return {
          ...persistSessionState(state, nextSession),
          activeStep: 1,
        }
      })
    },

    finalizeEvaluation: (_userId, userName) => {
      set((state) => {
        if (!state.currentSession) return state
        const nextSession: EvaluationSession = {
          ...state.currentSession,
          status: 'FINALIZED',
          finalizedAt: new Date().toISOString(),
          finalizedBy: userName,
          updatedAt: new Date().toISOString(),
        }
        return {
          ...persistSessionState(state, nextSession),
          activeStep: 4,
        }
      })
    },

    _recompute: () => {
      set((state) => {
        if (!state.currentSession) return state
        const items = state.currentSession.kpiItems
        const catAvgs = {
          STRATEGIC:
            computeCategoryAverage(items, 'STRATEGIC', 'final') ??
            computeCategoryAverage(items, 'STRATEGIC', 'self'),
          CORE:
            computeCategoryAverage(items, 'CORE', 'final') ??
            computeCategoryAverage(items, 'CORE', 'self'),
          SUPPORT:
            computeCategoryAverage(items, 'SUPPORT', 'final') ??
            computeCategoryAverage(items, 'SUPPORT', 'self'),
        }
        const useRating =
          state.currentSession.status === 'OPEN_FOR_RATING' ||
          state.currentSession.status === 'SUBMITTED_FOR_REVIEW'
            ? 'self'
            : 'final'
        const score = computeFinalRating(items, useRating as 'self' | 'final')
        const adjRating = score !== null ? getAdjectivalRating(score) : null
        const nextSession: EvaluationSession = {
          ...state.currentSession,
          categoryAverages: catAvgs,
          finalRatingScore: score,
          adjectivalRating: adjRating,
          updatedAt: new Date().toISOString(),
        }
        return {
          ...persistSessionState(state, nextSession),
        }
      })
    },
  }),
)
