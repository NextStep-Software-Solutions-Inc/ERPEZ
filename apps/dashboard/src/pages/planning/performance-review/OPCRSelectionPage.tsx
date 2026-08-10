/**
 * Performance Review – Step 1: OPCR Selection Page
 * Select fiscal year, delivery unit, load approved OPCR, start evaluation.
 * Follows Procurement Library page layout patterns.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PlayCircle,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { usePerformanceReviewStore } from '@/features/planning/performance-review/store/performanceReviewStore'
import type { OPCRReference } from '@/features/planning/performance-review/types'
import { useKpiMeasurements } from '@/features/planning/kpi-measurement-configurator/handlers/hooks'
import { useKpis } from '@/features/planning/master-kpi/handlers/hooks'
import {
  getOPCRItemsFromResponse,
  useGetOPCRItemsQuery,
  useOPCRs,
} from '@/lib/opcr'
import { useKeycloak } from '@/providers/KeycloakProvider'
import { buildOPCRReferencesFromApi } from '@/features/planning/performance-review/utils/opcrReferences'

function getCommitmentStatusBadge(status?: string) {
  const normalized = status?.toLowerCase() || 'draft'
  const badgeColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }
  const labelMap: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return {
    label: labelMap[normalized] || status || 'Draft',
    className: badgeColors[normalized] || 'bg-slate-100 text-slate-700 border-slate-200',
  }
}

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
    submitted: 'Submitted',
    returned: 'Returned',
    finalized: 'Finalized',
  }
  return {
    label: labelMap[normalized] || 'Pending',
    className: badgeColors[normalized] || 'bg-amber-100 text-amber-700 border-amber-200',
  }
}

function isEvaluationViewOnly(opcr: OPCRReference) {
  if (opcr.selfRatingDone) return true
  const status = opcr.reviewStatus
  if (status === null || status === undefined) return false
  const reviewBadge = getReviewStatusBadge(status)
  const normalized = reviewBadge.label.toLowerCase()
  return normalized === 'submitted' || normalized === 'finalized'
}

export default function OPCRSelectionPage() {
  const { keycloak, userName, email, firstName, lastName } = useKeycloak()
  const currentUser = useMemo(() => {
    const displayName = [firstName, lastName].filter(Boolean).join(' ').trim()

    return {
      id: keycloak?.subject ?? email ?? userName ?? 'current-user',
      name: displayName || userName || email || 'Current User',
    }
  }, [email, firstName, keycloak?.subject, lastName, userName])

  const {
    selectedFiscalYear,
    selectedDeliveryUnitId,
    availableOpcrs,
    setSelectedFiscalYear,
    setSelectedDeliveryUnitId,
    setAvailableOpcrs,
    loadSession,
    setActiveStep,
    currentSession,
  } = usePerformanceReviewStore()

  const { data: opcrsData, isLoading: isOPCRsLoading } = useOPCRs({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })
  const opcrs = opcrsData?.data ?? []

  const { data: opcrItemsData, isLoading: isOPCRItemsLoading } =
    useGetOPCRItemsQuery({
      pathParams: {},
      queryParams: {},
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

  const [selectedOpcr, setSelectedOpcr] = useState<OPCRReference | null>(null)

  const fiscalYears = useMemo(
    () =>
      Array.from(
        new Set(availableOpcrs.map((opcr) => opcr.fiscalYear).filter(Boolean)),
      ).sort((a, b) => b.localeCompare(a)),
    [availableOpcrs],
  )

  const deliveryUnits = useMemo(
    () =>
      Array.from(
        availableOpcrs
          .reduce((units, opcr) => {
            if (opcr.deliveryUnitId && opcr.deliveryUnitName) {
              units.set(opcr.deliveryUnitId, {
                id: opcr.deliveryUnitId,
                name: opcr.deliveryUnitName,
              })
            }
            return units
          }, new Map<string, { id: string; name: string }>())
          .values(),
      ).sort((a, b) => a.name.localeCompare(b.name)),
    [availableOpcrs],
  )

  useEffect(() => {
    if (selectedFiscalYear && !fiscalYears.includes(selectedFiscalYear)) {
      setSelectedFiscalYear('')
    }
  }, [fiscalYears, selectedFiscalYear, setSelectedFiscalYear])

  // Filter OPCRs based on selections
  const filteredOpcrs = availableOpcrs.filter((o) => {
    const matchYear = !selectedFiscalYear || o.fiscalYear === selectedFiscalYear
    const matchDu =
      !selectedDeliveryUnitId || o.deliveryUnitId === selectedDeliveryUnitId
    return matchYear && matchDu && o.status === 'APPROVED'
  })

  const handleStartEvaluation = () => {
    if (!selectedOpcr) return
    loadSession(
      selectedOpcr.id,
      currentUser.id,
      currentUser.name,
      kpiMeasurements,
      masterKpis,
      opcrItems,
    )
    setActiveStep(0)
  }

  if (isOPCRsLoading || isOPCRItemsLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 mb-2 animate-spin opacity-60" />
          <p className="font-medium">Loading approved OPCRs...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Existing session notice */}
      {currentSession && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Active session: {currentSession.deliveryUnitName} — FY{' '}
                    {currentSession.fiscalYear}
                  </p>
                  <p className="text-xs text-amber-700">
                    Status:{' '}
                    <strong>{currentSession.status.replace(/_/g, ' ')}</strong>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStep(0)}
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Select OPCR for Evaluation
          </CardTitle>
          <CardDescription>
            Choose the fiscal year and delivery unit, then load the approved
            OPCR to begin performance rating.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="fiscal-year"
                className="flex items-center gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                Fiscal Year
              </Label>
              <Select
                value={selectedFiscalYear || '_all'}
                onValueChange={(value) =>
                  setSelectedFiscalYear(value === '_all' ? '' : value)
                }
              >
                <SelectTrigger id="fiscal-year">
                  <SelectValue placeholder="Select fiscal year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Fiscal Years</SelectItem>
                  {fiscalYears.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="delivery-unit"
                className="flex items-center gap-1.5"
              >
                <Building2 className="h-3.5 w-3.5" />
                Delivery Unit
              </Label>
              <Select
                value={selectedDeliveryUnitId || '_all'}
                onValueChange={(value) =>
                  setSelectedDeliveryUnitId(value === '_all' ? '' : value)
                }
              >
                <SelectTrigger id="delivery-unit">
                  <SelectValue placeholder="Select delivery unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Units</SelectItem>
                  {deliveryUnits.map((du) => (
                    <SelectItem key={du.id} value={du.id}>
                      {du.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* OPCR Results Table */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              OPCRs ({filteredOpcrs.length} found)
            </Label>

            {filteredOpcrs.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No approved OPCRs found for the selected criteria.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        OPCR Title
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Delivery Unit
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                        KPIs
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                        Commitment Status
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                        Review Status
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOpcrs.map((opcr) => {
                      const commitmentBadge = getCommitmentStatusBadge(opcr.commitmentStatus)
                      const reviewBadge = getReviewStatusBadge(opcr.reviewStatus)

                      return (
                        <tr
                          key={opcr.id}
                          className={`border-t cursor-pointer transition-colors ${
                            selectedOpcr?.id === opcr.id
                              ? 'bg-primary/5 border-primary/20'
                              : 'hover:bg-muted/30'
                          }`}
                          onClick={() => setSelectedOpcr(opcr)}
                        >
                          <td className="px-4 py-3 font-medium">
                            {opcr.title}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {opcr.deliveryUnitName}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="outline" className="text-xs">
                              {opcr.kpiCount} KPIs
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              variant="outline"
                              className={`${commitmentBadge.className} text-xs`}
                            >
                              {commitmentBadge.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              variant="outline"
                              className={`${reviewBadge.className} text-xs`}
                            >
                              {reviewBadge.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant={
                                selectedOpcr?.id === opcr.id
                                  ? 'default'
                                  : 'outline'
                              }
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedOpcr(opcr)
                              }}
                            >
                              {selectedOpcr?.id === opcr.id
                                ? '✓ Selected'
                                : isEvaluationViewOnly(opcr)
                                  ? 'View'
                                  : 'Select'}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action */}
          {selectedOpcr && (
            <div className="flex items-center justify-between rounded-lg border bg-primary/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium">
                  Selected: {selectedOpcr.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedOpcr.kpiCount} KPI items · FY{' '}
                  {selectedOpcr.fiscalYear}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`${getReviewStatusBadge(selectedOpcr.reviewStatus).className} text-xs`}
              >
                {getReviewStatusBadge(selectedOpcr.reviewStatus).label}
              </Badge>
              <Button onClick={handleStartEvaluation} className="gap-2">
                <PlayCircle className="h-4 w-4" />
                {isEvaluationViewOnly(selectedOpcr)
                  ? 'View Evaluation'
                  : 'Start Evaluation'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
