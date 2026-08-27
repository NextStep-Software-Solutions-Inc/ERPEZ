import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNavigate, useSearch } from '@tanstack/react-router'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOPCRRequest } from '@/features/planning/opcr/handlers/getOPCRRequest'
import type {
  OPCRDetails,
  OPCRItem,
  OPCRItemRating,
} from '@/features/planning/opcr'
import { useQueries } from '@tanstack/react-query'
import type { RatingScaleTemplateResponse } from '@/features/planning/rating-scale-template/types'
import { getRatingScaleTemplateRequest } from '../../handlers/getRatingScaleTemplateRequest'
import { SelfRatingSessionHeader } from './SelfRatingSessionHeader'
import { SelfRatingKpiAccordion } from './SelfRatingKpiAccordion'
import { usePerformanceCalculation } from '../../hooks/usePerformanceCalculation'
import { usePerformanceReviewFileUpload } from '../../hooks/usePerformanceReviewFileUpload'
import { usePerformanceReviewFileUploadStore } from '../../store/performanceReviewFileUploadStore'
import type {
  EvaluationSession,
  KPICategory,
  KPILineItem,
  MOVFile,
  QETRating,
  RatingLevel,
  RatingScaleType,
  WorkflowStatus,
} from '../../types'
import {
  SELF_RATING_CATEGORIES,
  groupKPIsByCategory,
} from '../../utils/selfRating'
import type { OpcrItemRating } from '@/services/api/ratings'
import { patchOPCRSelfEvaluateRequest } from '../../handlers/patchOPCRSelfEvaluateRequest'
import { patchOPCRReviewStatusRequest } from '../../handlers/patchOPCRReviewStatusRequest'
import { FYActiveKPIMeasurement } from '@/lib/opcr/types'

const useOPCR = createQueryHookFromTemplate(getOPCRRequest)

function parseRatingScaleTemplate(
  template: RatingScaleTemplateResponse | null | undefined,
): {
  ratingLevels: RatingLevel[]
  ratingScaleLabel: string
  scaleType?: RatingScaleType
  ratingScaleName?: string
  ratingScaleDescription?: string
} {
  if (!template) {
    return {
      ratingLevels: [],
      ratingScaleLabel: '',
    }
  }

  const rawLevels =
    template.RatingScaleLevels || template.ratingScaleLevels || []

  if (!Array.isArray(rawLevels) || rawLevels.length === 0) {
    const defaultSPMSLevels: RatingLevel[] = [
      { level: 5, description: 'Outstanding', min: 4.5, max: 5.0 },
      { level: 4, description: 'Very Satisfactory', min: 3.5, max: 4.49 },
      { level: 3, description: 'Satisfactory', min: 2.5, max: 3.49 },
      { level: 2, description: 'Unsatisfactory', min: 1.5, max: 2.49 },
      { level: 1, description: 'Poor', min: 1.0, max: 1.49 },
    ]
    return {
      ratingLevels: defaultSPMSLevels,
      ratingScaleLabel:
        '5 - Outstanding · 4 - Very Satisfactory · 3 - Satisfactory · 2 - Unsatisfactory · 1 - Poor',
      scaleType: template.isFixed ? 'FIXED' : 'NON_FIXED',
      ratingScaleName: template.name ?? 'SPMS Standard 5-Point Rating Scale',
      ratingScaleDescription:
        template.description ??
        'Standard Strategic Performance Management System Rating Scale (1 to 5)',
    }
  }

  const ratingLevels: RatingLevel[] = rawLevels
    .map((lvl) => ({
      level: Number(lvl.ratingValue) as 5 | 4 | 3 | 2 | 1,
      description: lvl.description ?? '',
      min:
        lvl.minValue !== null && lvl.minValue !== undefined
          ? Number(lvl.minValue)
          : null,
      max:
        lvl.maxValue !== null && lvl.maxValue !== undefined
          ? Number(lvl.maxValue)
          : null,
    }))
    .sort((a, b) => b.level - a.level)

  const labelParts = ratingLevels
    .filter((l) => Boolean(l.description?.trim()))
    .map((l) => `${l.level} - ${l.description.trim()}`)

  const ratingScaleLabel =
    labelParts.length > 0
      ? labelParts.join(' · ')
      : ratingLevels.map((l) => String(l.level)).join(' · ')

  return {
    ratingLevels,
    ratingScaleLabel,
    scaleType: template.isFixed ? 'FIXED' : 'NON_FIXED',
    ratingScaleName: template.name ?? undefined,
    ratingScaleDescription: template.description ?? undefined,
  }
}

