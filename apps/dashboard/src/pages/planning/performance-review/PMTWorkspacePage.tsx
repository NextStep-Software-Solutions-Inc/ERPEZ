/**
 * Performance Review – Step 3: PMT Workspace (Review & Calibration)
 * Split layout: KPI table (left) + MOV preview (right).
 * Final rating inputs, remark if changed, Approve / Return buttons.
 */

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

import { CheckCircle, RotateCcw, Eye, Info, AlertTriangle, ChevronRight, Building2, Loader2 } from 'lucide-react'
import { usePerformanceReviewStore } from '@/features/planning/performance-review/store/performanceReviewStore'
import { QETInputRow } from '@/features/planning/performance-review/components/QETInputRow'
import { MOVPreviewPanel } from '@/features/planning/performance-review/components/MOVPreviewPanel'
import { RejectionDrawer } from '@/features/planning/performance-review/components/RejectionDrawer'
import { WorkflowStatusBadge } from '@/features/planning/performance-review/components/WorkflowStatusBadge'
import { AdjectivalBadge } from '@/features/planning/performance-review/components/AdjectivalBadge'
import { usePerformanceCalculation } from '@/features/planning/performance-review/hooks/usePerformanceCalculation'
import {
  KPI_CATEGORY_LABELS,
  type KPICategory,
  type KPILineItem,
  type MOVFile,
  type OPCRReference,
  type QETRating,
} from '@/features/planning/performance-review/types'
import { useKpiMeasurements } from '@/features/planning/kpi-measurement-configurator/handlers/hooks'
import { useKpis } from '@/features/planning/master-kpi/handlers/hooks'
import {
  useOPCRs,
  useGetOPCRItemsQuery,
  getOPCRItemsFromResponse,
  useOPCR,
} from '@/lib/opcr'
import { buildOPCRReferencesFromApi } from '@/features/planning/performance-review/utils/opcrReferences'
import { useGetOpcrItemRatings, useCreateRating, useUpdateRating } from '@/features/planning/performance-review/hooks/useRatingsAPI'
import { patchOPCRReviewStatusRequest } from '@/features/planning/performance-review/handlers/patchOPCRReviewStatusRequest'
import { toast } from 'sonner'
import { useKeycloak } from '@/providers/KeycloakProvider'

function getReviewStatusBadge(status?: string | number | null) {
  let normalized = 'pending'
  
  if (status !== null && status !== undefined) {
    if (typeof status === 'number') {
      const statusMap: Record<number, string> = {
        0: 'pending',
        1: 'draft',
        2: 'submitted',
        3: 'returned',
        4: 'finalized',
      }
      normalized = statusMap[status] || 'pending'
    } else {
      const parsed = Number(status)
      if (!isNaN(parsed) && status.trim() !== '') {
        const statusMap: Record<number, string> = {
          0: 'pending',
          1: 'draft',
          2: 'submitted',
          3: 'returned',
          4: 'finalized',
        }
        normalized = statusMap[parsed] || 'pending'
      } else {
        normalized = status.toLowerCase()
      }
    }
  }

  const badgeColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    returned: 'bg-red-100 text-red-700 border-red-200',
    finalized: 'bg-green-100 text-green-700 border-green-200',
  }
  const labelMap: Record<string, string> = {
    pending: 'Pending',
    draft: 'Draft',
    submitted: 'Self Rated',
    returned: 'Returned',
    finalized: 'Evaluated',
  }
  return {
    label: labelMap[normalized] || 'Pending',
    className: badgeColors[normalized] || 'bg-amber-100 text-amber-700 border-amber-200',
  }
}

interface PMTTableRowProps {
  item: KPILineItem
  isEditable: boolean
  selectedMOV: MOVFile | null
  setSelectedMOV: (file: MOVFile | null) => void
  handleUpdateFinalRating: (kpiId: string, field: keyof QETRating, value: number | null) => void
  handleUpdatePMTRemark: (kpiId: string, remark: string) => void
}

const CATEGORIES: KPICategory[] = ['STRATEGIC', 'CORE', 'SUPPORT']

const EMPTY_RATINGS: any[] = []

