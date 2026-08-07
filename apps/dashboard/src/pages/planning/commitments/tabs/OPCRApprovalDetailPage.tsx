import {
  ArrowLeft,
  Target,
  Calendar,
  FileText,
  Building,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getOPCRRequest } from '@/features/planning/opcr/handlers/getOPCRRequest'
import { OPCR, OPCRActivity, OPCRItem } from '@/features/planning/opcr/types'

const useOPCR = createQueryHookFromTemplate(getOPCRRequest)

// ─── Utility Functions ───────────────────────────────────────────────
const getStatusIcon = (status: string | null | undefined) => {
  const statusLower = status?.toLowerCase()
  switch (statusLower) {
    case 'approved':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'draft':
      return <Clock className="h-4 w-4 text-gray-500" />
    case 'submitted':
      return <Clock className="h-4 w-4 text-blue-500" />
    case 'returned':
    case 'rejected':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusBadge = (status: string | null | undefined) => {
  const statusLower = status?.toLowerCase()
  const statusStyles: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    returned: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return (
    <Badge
      className={statusStyles[statusLower || ''] || 'bg-gray-100 text-gray-800'}
    >
      {statusLower?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
    </Badge>
  )
}

const getPriorityBadge = (kpiCount: number) => {
  const priority = kpiCount > 5 ? 'high' : kpiCount > 2 ? 'medium' : 'low'
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  }
  return <Badge className={colors[priority]}>{priority.toUpperCase()}</Badge>
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'N/A'
  }
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(value)
}

const calculateDueDate = (submittedDate: string | null | undefined): string => {
  if (!submittedDate) {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    return formatDate(futureDate.toISOString())
  }
  const date = new Date(submittedDate)
  date.setMonth(date.getMonth() + 1)
  return formatDate(date.toISOString())
}

// ─── Component ───────────────────────────────────────────────────────
export function OPCRApprovalDetailPage({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { opcrId?: string }
  const [expandedKPIs, setExpandedKPIs] = useState<Set<string>>(new Set())

  // Fetch OPCR data using ID from URL search params
  const {
    data: opcr,
    isLoading,
    isError,
    error,
  } = useOPCR({
    pathParams: { id: search.opcrId || '' },
    queryParams: {},
  })

  const toggleKPIExpansion = (kpiId: string) => {
    const newExpanded = new Set(expandedKPIs)
    if (newExpanded.has(kpiId)) {
      newExpanded.delete(kpiId)
    } else {
      newExpanded.add(kpiId)
    }
    setExpandedKPIs(newExpanded)
  }

  const handleBack = async () => {
    if (onBack) {
      onBack()
    } else {
      await navigate({
        from: '/v2/commitments',
        search: (prev) => ({
          ...prev,
          opcrId: undefined,
        }),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Loading OPCR details...</p>
        </div>
      </div>
    )
  }

  if (isError || !opcr?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-red-200 p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              Error Loading OPCR
            </h2>
          </div>
          <p className="text-red-700 mb-6">
            {error instanceof Error
              ? error.message
              : 'Failed to load OPCR details. Please try again.'}
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
        </div>
      </div>
    )
  }

  const opcrData = opcr.data
  const kpiCount = opcrData.kpiAssignmentCount
  const activityCount =
    opcrData.activityCount ?? opcrData.opcrActivities?.length ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {opcrData.name}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  OPCR ID: {opcrData.id} • Office:{' '}
                  {opcrData.office?.name || opcrData.deliveryUnit?.office?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(opcrData.commitmentStatus)}
              {getStatusBadge(opcrData.commitmentStatus)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* SECTION 1 — OPCR BASIC INFORMATION */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              OPCR Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* OPCR Name */}
              <div>
                <label className="text-sm font-medium text-slate-600">
                  OPCR Name
                </label>
                <p className="text-base font-semibold text-slate-900 mt-2">
                  {opcrData.name}
                </p>
              </div>

              {/* Office */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Office
                </label>
                <p className="text-base font-semibold text-slate-900 mt-2">
                  {opcrData.office?.name ||
                    opcrData.deliveryUnit?.office?.name ||
                    'N/A'}
                </p>
              </div>

              {/* Fiscal Year */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fiscal Year
                </label>
                <p className="text-base font-semibold text-slate-900 mt-2">
                  {opcrData.fiscalYear?.year || 'N/A'}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Status
                </label>
                <div className="mt-2 flex items-center gap-2">
                  {getStatusIcon(opcrData.commitmentStatus)}
                  {getStatusBadge(opcrData.commitmentStatus)}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Priority
                </label>
                <div className="mt-2">{getPriorityBadge(kpiCount)}</div>
              </div>

              {/* Total Budget */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Budget
                </label>
                <p className="text-base font-semibold text-slate-900 mt-2">
                  {formatCurrency(opcrData.totalBudget)}
                </p>
              </div>

              {/* Created Date */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Created Date
                </label>
                <p className="text-base text-slate-800 mt-2">
                  {formatDate(opcrData.createdDate)}
                </p>
              </div>

              {/* Submitted Date */}
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Submitted Date
                </label>
                <p className="text-base text-slate-800 mt-2">
                  {opcrData.submittedDate
                    ? formatDate(opcrData.submittedDate)
                    : 'Not submitted'}
                </p>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Due Date
                </label>
                <p className="text-base text-slate-800 mt-2">
                  {calculateDueDate(opcrData.submittedDate)}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2 — SUMMARY STATISTICS */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Summary Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {kpiCount}
                </div>
                <div className="text-sm text-blue-800">Total KPIs</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {activityCount}
                </div>
                <div className="text-sm text-green-800">Total Activities</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(opcrData.totalBudget)}
                </div>
                <div className="text-sm text-purple-800">Total Budget</div>
              </div>
            </div>
          </div>

          {/* SECTION 3 — KPIs AND ACTIVITIES */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              KPIs and Activities
            </h2>

            {(opcrData.opcrItems?.length || 0) > 0 ? (
              <div className="space-y-4">
                {opcrData.opcrItems?.map((opcrItem: OPCRItem) => (
                  <div key={opcrItem.id} className="border rounded-lg">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-4 hover:bg-gray-50"
                          onClick={() => toggleKPIExpansion(opcrItem.id)}
                        >
                          {expandedKPIs.has(opcrItem.id) ? (
                            <ChevronDown className="h-4 w-4 mr-2" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2" />
                          )}
                          <div className="text-left">
                            <div className="font-medium">
                              {/* {opcrItem.KPI?.name || opcrItem.kpiName || 'N/A'} */}
                              {opcrItem.kpiAssignment?.fyActiveKPI?.name ||
                                'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {opcrItem.kpiAssignment?.fyActiveKPI
                                ?.description || 'N/A'}
                            </div>
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="space-y-3">
                          <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                            <div className="text-sm text-blue-900">
                              <span className="font-medium">
                                Annual Target:
                              </span>{' '}
                              {opcrItem.assignedTargetAnnual ||
                                opcrItem.allocatedTargetValue ||
                                'N/A'}
                            </div>
                            <div className="text-sm text-blue-700 mt-1">
                              <span className="font-medium">
                                Q1: {opcrItem.assignedTargetQ1 || 'N/A'}
                              </span>
                              {' | '}
                              <span className="font-medium">
                                Q2: {opcrItem.assignedTargetQ2 || 'N/A'}
                              </span>
                              {' | '}
                              <span className="font-medium">
                                Q3: {opcrItem.assignedTargetQ3 || 'N/A'}
                              </span>
                              {' | '}
                              <span className="font-medium">
                                Q4: {opcrItem.assignedTargetQ4 || 'N/A'}
                              </span>
                            </div>
                            <div className="text-sm text-blue-700 mt-1">
                              <span className="font-medium">
                                Function Category:
                              </span>{' '}
                              {opcrItem.KPI?.functionCategory ||
                                opcrItem.functionCategory ||
                                'N/A'}
                            </div>
                          </div>

                          {opcrItem.opcrActivities &&
                            opcrItem.opcrActivities.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm mb-2">
                                  Activities:
                                </h5>
                                <div className="space-y-2">
                                  {opcrItem.opcrActivities
                                    .slice(0, 3)
                                    .map((activity: OPCRActivity) => (
                                      <div
                                        key={activity.id}
                                        className="bg-white p-3 rounded border"
                                      >
                                        <div className="font-medium text-sm">
                                          {activity.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {activity.description}
                                        </div>
                                      </div>
                                    ))}
                                  {opcrItem.opcrActivities.length > 3 && (
                                    <div className="text-xs text-muted-foreground p-2">
                                      +{opcrItem.opcrActivities.length - 3} more
                                      activities
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No KPIs found for this OPCR
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