const ALL_DIMENSIONS: Array<'quality' | 'efficiency' | 'timeliness'> = [
  'quality',
  'efficiency',
  'timeliness',
]

type OPCRMeasurementLike = FYActiveKPIMeasurement & {
  dimensions?: string[] | null
  RatingScaleTemplateId?: string
}

type OPCRItemMOVData = {
  id: string
  requirementName: string
  attachedUrl: string
  uploadedDate: string
  createdBy?: string | null
}

type OPCRItemEvaluationFields = OPCRItem & {
  actualAccomplishment?: string | null
  justification?: string | null
  opcrItemMOVs?: OPCRItemMOVData[]
}

function normalizeStatus(value: string | null | undefined) {
  return (
    value
      ?.trim()
      .replace(/[\s-]+/g, '_')
      .toUpperCase() ?? ''
  )
}

function formatTargetValue(value: number | null | undefined) {
  return value === null || value === undefined ? 'N/A' : String(value)
}

function mapFunctionCategory(value?: string | null): KPICategory {
  const normalized = value?.toUpperCase() ?? ''
  if (normalized.includes('CORE')) return 'CORE'
  if (normalized.includes('SUPPORT')) return 'SUPPORT'
  return 'STRATEGIC'
}

function mapWorkflowStatus(opcr: OPCRDetails): WorkflowStatus {
  const normalized = normalizeStatus(
    opcr.reviewStatus ?? opcr.status ?? opcr.commitmentStatus,
  )

  if (normalized.includes('FINAL')) return 'FINALIZED'
  if (normalized.includes('RETURN') || normalized.includes('REJECT')) {
    return 'REJECTED_FOR_REVISION'
  }
  if (normalized.includes('SUBMIT')) return 'SUBMITTED_FOR_REVIEW'
  return 'OPEN_FOR_RATING'
}

function getPrimaryMeasurement(item: OPCRItem): OPCRMeasurementLike | null {
  const measurementSource =
    item.kpiAssignment?.fyActiveKPI?.FYActiveKPIMeasurements ??
    item.kpiAssignment?.FYActiveKPIMeasurements ??
    []

  if (!Array.isArray(measurementSource) || measurementSource.length === 0) {
    return null
  }

  return measurementSource[0] as OPCRMeasurementLike
}

function mapDimensionsToTags(
  measurement: OPCRMeasurementLike | null,
): Array<'quality' | 'efficiency' | 'timeliness'> {
  const dimensions = measurement?.dimensions ?? measurement?.dimension
  if (!dimensions?.length) return ALL_DIMENSIONS

  const tags: Array<'quality' | 'efficiency' | 'timeliness'> = []
  for (const dimension of dimensions) {
    const normalized = dimension.trim().toLowerCase()
    if (normalized === 'quality' || normalized === 'q') {
      tags.push('quality')
    }
    if (normalized === 'efficiency' || normalized === 'e') {
      tags.push('efficiency')
    }
    if (normalized === 'timeliness' || normalized === 't') {
      tags.push('timeliness')
    }
  }

  return tags.length > 0 ? tags : ALL_DIMENSIONS
}

function buildTargetSummary(
  annualTarget: number | null | undefined,
  quarterlyTargets: Array<number | null | undefined>,
) {
  return [
    `Assigned Annual: ${formatTargetValue(annualTarget)}`,
    `Assigned Q1-Q4: ${quarterlyTargets.map(formatTargetValue).join(' / ')}`,
  ].join(' · ')
}