function PMTTableRow({
  item,
  isEditable,
  selectedMOV,
  setSelectedMOV,
  handleUpdateFinalRating,
  handleUpdatePMTRemark,
}: PMTTableRowProps) {
  const syncItemRatings = usePerformanceReviewStore((state) => state.syncItemRatings)
  const { data: ratingsResponse } = useGetOpcrItemRatings(item.id)
  const ratings = ratingsResponse ?? EMPTY_RATINGS

  useEffect(() => {
    if (ratings.length > 0) {
      syncItemRatings(item.id, ratings)
    }
  }, [item.id, ratings, syncItemRatings])

  const selfAvg = item.selfRating.average
  const finalAvg = item.finalRating.average
  const changed = finalAvg !== null && finalAvg !== selfAvg
  const { updateFinalizationRemark } = usePerformanceReviewStore()

  return (
    <TableRow key={item.id} className="align-top">
      <TableCell className="py-3">
        <p className="font-medium text-sm leading-snug">{item.successIndicator}</p>
        {item.justification && (
          <p className="text-xs text-amber-600 mt-1">📝 {item.justification}</p>
        )}
      </TableCell>

      {/* Self rating – Q/E/T breakdown + average (read-only) */}
      <TableCell className="py-3 text-left">
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-1.5">
            {item.tags.includes('quality') && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground">Q</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 min-w-[2.5rem] text-center ${item.selfRating.quality !== null ? 'text-slate-700' : 'text-muted-foreground'}`}>
                  {item.selfRating.quality?.toFixed(1) ?? '—'}
                </span>
              </div>
            )}
            {item.tags.includes('efficiency') && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground">E</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 min-w-[2.5rem] text-center ${item.selfRating.efficiency !== null ? 'text-slate-700' : 'text-muted-foreground'}`}>
                  {item.selfRating.efficiency?.toFixed(1) ?? '—'}
                </span>
              </div>
            )}
            {item.tags.includes('timeliness') && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground">T</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 min-w-[2.5rem] text-center ${item.selfRating.timeliness !== null ? 'text-slate-700' : 'text-muted-foreground'}`}>
                  {item.selfRating.timeliness?.toFixed(1) ?? '—'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Avg</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${selfAvg !== null ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-muted-foreground'}`}>
              {selfAvg?.toFixed(2) ?? '—'}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Final rating input */}
      <TableCell className="py-3">
        <QETInputRow
          item={item}
          ratingKey="finalRating"
          onUpdate={handleUpdateFinalRating}
          disabled={!isEditable}
          showAverage={false}
        />
      </TableCell>

      {/* Final average */}
      <TableCell className="py-3 text-center">
        {finalAvg !== null ? (
          <span className={`text-sm font-bold ${changed ? 'text-purple-700' : 'text-slate-700'}`}>
            {finalAvg.toFixed(2)}
            {changed && <span className="text-[9px] ml-0.5 text-purple-500">↑↓</span>}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>

      {/* Remark (required for all KPI items) */}
      <TableCell className="py-3">
        <Input
          placeholder="Remark required*"
          value={item.finalizationRemark}
          onChange={(e) => updateFinalizationRemark(item.id, e.target.value)}
          onBlur={(e) => handleUpdatePMTRemark(item.id, e.target.value)}
          disabled={!isEditable}
          className={`h-8 text-xs ${!item.finalizationRemark.trim() ? 'border-amber-400' : ''}`}
        />
      </TableCell>

      {/* MOV */}
      <TableCell className="py-3">
        {item.movFiles.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.movFiles.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedMOV(f)}
                className={`flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors ${
                  selectedMOV?.id === f.id
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-muted/30 border-muted-foreground/20 hover:border-primary text-muted-foreground hover:text-primary'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                {f.name.length > 12 ? f.name.slice(0, 12) + '…' : f.name}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No MOV</span>
        )}
      </TableCell>
    </TableRow>
  )
}

export default function PMTWorkspacePage() {
  const { keycloak, userName, email, firstName, lastName } = useKeycloak()
  const currentUser = useMemo(() => {
    const displayName = [firstName, lastName].filter(Boolean).join(' ').trim()

    return {
      id: keycloak?.subject ?? email ?? userName ?? 'current-user',
      name: displayName || userName || email || 'Current User',
    }
  }, [email, firstName, keycloak?.subject, lastName, userName])

  const {
    currentSession,
    availableOpcrs,
    setAvailableOpcrs,
    loadSession,
    updateFinalRating,
    updateFinalizationRemark,
    approveFinalization,
    returnForRevision,
    finalizeEvaluation,
  } = usePerformanceReviewStore()

  const { data: measurementsData } = useKpiMeasurements({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })
  const kpiMeasurements = measurementsData?.data ?? []

  const { data: kpisData } = useKpis({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })
  const masterKpis = kpisData?.data ?? []

  const {
    data: opcrsData,
    isLoading: isOPCRsLoading,
  } = useOPCRs({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })
  const opcrs = opcrsData?.data ?? []

  const {
    data: opcrItemsData,
    isLoading: isOPCRItemsLoading,
  } = useGetOPCRItemsQuery({
    pathParams: {},
    queryParams: { includeRatings: true },
  })
  const opcrItems = useMemo(
    () => getOPCRItemsFromResponse(opcrItemsData),
    [opcrItemsData],
  )

  const opcrReferences = useMemo(
    () => buildOPCRReferencesFromApi(opcrs, opcrItems),
    [opcrs, opcrItems],
  )

  useEffect(() => {
    setAvailableOpcrs(opcrReferences)
  }, [opcrReferences, setAvailableOpcrs])

  const calc = usePerformanceCalculation(currentSession)

  const [selectedMOV, setSelectedMOV] = useState<MOVFile | null>(null)
  const [rejectionOpen, setRejectionOpen] = useState(false)
  const [selectedOffice, setSelectedOffice] = useState<OPCRReference | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { data: selectedOpcrResponse, isLoading: isSelectedOpcrLoading } = useOPCR({
    pathParams: { id: selectedOffice?.id ?? '' },
    queryParams: {},
    enabled: !!selectedOffice?.id,
  })
  const selectedOpcr = selectedOpcrResponse?.data ?? null

  const [lastLoadedOpcrId, setLastLoadedOpcrId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedOffice || !selectedOpcr) {
      if (!selectedOffice) {
        setLastLoadedOpcrId(null)
      }
      return
    }

    if (lastLoadedOpcrId !== selectedOffice.id) {
      loadSession(
        selectedOffice.id,
        currentUser.id,
        currentUser.name,
        kpiMeasurements,
        masterKpis,
        selectedOpcr.opcrItems ?? [],
        selectedOpcr.reviewStatus ?? null,
      )
      setLastLoadedOpcrId(selectedOffice.id)
    }
  }, [selectedOffice, selectedOpcr, currentUser, kpiMeasurements, masterKpis, loadSession, lastLoadedOpcrId])

  const createRatingMutation = useCreateRating()
  const updateRatingMutation = useUpdateRating()

  const groupedKPIs = useMemo(() => {
    const groups: Record<KPICategory, KPILineItem[]> = { STRATEGIC: [], CORE: [], SUPPORT: [] }
    if (!currentSession?.kpiItems) return groups
    for (const item of currentSession.kpiItems) {
      groups[item.category].push(item)
    }
    return groups
  }, [currentSession?.kpiItems])

  const handleSelectOffice = (office: OPCRReference) => {
    setSelectedOffice(office)
    setSelectedMOV(null)
    setValidationError(null)
  }

  // If no office is selected, show the office list
  if (!selectedOffice) {
    if (isOPCRsLoading || isOPCRItemsLoading) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-8 w-8 mb-2 animate-spin opacity-60" />
            <p className="font-medium">Loading offices...</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-50 to-purple-5 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-xl">PMT Review & Finalization</CardTitle>
                <CardDescription className="mt-1">
                  Select an office to begin review
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Office List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              List of Offices
            </CardTitle>
            <CardDescription>
              Click on an office to view and rate the performance of its delivery unit head
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableOpcrs.map((office) => (
                <button
                  key={office.id}
                  onClick={() => handleSelectOffice(office)}
                  className="text-left p-4 rounded-lg border border-purple-200 bg-purple-50/30 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                        {office.deliveryUnitName}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {office.kpiCount} KPIs
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs bg-white">
                          FY {office.fiscalYear}
                        </Badge>
                        {(() => {
                          const badge = getReviewStatusBadge(office.reviewStatus)
                          return (
                            <Badge className={`text-[10px] border ${badge.className}`}>
                              {badge.label}
                            </Badge>
                          )
                        })()}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSelectedOpcrLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 mb-2 animate-spin opacity-60" />
          <p className="font-medium">Loading office evaluation details...</p>
        </CardContent>
      </Card>
    )
  }

  if (!currentSession) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Info className="mx-auto h-8 w-8 mb-2 opacity-40" />
          <p>No active session. Please select an office first.</p>
        </CardContent>
      </Card>
    )
  }

  const isEditable = currentSession.status === 'SUBMITTED_FOR_REVIEW'

  const handleUpdateFinalRating = async (
    kpiId: string,
    field: keyof QETRating,
    value: number | null,
  ) => {
    updateFinalRating(kpiId, field, value)

    if (value === null || !isEditable) return

    const kpiItem = currentSession.kpiItems.find((item) => item.id === kpiId)
    if (!kpiItem) return

    const measurementId = kpiItem.fyActiveKPIMeasurementId
    if (!measurementId) {
      console.error('No fyActiveKPIMeasurementId found for rating', field, 'on item', kpiId)
      return
    }

    // Determine the existing rating record ID for this dimension
    const dimensionKey = field === 'quality' ? 'qualityId' : field === 'efficiency' ? 'efficiencyId' : 'timelinessId'
    const existingRatingId = kpiItem.selfRating[dimensionKey] ?? kpiItem.finalRating[dimensionKey]

    try {
      if (existingRatingId) {
        // Rating record exists (from self-rating) – update via PUT /ratings/:id
        await updateRatingMutation.mutateAsync({
          itemId: kpiItem.id,
          ratingId: existingRatingId,
          payload: {
            pmtRating: value,
            pmtRemark: kpiItem.finalizationRemark ?? '',
          },
        })
      } else {
        // No existing rating – create via POST /ratings
        await createRatingMutation.mutateAsync({
          itemId: kpiItem.id,
          payload: {
            opcrItemId: kpiItem.id,
            fyActiveKPIMeasurementId: measurementId,
            pmtRating: value,
            pmtRemark: kpiItem.finalizationRemark ?? '',
          },
        })
      }
      toast.success('PMT rating saved')
    } catch (error) {
      console.error('Failed to save PMT rating:', error)
      toast.error('Failed to save PMT rating')
    }
  }

  const handleUpdatePMTRemark = async (kpiId: string, remark: string) => {
    updateFinalizationRemark(kpiId, remark)

    if (!isEditable) return

    const kpiItem = currentSession.kpiItems.find((item) => item.id === kpiId)
    if (!kpiItem) return

    const measurementId = kpiItem.fyActiveKPIMeasurementId
    if (!measurementId) {
      console.error('No fyActiveKPIMeasurementId found for remark on item', kpiId)
      return
    }

    // Find any existing rating ID to attach remark to (prefer quality > efficiency > timeliness)
    const existingRatingId =
      kpiItem.selfRating.qualityId ??
      kpiItem.selfRating.efficiencyId ??
      kpiItem.selfRating.timelinessId ??
      kpiItem.finalRating.qualityId ??
      kpiItem.finalRating.efficiencyId ??
      kpiItem.finalRating.timelinessId

    // Get the current numerical rating (PMT final, or fall back to self)
    const currentRating =
      kpiItem.finalRating.quality ??
      kpiItem.finalRating.efficiency ??
      kpiItem.finalRating.timeliness ??
      kpiItem.selfRating.quality ??
      kpiItem.selfRating.efficiency ??
      kpiItem.selfRating.timeliness ??
      0

    try {
      if (existingRatingId) {
        // Rating record exists – update via PUT /ratings/:id
        await updateRatingMutation.mutateAsync({
          itemId: kpiItem.id,
          ratingId: existingRatingId,
          payload: {
            pmtRating: currentRating,
            pmtRemark: remark,
          },
        })
      } else {
        // No existing record – create via POST /ratings
        await createRatingMutation.mutateAsync({
          itemId: kpiItem.id,
          payload: {
            opcrItemId: kpiItem.id,
            fyActiveKPIMeasurementId: measurementId,
            pmtRating: currentRating,
            pmtRemark: remark,
          },
        })
      }
      toast.success('PMT remark saved')
    } catch (error) {
      console.error('Failed to save PMT remark:', error)
      toast.error('Failed to save PMT remark')
    }
  }

  const handleApprove = async () => {
    // Check if there are any ratings (self or final) at all
    const itemsWithRatings = currentSession.kpiItems.filter(item => 
      (item.selfRating.average !== null) || (item.finalRating.average !== null)
    )
    
    if (itemsWithRatings.length === 0) {
      setValidationError('Cannot post without any self-rating or final ratings. Please ensure at least one rating exists before posting.')
      return
    }
    
    // Only require remarks for items that have ratings
    const missingRemarks = itemsWithRatings.filter(item => !item.finalizationRemark?.trim())
    if (missingRemarks.length > 0) {
      setValidationError(`Remarks required for items with ratings: ${missingRemarks.slice(0, 2).map(item => item.successIndicator).join(', ')}${missingRemarks.length > 2 ? ` + ${missingRemarks.length - 2} more` : ''}`)
      return
    }

    setValidationError(null)
    
    try {
      const reviewStatusUrl = patchOPCRReviewStatusRequest.endpoint.replace(
        ':id',
        selectedOffice!.id,
      )
      await patchOPCRReviewStatusRequest.fetcher({
        finalUrl: reviewStatusUrl,
        payload: {
          reviewStatus: 'Finalized',
        },
      })
      toast.success('OPCR posted and review status updated to Finalized')
      approveFinalization(currentUser.id, currentUser.name)
    } catch (error) {
      console.error('Failed to update review status to Finalized:', error)
      setValidationError('Failed to finalize the review status on the server. Please try again.')
      toast.error('Failed to update review status to Finalized')
    }
  }


  // Check if there are any ratings (self or final) at all
  const hasAnyRatings = currentSession.kpiItems.some(item => 
    (item.selfRating.average !== null) || (item.finalRating.average !== null)
  )

  const handleReturn = async (comment: string) => {
    try {
      const reviewStatusUrl = patchOPCRReviewStatusRequest.endpoint.replace(
        ':id',
        selectedOffice!.id,
      )
      await patchOPCRReviewStatusRequest.fetcher({
        finalUrl: reviewStatusUrl,
        payload: {
          reviewStatus: 'Returned',
        },
      })
      toast.success('OPCR returned for revision')
      returnForRevision(currentUser.id, currentUser.name, comment)
      setRejectionOpen(false)
    } catch (error) {
      console.error('Failed to update review status to Returned:', error)
      setValidationError('Failed to update status on the server. Please try again.')
      toast.error('Failed to update status')
    }
  }

  const handleUnpost = async () => {
    try {
      const reviewStatusUrl = patchOPCRReviewStatusRequest.endpoint.replace(
        ':id',
        selectedOffice!.id,
      )
      await patchOPCRReviewStatusRequest.fetcher({
        finalUrl: reviewStatusUrl,
        payload: {
          reviewStatus: 'Submitted',
        },
      })
      toast.success('OPCR unposted — status reverted to Submitted for Review')
      setLastLoadedOpcrId(null) // force session reload with fresh status
    } catch (error) {
      console.error('Failed to unpost OPCR:', error)
      toast.error('Failed to unpost. Please try again.')
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-purple-5 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {selectedOffice && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOffice(null)}
                    className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                  >
                    ← Back to Offices
                  </Button>
                )}
              </div>
              <CardTitle className="text-xl">PMT Review & Finalization</CardTitle>
              <CardDescription className="mt-1">
                {selectedOffice ? (
                  <>
                    {selectedOffice.deliveryUnitName} · {currentSession.rateeName} · FY {currentSession.fiscalYear}
                  </>
                ) : (
                  <>Select an office to begin review</>
                )}
              </CardDescription>
            </div>
            <WorkflowStatusBadge status={currentSession.status} />
          </div>
        </CardHeader>
      </Card>

      {/* Rating View - shown after office is selected */}
      {selectedOffice && (
        <>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* ── LEFT: KPI Table ────────────────────────────────────────────── */}
        <div className="space-y-6">
          {CATEGORIES.map(category => {
            const items = groupedKPIs[category]
            if (items.length === 0) return null
            const selfCatAvg = calc.categoryAverages.self[category]
            const finalCatAvg = calc.categoryAverages.final[category]

            return (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                      {KPI_CATEGORY_LABELS[category]}
                    </CardTitle>
                    <div className="flex items-center gap-3 text-xs">
                      {selfCatAvg !== null && (
                        <span className="text-muted-foreground">DU self rating avg: <strong>{selfCatAvg.toFixed(2)}</strong></span>
                      )}
                      {finalCatAvg !== null && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                          PMT Rating avg: {finalCatAvg.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-[22%]">Success Indicator</TableHead>
                          <TableHead className="w-[18%] text-left">DU Self Rating (Q/E/T)</TableHead>
                          <TableHead className="w-[18%]">PMT Rating (Q/E/T)</TableHead>
                          <TableHead className="w-[10%] text-center">PMT Avg</TableHead>
                          <TableHead className="w-[15%]">Remark</TableHead>
                          <TableHead className="w-[18%]">MOV</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(item => (
                          <PMTTableRow
                            key={item.id}
                            item={item}
                            isEditable={isEditable}
                            selectedMOV={selectedMOV}
                            setSelectedMOV={setSelectedMOV}
                            handleUpdateFinalRating={handleUpdateFinalRating}
                            handleUpdatePMTRemark={handleUpdatePMTRemark}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* ── RIGHT: MOV Preview ─────────────────────────────────────────── */}
        <div className="xl:sticky xl:top-4 xl:h-fit">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">MOV Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <MOVPreviewPanel file={selectedMOV} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Computed summary */}
      {(calc.finalRatingScore.final !== null || calc.finalRatingScore.self !== null) && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6 flex-wrap">
                {CATEGORIES.map(cat => (
                  <div key={cat} className="text-center">
                    <p className="text-xs text-muted-foreground">{KPI_CATEGORY_LABELS[cat]}</p>
                    <p className="text-base font-bold text-slate-700">
                      DU self rating: {calc.categoryAverages.self[cat]?.toFixed(2) ?? '—'}
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      PMT Rating: {calc.categoryAverages.final[cat]?.toFixed(2) ?? '—'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-muted-foreground">Final Rating Score</p>
                <p className="text-3xl font-black text-purple-700">
                  {(calc.finalRatingScore.final ?? calc.finalRatingScore.self)?.toFixed(2) ?? '—'}
                </p>
                <AdjectivalBadge rating={calc.adjectivalRating.final ?? calc.adjectivalRating.self} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {validationError && (
        <Alert variant="soft" color="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Action buttons – editable (Submitted for Review) */}
      {isEditable && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          <Button
            variant="outline"
            className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/5"
            onClick={() => setRejectionOpen(true)}
          >
            <RotateCcw className="h-4 w-4" />
            Return for Revision
          </Button>
          <div className="flex gap-2">
            <Button 
              className="gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleApprove}
              disabled={!hasAnyRatings}
            >
              <CheckCircle className="h-4 w-4" />
              Post
            </Button>
          </div>
        </div>
      )}

      {/* Unpost button – visible when Posted/Finalized (for testing) */}
      {currentSession.status === 'FINALIZED' && selectedOffice && (
        <div className="flex items-center justify-end gap-3 pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 flex-1">
            <span className="font-medium">⚠ Testing only:</span> This OPCR is Posted. Use Unpost to revert status back to Submitted for Review.
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-50 whitespace-nowrap"
            onClick={handleUnpost}
          >
            <RotateCcw className="h-4 w-4" />
            Unpost
          </Button>
        </div>
      )}

      {/* Rejection drawer */}
      <RejectionDrawer
        open={rejectionOpen}
        onOpenChange={setRejectionOpen}
        onConfirm={handleReturn}
      />
        </>
      )}
    </div>
  )
}