function buildInitialRating(
  ratings: OPCRItemRating[] | undefined,
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

/**
 * Extract existing MOV files from OPCRItem initial data
 */
function extractInitialMOVFiles(item: OPCRItem): MOVFile[] {
  const evaluationItem = item as OPCRItemEvaluationFields
  const opcrItemMOVs = evaluationItem?.opcrItemMOVs ?? []

  if (!Array.isArray(opcrItemMOVs) || opcrItemMOVs.length === 0) {
    return []
  }

  return opcrItemMOVs
    .filter((mov: OPCRItemMOVData) => mov.attachedUrl)
    .map((mov: OPCRItemMOVData, index: number) => ({
      id: mov.id,
      name: mov.requirementName,
      url: mov.attachedUrl,
      fileType: deriveFileType(mov.attachedUrl),
      uploadedAt: mov.uploadedDate || new Date().toISOString(),
      uploadedBy: mov.createdBy || 'System',
      configuredMOVIndex: index,
    }))
}

function mapOpcrItemToKpiLineItem(
  opcr: OPCRDetails,
  item: OPCRItem,
): KPILineItem {
  const evaluationItem = item as OPCRItemEvaluationFields
  const kpiAssignment = item.kpiAssignment
  const fyActiveKPI = kpiAssignment?.fyActiveKPI
  const measurement = getPrimaryMeasurement(item)
  const kpiName =
    fyActiveKPI?.name?.trim() || item.kpiName?.trim() || 'Untitled KPI'
  const officeName =
    kpiAssignment?.officeName?.trim() ||
    item.officeName?.trim() ||
    opcr.office?.name?.trim() ||
    'Unassigned Office'
  const category = mapFunctionCategory(
    fyActiveKPI?.functionCategory ?? item.functionCategory,
  )
  const configuredMOVs =
    measurement?.moVs?.filter((mov): mov is string => Boolean(mov)) ?? []
  const scaleType: RatingScaleType =
    measurement?.isScaleEditable === false ? 'FIXED' : 'NON_FIXED'
  const assignedTargetAnnual =
    kpiAssignment?.assignedTargetAnnual ?? item.assignedTargetAnnual ?? null
  const assignedTargetQ1 =
    kpiAssignment?.assignedTargetQ1 ?? item.assignedTargetQ1 ?? null
  const assignedTargetQ2 =
    kpiAssignment?.assignedTargetQ2 ?? item.assignedTargetQ2 ?? null
  const assignedTargetQ3 =
    kpiAssignment?.assignedTargetQ3 ?? item.assignedTargetQ3 ?? null
  const assignedTargetQ4 =
    kpiAssignment?.assignedTargetQ4 ?? item.assignedTargetQ4 ?? null
  const targetQ1 = item.q1Target ?? null
  const targetQ2 = item.q2Target ?? null
  const targetQ3 = item.q3Target ?? null
  const targetQ4 = item.q4Target ?? null

  return {
    id: item.id,
    opcrItemId: item.id,
    opcrId: opcr.id,
    category,
    kpiName,
    officeName,
    opcrFiscalYear: opcr.fiscalYear?.year ?? null,
    measurementUnit: fyActiveKPI?.measurementUnit ?? item.measurementUnit,
    distributionBehavior:
      fyActiveKPI?.distributionBehavior ?? item.distributionBehavior,
    targetInfo: {
      assignedTargetAnnual,
      assignedTargetQ1,
      assignedTargetQ2,
      assignedTargetQ3,
      assignedTargetQ4,
      q1Target: targetQ1,
      q2Target: targetQ2,
      q3Target: targetQ3,
      q4Target: targetQ4,
    },
    functionDescription:
      fyActiveKPI?.description?.trim() || fyActiveKPI?.name?.trim() || kpiName,
    successIndicator: fyActiveKPI?.name?.trim() || kpiName,
    target: buildTargetSummary(assignedTargetAnnual, [
      assignedTargetQ1,
      assignedTargetQ2,
      assignedTargetQ3,
      assignedTargetQ4,
    ]),
    weight: 1,
    tags: mapDimensionsToTags(measurement),
    isScaleEditable: measurement?.isScaleEditable ?? true,
    isMOVEditable: measurement?.isMOVEditable ?? true,
    scaleType,
    ratingLevels: [],
    configuredMOVs: configuredMOVs.length > 0 ? configuredMOVs : undefined,
    ratingScaleTemplateId:
      measurement?.ratingScaleTemplateId ??
      measurement?.RatingScaleTemplateId ??
      null,
    fyActiveKPIMeasurementId: measurement?.id ?? null,
    selfRating: buildInitialRating(item.opcrItemRatings, 'self'),
    finalRating: buildInitialRating(item.opcrItemRatings, 'final'),
    finalizationRemark: '',
    actual: evaluationItem.actualAccomplishment?.trim() ?? '',
    movFiles: extractInitialMOVFiles(item),
    justification: evaluationItem.justification?.trim() ?? '',
    ratingScaleLabel: '',
  }
}

function buildInitialKpiItems(opcr: OPCRDetails | null): KPILineItem[] {
  if (!opcr?.opcrItems?.length) return []
  return opcr.opcrItems.map((item) => mapOpcrItemToKpiLineItem(opcr, item))
}

function buildSession(
  opcr: OPCRDetails,
  kpiItems: KPILineItem[],
): EvaluationSession {
  const fiscalYear = String(opcr.fiscalYear?.year ?? '')
  const deliveryUnitId = opcr.office?.id ?? opcr.id
  const deliveryUnitName = opcr.office?.name?.trim() || 'Unassigned Office'
  const status = mapWorkflowStatus(opcr)
  const now = new Date().toISOString()

  return {
    id: `session-${opcr.id}`,
    opcrId: opcr.id,
    fiscalYear,
    deliveryUnitId,
    deliveryUnitName,
    rateeId: deliveryUnitId,
    rateeName: deliveryUnitName,
    status,
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
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Derive file type from URL extension
 */
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

type OPCRItemRatingData = {
  dimension: string
  selfRating: number
}

type PatchOPCRSelfEvaluateResponse = {
  opcrItems?: SubmittedOPCRItem[]
  [key: string]: unknown
}

type SubmittedOPCRItem = {
  id: string
  opcrItemRatings?: OPCRItemRatingData[]
  opcrItemMOVs?: OPCRItemMOVData[]
  actualAccomplishment?: string
  justification?: string
}

/**
 * Transform submitted response data to update KPI items with server confirmations
 */
function transformSubmittedResponseToKpiItems(
  currentKpiItems: KPILineItem[],
  submittedOPCRItems: SubmittedOPCRItem[],
): KPILineItem[] {
  return currentKpiItems.map((kpiItem) => {
    const submittedItem = submittedOPCRItems.find(
      (item: SubmittedOPCRItem) => item.id === kpiItem.id,
    )

    if (!submittedItem) return kpiItem

    // Transform opcrItemRatings to selfRating object
    const ratingsByDimension: Record<string, number> = (
      submittedItem.opcrItemRatings ?? []
    )
      .filter(
        (r: OPCRItemRatingData) =>
          r.dimension && typeof r.dimension === 'string' && r.dimension.trim(),
      )
      .reduce(
        (acc: Record<string, number>, r: OPCRItemRatingData) => ({
          ...acc,
          [r.dimension?.toLowerCase()]: r.selfRating,
        }),
        {},
      )

    const transformedRating: QETRating = {
      quality: ratingsByDimension['quality'] ?? kpiItem.selfRating.quality,
      efficiency:
        ratingsByDimension['efficiency'] ?? kpiItem.selfRating.efficiency,
      timeliness:
        ratingsByDimension['timeliness'] ?? kpiItem.selfRating.timeliness,
      average: null,
    }

    // Transform opcrItemMOVs to movFiles format
    const transformedMovFiles = (submittedItem.opcrItemMOVs ?? [])
      .filter((mov: OPCRItemMOVData) => mov.attachedUrl)
      .map((mov: OPCRItemMOVData, index: number) => ({
        id: mov.id,
        name: mov.requirementName,
        url: mov.attachedUrl,
        fileType: deriveFileType(mov.attachedUrl),
        uploadedAt: mov.uploadedDate || new Date().toISOString(),
        uploadedBy: mov.createdBy || 'System',
        configuredMOVIndex: index,
      }))

    return {
      ...kpiItem,
      selfRating: transformedRating,
      movFiles: transformedMovFiles,
      actual: submittedItem.actualAccomplishment?.trim() ?? kpiItem.actual,
      justification:
        submittedItem.justification?.trim() ?? kpiItem.justification,
    }
  })
}

export function SelfRatingKpiAccordionTab() {
  const navigate = useNavigate({ from: '/v2/performance-review' })
  const search = useSearch({ from: '/v2/performance-review' })
  const id = search.opcrId ?? ''
  const { officeId } = search

  const {
    data: opcrResponse,
    isLoading,
    isError,
  } = useOPCR({
    pathParams: { id },
    queryParams: {},
  })

  const opcr = opcrResponse?.data ?? null
  const [kpiItems, setKpiItems] = useState<KPILineItem[]>([])
  const [openAccordions, setOpenAccordions] = useState<string[]>([])

  const initialKpiItems = useMemo(() => buildInitialKpiItems(opcr), [opcr])

  useEffect(() => {
    setKpiItems(initialKpiItems)
    setOpenAccordions([])
  }, [initialKpiItems, opcr?.id])

  const calculationSession = useMemo(
    () => (opcr ? buildSession(opcr, kpiItems) : null),
    [kpiItems, opcr],
  )

  const customWeights = useMemo(() => {
    const total = kpiItems.length
    if (total === 0) return undefined

    const counts = { STRATEGIC: 0, CORE: 0, SUPPORT: 0 }
    for (const item of kpiItems) {
      if (item.category in counts) {
        counts[item.category]++
      }
    }

    return {
      STRATEGIC: counts.STRATEGIC / total,
      CORE: counts.CORE / total,
      SUPPORT: counts.SUPPORT / total,
    }
  }, [kpiItems])

  const templateQueries = useQueries({
    queries: (opcr?.opcrItems ?? []).map((opcrItem) => {
      const measurement = getPrimaryMeasurement(opcrItem)
      const templateId =
        measurement?.ratingScaleTemplateId ??
        measurement?.RatingScaleTemplateId ??
        null

      return {
        queryKey: ['rating-scale-template', opcrItem.id, templateId],
        queryFn: async ({ signal }: { signal?: AbortSignal }) => {
          if (!templateId) return null
          const finalUrl = getRatingScaleTemplateRequest.endpoint.replace(
            ':id',
            encodeURIComponent(templateId),
          )
          const response = await getRatingScaleTemplateRequest.fetcher({
            finalUrl,
            signal,
          })
          return response.data ?? null
        },
        enabled: Boolean(templateId),
        staleTime: 1000 * 60 * 5,
      }
    }),
  })

  useEffect(() => {
    if (!opcr?.opcrItems?.length) return

    setKpiItems((prevItems) => {
      if (!prevItems.length) return prevItems

      let hasChanges = false
      const nextItems = prevItems.map((item) => {
        const opcrItemIndex = opcr?.opcrItems?.findIndex((oi) => oi.id === item.id)
        if (opcrItemIndex === -1) return item

        const queryResult = templateQueries[opcrItemIndex]
        if (!queryResult?.data) return item

        const {
          ratingLevels,
          ratingScaleLabel,
          scaleType,
          ratingScaleName,
          ratingScaleDescription,
        } = parseRatingScaleTemplate(queryResult.data)

        const levelsChanged =
          JSON.stringify(item.ratingLevels) !== JSON.stringify(ratingLevels)
        const labelChanged = item.ratingScaleLabel !== ratingScaleLabel
        const scaleTypeChanged = Boolean(
          scaleType && item.scaleType !== scaleType,
        )
        const nameChanged = item.ratingScaleName !== ratingScaleName
        const descChanged =
          item.ratingScaleDescription !== ratingScaleDescription

        if (
          levelsChanged ||
          labelChanged ||
          scaleTypeChanged ||
          nameChanged ||
          descChanged
        ) {
          hasChanges = true
          return {
            ...item,
            ratingLevels,
            ratingScaleLabel,
            scaleType: scaleType ?? item.scaleType,
            ratingScaleName,
            ratingScaleDescription,
          }
        }
        return item
      })

      return hasChanges ? nextItems : prevItems
    })
  }, [templateQueries, opcr])

  const calc = usePerformanceCalculation(calculationSession, customWeights)
  const groupedKPIs = useMemo(() => groupKPIsByCategory(kpiItems), [kpiItems])
  const allCategoriesExpanded = SELF_RATING_CATEGORIES.every((category) =>
    openAccordions.includes(category),
  )

  // Edit mode state
  const [isReadOnly, setIsReadOnly] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // File upload hook and store
  const { uploadFilesSequentially } = usePerformanceReviewFileUpload()
  const { getItemUploadState, clearAllUploads } =
    usePerformanceReviewFileUploadStore()

  // Track collected files from all KPI cards: itemId -> files
  const [collectedFilesRef] = useState(
    () => new Map<string, Map<number, File>>(),
  )

  const handleFilesChange = useCallback(
    (itemId: string, files: Map<number, File>) => {
      if (files.size === 0) {
        collectedFilesRef.delete(itemId)
      } else {
        collectedFilesRef.set(itemId, files)
      }
    },
    [collectedFilesRef],
  )

  const syncItemRatings = useCallback(
    (itemId: string, ratings: OpcrItemRating[]) => {
      setKpiItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id !== itemId) return item

          const ratingFor = (
            dimension: 'quality' | 'efficiency' | 'timeliness',
          ) =>
            ratings.find(
              (rating) =>
                rating.dimension?.toLowerCase() === dimension ||
                rating.dimension?.toLowerCase() === dimension[0],
            )

          const qualityRating = ratingFor('quality')
          const efficiencyRating = ratingFor('efficiency')
          const timelinessRating = ratingFor('timeliness')

          return {
            ...item,
            selfRating: {
              ...item.selfRating,
              quality: qualityRating
                ? qualityRating.selfRating
                : item.selfRating.quality,
              efficiency: efficiencyRating
                ? efficiencyRating.selfRating
                : item.selfRating.efficiency,
              timeliness: timelinessRating
                ? timelinessRating.selfRating
                : item.selfRating.timeliness,
              qualityId: qualityRating?.id ?? item.selfRating.qualityId,
              efficiencyId:
                efficiencyRating?.id ?? item.selfRating.efficiencyId,
              timelinessId:
                timelinessRating?.id ?? item.selfRating.timelinessId,
            },
          }
        }),
      )
    },
    [],
  )

  const handleBack = useCallback(() => {
    navigate({
      to: '/v2/performance-review',
      search: {
        tab: 'SelfRating',
        opcrId: undefined,
        officeId: officeId || undefined,
      },
    })
  }, [navigate, officeId])

  // Update handlers for edit mode
  const handleUpdateSelfRating = useCallback<
    (
      id: string,
      field: 'quality' | 'efficiency' | 'timeliness',
      value: number | null,
      fyActiveKPIMeasurementId: string | null | undefined,
    ) => void
  >(
    (id, field, value) => {
      if (isReadOnly) return

      setKpiItems((current) =>
        current.map((item) => {
          if (item.id !== id) return item
          return {
            ...item,
            selfRating: {
              ...item.selfRating,
              [field]: value,
            },
          }
        }),
      )
    },
    [isReadOnly],
  )

  const handleUpdateActual = useCallback(
    (id: string, value: string) => {
      if (isReadOnly) return

      setKpiItems((current) =>
        current.map((item) => {
          if (item.id !== id) return item
          return { ...item, actual: value }
        }),
      )
    },
    [isReadOnly],
  )

  const handleUpdateJustification = useCallback(
    (id: string, value: string) => {
      if (isReadOnly) return

      setKpiItems((current) =>
        current.map((item) => {
          if (item.id !== id) return item
          return { ...item, justification: value }
        }),
      )
    },
    [isReadOnly],
  )

  // Submit handler for PMT review
  const handleSubmitForReview = useCallback(async () => {
    if (isReadOnly || !opcr) return

    setIsSubmitting(true)
    try {
      // Validation: Ensure all MOVs have files before submission
      const movValidationErrors: string[] = []

      for (const item of kpiItems) {
        if (!item.configuredMOVs || item.configuredMOVs.length === 0) continue

        const itemFiles = collectedFilesRef.get(item.id)
        const existingFileCount = item.movFiles?.length ?? 0

        // Check each MOV position
        for (
          let movIndex = 0;
          movIndex < item.configuredMOVs.length;
          movIndex++
        ) {
          const hasNewFile = itemFiles?.has(movIndex)
          const hasExistingFile = movIndex < existingFileCount

          // MOV requires either: 1) existing file (not removed), or 2) newly selected file
          if (!hasNewFile && !hasExistingFile) {
            movValidationErrors.push(
              `Item "${item.kpiName || item.successIndicator}" - MOV ${movIndex + 1} requires file upload`,
            )
          }
        }
      }

      if (movValidationErrors.length > 0) {
        toast.error('Validation Error', {
          description: `All MOVs require file uploads. ${movValidationErrors.length} issue(s) found.`,
          duration: 5000,
        })
        setIsSubmitting(false)
        return
      }

      // Step 1: Upload MOV files sequentially
      for (const item of kpiItems) {
        if (!item.configuredMOVs || item.configuredMOVs.length === 0) continue

        // Get files collected for this item
        const itemFiles = collectedFilesRef.get(item.id)
        const filesToUpload: { file: File; movIndex: number }[] = []

        if (itemFiles && itemFiles.size > 0) {
          // Convert Map to array format needed for uploading
          itemFiles.forEach((file, movIndex) => {
            filesToUpload.push({ file, movIndex })
          })

          try {
            await uploadFilesSequentially(item.id, filesToUpload)
            toast.success(
              `Successfully uploaded evidence files for "${item.kpiName || item.successIndicator}"`,
            )
          } catch (error) {
            console.error(`Failed to upload MOVs for item ${item.id}:`, error)
            throw error
          }
        }
      }

      type DimensionRateEntry = {
        fyActiveKPIMeasurementId: string
        dimension: 'Quality' | 'Efficiency' | 'Timeliness'
        selfRating: number
      }

      const dimensionRate: DimensionRateEntry[] = kpiItems.flatMap((item) => {
        const measurementId = item.fyActiveKPIMeasurementId || ''
        const dimensions: DimensionRateEntry[] = []

        if (item.tags.includes('quality') && item.selfRating.quality !== null) {
          dimensions.push({
            fyActiveKPIMeasurementId: measurementId,
            dimension: 'Quality',
            selfRating: item.selfRating.quality,
          })
        }

        if (
          item.tags.includes('efficiency') &&
          item.selfRating.efficiency !== null
        ) {
          dimensions.push({
            fyActiveKPIMeasurementId: measurementId,
            dimension: 'Efficiency',
            selfRating: item.selfRating.efficiency,
          })
        }

        if (
          item.tags.includes('timeliness') &&
          item.selfRating.timeliness !== null
        ) {
          dimensions.push({
            fyActiveKPIMeasurementId: measurementId,
            dimension: 'Timeliness',
            selfRating: item.selfRating.timeliness,
          })
        }

        return dimensions
      })

      // Build MOVs array with file IDs from store and existing files
      const movArray = kpiItems
        .flatMap((item) => {
          if (!item.configuredMOVs || item.configuredMOVs.length === 0)
            return []

          const itemUploadState = getItemUploadState(item.id)
          return item.configuredMOVs.map((movName, movIndex) => {
            // Get newly uploaded file ID from store
            const uploadState = itemUploadState?.get(movIndex)
            const newFileId = uploadState?.fileId

            // Get existing file ID if no new file was uploaded
            const existingFile = item.movFiles?.[movIndex]
            const existingFileId = existingFile?.id

            // Use new file ID if available, otherwise use existing file ID
            const fileId = newFileId || existingFileId

            return {
              fyActiveKPIMeasurementId: item.fyActiveKPIMeasurementId || '',
              mov: movName,
              fileId: fileId || undefined,
            }
          })
        })
        .filter((mov) => mov.fyActiveKPIMeasurementId && mov.fileId) // Filter out invalid entries

      // Step 3: Execute patch request for first KPI item for now
      // In a real scenario, you'd loop through or submit aggregated data
      if (kpiItems.length > 0) {
        const firstItem = kpiItems[0]
        const finalUrl = patchOPCRSelfEvaluateRequest.endpoint.replace(
          ':id',
          firstItem.opcrItemId || firstItem.id,
        )

        const response = await patchOPCRSelfEvaluateRequest.fetcher({
          finalUrl,
          payload: {
            actualAccomplishment: firstItem.actual,
            justification: firstItem.justification,
            dimensionRate: dimensionRate.length > 0 ? dimensionRate : undefined,
            mov: movArray.length > 0 ? movArray : undefined,
          },
        })

        // Success!
        console.log('Self-evaluation submitted:', response)

        // Step 4: Update the OPCR review status to Submitted (2)
        try {
          const reviewStatusUrl = patchOPCRReviewStatusRequest.endpoint.replace(
            ':id',
            opcr.id,
          )
          await patchOPCRReviewStatusRequest.fetcher({
            finalUrl: reviewStatusUrl,
            payload: {
              reviewStatus: 'Submitted',
            },
          })
          console.log('OPCR review status updated to Submitted')
        } catch (statusError) {
          console.error('Failed to update OPCR review status:', statusError)
        }

        // Transform response data and update KPI items
        const responseData =
          response as unknown as PatchOPCRSelfEvaluateResponse
        const submittedOPCRItems = responseData?.opcrItems ?? []
        if (submittedOPCRItems && submittedOPCRItems.length > 0) {
          const updatedKpiItems = transformSubmittedResponseToKpiItems(
            kpiItems,
            submittedOPCRItems,
          )
          setKpiItems(updatedKpiItems)
        }

        // Clear uploads
        clearAllUploads()

        // Keep in read-only mode to show submitted values
        setIsReadOnly(true)

        toast.success('Self-Evaluation Submitted', {
          description:
            'Your performance review has been successfully submitted. Review your submission below, then return to the OPCR list.',
          duration: 4000,
        })

        // Auto-navigate back after 5 seconds for user convenience
        setTimeout(() => {
          handleBack()
        }, 5000)
      }
    } catch (error) {
      console.error('Submission failed:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error('Submission Failed', {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [
    isReadOnly,
    opcr,
    kpiItems,
    uploadFilesSequentially,
    getItemUploadState,
    clearAllUploads,
    handleBack,
  ])

  const conditionalUpdateSelfRating = useCallback<
    (
      id: string,
      field: 'quality' | 'efficiency' | 'timeliness',
      value: number | null,
      fyActiveKPIMeasurementId: string | null | undefined,
    ) => void
  >(
    (id, field, value, fId) => {
      if (isReadOnly) return
      handleUpdateSelfRating(id, field, value, fId)
    },
    [isReadOnly, handleUpdateSelfRating],
  )

  const conditionalUpdateActual = useCallback(
    (id: string, value: string) => {
      if (isReadOnly) return
      handleUpdateActual(id, value)
    },
    [isReadOnly, handleUpdateActual],
  )

  const conditionalUpdateJustification = useCallback(
    (id: string, value: string) => {
      if (isReadOnly) return
      handleUpdateJustification(id, value)
    },
    [isReadOnly, handleUpdateJustification],
  )

  const noopUpdateSelfRating = useCallback<
    (
      id: string,
      field: 'quality' | 'efficiency' | 'timeliness',
      value: number | null,
      fyActiveKPIMeasurementId: string | null | undefined,
    ) => void
  >(() => undefined, [])
  const noopUpdateText = useCallback(
    (_id: string, _value: string) => undefined,
    [],
  )

  const handleToggleAllCategories = useCallback(() => {
    setOpenAccordions(allCategoriesExpanded ? [] : [...SELF_RATING_CATEGORIES])
  }, [allCategoriesExpanded, setOpenAccordions])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 mb-2 animate-spin opacity-60" />
          <p className="font-medium">Loading OPCR details...</p>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Unable to load OPCR details for this evaluation.
        </AlertDescription>
      </Alert>
    )
  }

  if (!opcr) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          No OPCR was selected.
        </AlertDescription>
      </Alert>
    )
  }

  if (kpiItems.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-0 text-muted-foreground hover:text-foreground"
                  onClick={handleBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to OPCR selection
                </Button>
                <CardTitle className="text-xl">
                  {opcr.name || 'OPCR Evaluation'}
                </CardTitle>
              </div>
              <Badge variant="outline" className="shrink-0">
                Self-Rating Tab
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="mx-auto h-8 w-8 mb-2 opacity-40" />
            <p className="font-medium">No OPCR items found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SelfRatingSessionHeader
        title={opcr.name || 'OPCR Evaluation'}
        fiscalYear={String(opcr.fiscalYear?.year ?? '')}
        rateeName={opcr.office?.name?.trim() || 'Unassigned Office'}
        kpiCount={kpiItems.length}
        status={calculationSession?.status ?? 'OPEN_FOR_RATING'}
        onReturnToSelection={handleBack}
      />

      {/* Edit / Submit Buttons */}
      <div className="flex gap-2 justify-end">
        {isReadOnly ? (
          <Button
            onClick={() => setIsReadOnly(false)}
            variant="default"
            size="sm"
          >
            Edit Evaluation
          </Button>
        ) : (
          <>
            <Button
              onClick={() => setIsReadOnly(true)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitForReview}
              disabled={isSubmitting}
              size="sm"
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4" />
              Submit for PMT Review
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">KPI Function Categories</p>
          <p className="text-xs text-muted-foreground">
            KPIs are grouped by function category. Empty categories remain
            visible so the full review structure stays intact.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleToggleAllCategories}
        >
          {allCategoriesExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {allCategoriesExpanded ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>

      <SelfRatingKpiAccordion
        groupedKPIs={groupedKPIs}
        openAccordions={openAccordions}
        setOpenAccordions={setOpenAccordions}
        isReadOnly={isReadOnly}
        customWeights={customWeights}
        calc={calc}
        onUpdateSelfRating={
          isReadOnly ? noopUpdateSelfRating : conditionalUpdateSelfRating
        }
        onUpdateActual={isReadOnly ? noopUpdateText : conditionalUpdateActual}
        onUpdateJustification={
          isReadOnly ? noopUpdateText : conditionalUpdateJustification
        }
        syncItemRatings={syncItemRatings}
        onFilesChange={handleFilesChange}
      />
    </div>
  )
}
