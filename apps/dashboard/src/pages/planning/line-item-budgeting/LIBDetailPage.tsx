import { useState } from 'react'
import {
  ArrowLeft,
  Download,
  Eye,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Wallet,
  Coins,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getLIBRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/getLIBRequest'
import { getLIBActivitiesRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/getLIBActivitiesRequest'
import { getWFPRequest } from '@/components/features/planning/wfp/wfp/handlers/getWFPRequest'
import { getOPCRRequest, OPCRActivity } from '@/features/planning/opcr'
import { OPCRActivityDetails } from '@/features/planning/opcr/components/OPCRActivityDetails'
import { formatCurrencyPHP } from '@/utils/formatters'
import CreateLIBActivityDialog from '../../../features/planning/line-item-budgeting/line-item-budget/dialogs/CreateLIBActivityDialog'
import { LIBActivityActionMenu } from '@/features/planning/line-item-budgeting/line-item-budget/components/LIBActivityActionMenu'
import { deleteLIBActivityRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/deleteLIBActivityRequest'
import { deleteLineItemBudgetDetailsRequest } from '@/features/planning/line-item-budgeting/line-item-budget-details/handlers/deleteLineItemBudgetDetailsRequest'
import type {
  LIBActivity,
  OrphanLineItemDetail,
} from '@/features/planning/line-item-budgeting/line-item-budget/types'
import LIBItemExpenditures from '@/features/planning/line-item-budgeting/line-item-budget/components/LIBItemExpenditures'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  WFPObjectiveActivity,
  WFPObjectiveActivityExpenditure,
} from '@/features/planning/wfp/types/type.wfp'
import OrphanLineItemsView from '@/features/planning/line-item-budgeting/line-item-budget-details/components/OrphanLineItemsView'
import GroupedExpenditureItemsView from '@/features/planning/line-item-budgeting/line-item-budget-details/components/GroupedExpenditureItemsView'
import { groupExpenditureItems } from '@/features/planning/line-item-budgeting/line-item-budget-details/utils/groupExpenditureData'
import type { LineItemBudgetDetails } from '@/features/planning/line-item-budgeting/line-item-budget-details/types/types'
import { updateLIBStatusRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/updateLIBStatusRequest'
import { generateLIBDocumentRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/generateLIBDocumentRequest'
import { downloadLIBDocumentRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/downloadLIBDocumentRequest'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LIBSummaryDialog } from './dialogs/LIBSummaryDialog'
import { LIBHistoryDialog } from './dialogs/LIBHistoryDialog'
import { LayoutDashboard, History, Check, X } from 'lucide-react'
import { LIBApprovalDialog, LIBReadinessCard } from '@/features/planning/line-item-budgeting/line-item-budget/components'


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSourceTypeColor = (sourceType: string) => {
  switch (sourceType) {
    case 'OPCR':
      return 'bg-blue-100 text-blue-700'
    case 'WFP':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-700'
    case 'Rejected':
      return 'bg-red-100 text-red-700'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'Returned':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const useLIB = createQueryHookFromTemplate(getLIBRequest)
const useWFP = createQueryHookFromTemplate(getWFPRequest)
const useOPCR = createQueryHookFromTemplate(getOPCRRequest)
const useLIBActivities = createQueryHookFromTemplate(getLIBActivitiesRequest)

const useDeleteLIBActivity = createMutationHookFromTemplate(
  deleteLIBActivityRequest,
)
const useDeleteLineItemBudgetDetails = createMutationHookFromTemplate(
  deleteLineItemBudgetDetailsRequest,
)
const useUpdateLIBStatus = createMutationHookFromTemplate(
  updateLIBStatusRequest,
)
const useGenerateLIBDocument = createMutationHookFromTemplate(
  generateLIBDocumentRequest,
)
const useDownloadLIBDocument = createMutationHookFromTemplate(
  downloadLIBDocumentRequest,
)

export default function LIBDetailPage({
  onBack = () => { },
  onEdit = () => { },
}: {
  onBack?: () => void
  onEdit?: () => void
} = {}) {
  const navigation = useNavigate({ from: '/v2/line-item-budgeting' })
  const { libId, libActivityId } = useSearch({
    from: '/v2/line-item-budgeting',
  })
  const queryClient = useQueryClient()
  const [selectedActivity, setSelectedActivity] = useState<OPCRActivity | null>(
    null,
  )
  // const { mutateAsync: updateActivity, isPending: isUpdating } =
  //   useUpdateLIBActivity()
  const { mutateAsync: deleteActivity, isPending: isDeleting } =
    useDeleteLIBActivity()
  const { mutateAsync: deleteLineItemBudgetDetails } =
    useDeleteLineItemBudgetDetails()
  const { mutateAsync: updateLIBStatus, isPending: isLibSubmitting } =
    useUpdateLIBStatus()
  const { mutateAsync: generateLIBDocument } = useGenerateLIBDocument()
  const { mutateAsync: downloadLIBDocument } = useDownloadLIBDocument()

  const isSubmitting = isLibSubmitting
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false)
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [approvalDialogState, setApprovalDialogState] = useState<{
    open: boolean
    action: 'approve' | 'reject'
    libId: string | null
    libName: string
  }>({
    open: false,
    action: 'approve',
    libId: null,
    libName: '',
  })
  const [deletingOrphanItemId, setDeletingOrphanItemId] = useState<
    string | null
  >(null)

  const handleExport = async (format: 'Excel' | 'Pdf') => {
    if (!libId) return
    setIsExporting(true)

    const exportPromise = (async () => {
      const genResponse = await generateLIBDocument({
        pathParams: { libId },
        queryParams: { format }
      })

      const documentId = genResponse.data
      if (!documentId) {
        throw new Error('No document ID returned from generation API')
      }

      const downloadResponse = await downloadLIBDocument({
        pathParams: { documentId }
      })

      const blob = downloadResponse.blob

      const fileExtension = format === 'Excel' ? 'xlsx' : 'pdf'
      const filename = lib?.libNumber
        ? `${lib.libNumber}.${fileExtension}`
        : `LIB_${libId}.${fileExtension}`

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    })()

    toast.promise(exportPromise, {
      loading: `Generating and downloading ${format} document...`,
      success: `${format} document downloaded successfully!`,
      error: (err) => err instanceof Error ? err.message : `Failed to export document.`,
    })

    try {
      await exportPromise
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    data: libData,
    isLoading,
    error,
    refetch,
  } = useLIB({
    pathParams: { id: libId || '' },
    queryParams: {},
    enabled: !!libId,
  })

  // Fetch LIB Activities filtered by libId
  const { data: libActivitiesData, isLoading: isLIBActivitiesLoading } =
    useLIBActivities({
      pathParams: {},
      queryParams: {
        filters: `lineItemBudgetId==${libId}`,
      },
      enabled: !!libId,
    })

  const lib = libData?.data
  const displayActivities = libActivitiesData?.data || []
  const { data: opcrData, isLoading: isOPCRLoading } = useOPCR({
    pathParams: { id: libData?.data.sourceId || '' },
    queryParams: {},
    enabled: !!libData?.data.sourceId && libData?.data.sourceType === 'OPCR',
  })
  const { data: wfpData, isLoading: isWFPLoading } = useWFP({
    pathParams: { id: libData?.data.sourceId || '' },
    queryParams: {},
    enabled: !!libData?.data.sourceId && libData?.data.sourceType === 'WFP',
  })

  // Helper function to calculate WFP activity budget from expenditures
  const calculateWFPBudget = (
    wfpObjectiveActivity: WFPObjectiveActivity,
  ): number => {
    if (!wfpObjectiveActivity?.wfpObjectiveActivityExpenditures) return 0
    return wfpObjectiveActivity.wfpObjectiveActivityExpenditures.reduce(
      (sum: number, expenditure: WFPObjectiveActivityExpenditure) => {
        const quantity = expenditure.quantity || 0
        const unitCost = expenditure.unitCost || 0
        return sum + quantity * unitCost
      },
      0,
    )
  }

  const totalBudgetFromSource =
    lib?.sourceType === 'OPCR'
      ? (opcrData?.data?.totalBudget ?? lib?.totalAmount)
      : lib?.sourceType === 'WFP'
        ? (wfpData?.data?.proposedBudget ?? lib?.totalAmount)
        : lib?.totalAmount

  //Calculate total amount from all activities added from each activities's expenditures
  const activityDetailsBudget = lib?.activities?.reduce(
    (total, activity) =>
      total +
      (activity?.details || [])?.reduce(
        (detailTotal, detail) => detailTotal + (detail.budget ?? 0),
        0,
      ),
    0,
  ) ?? 0

  const orphanDetailsBudget = (lib?.orphanDetails as OrphanLineItemDetail[] | undefined)?.reduce(
    (total, detail) => total + (detail.budget ?? 0),
    0,
  ) ?? 0

  const totalActivitiesDetailBudget = activityDetailsBudget + orphanDetailsBudget
  const proposedLibTotalBudget = Math.max(totalActivitiesDetailBudget, lib?.totalAmount ?? 0)

  // Check if LIB is ready for submission (proposed totalBudget >= OPCR/Source totalBudget)
  const isReadyForSubmission =
    totalBudgetFromSource !== undefined && totalBudgetFromSource > 0
      ? proposedLibTotalBudget >= totalBudgetFromSource
      : proposedLibTotalBudget > 0 || (lib?.activities && lib.activities.length > 0)

  const activityCount = lib?.activities?.length ?? 0
  const opcrActivityCount = opcrData?.data?.activityCount

  const shouldShowCreateDialog =
    !isOPCRLoading &&
    !!lib?.sourceType &&
    opcrActivityCount !== undefined &&
    activityCount !== opcrActivityCount

  const shouldShowCreateWFPOObjectiveDialog =
    !isWFPLoading &&
    !!lib?.sourceType &&
    wfpData?.data?.activityCount !== undefined &&
    activityCount !== wfpData?.data?.activityCount
  // Show activity details if one is selected
  if (selectedActivity) {
    return (
      <OPCRActivityDetails
        activity={selectedActivity}
        onBack={() => setSelectedActivity(null)}
      />
    )
  }
  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading LIB details...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !lib) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load LIB
          </h3>
          <p className="text-gray-600 mb-6">
            An error occurred while loading the LIB details.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  if (libId && libActivityId) {
    return (
      <LIBItemExpenditures
        lib={lib}
        libActivityId={libActivityId}
        libId={libId}
      />
    )
  }

  // Handler for deleting orphan line items
  const handleDeleteOrphanItem = async (item: OrphanLineItemDetail) => {
    setDeletingOrphanItemId(item.id)
    try {
      await deleteLineItemBudgetDetails(
        {
          pathParams: { id: item.id },
        },
        {
          onSuccess: async () => {
            toast.success('Orphan line item deleted successfully!')
            void refetch()
          },
        },
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete line item'
      toast.error(message)
    } finally {
      setDeletingOrphanItemId(null)
    }
  }

  // Handler for submitting LIB
  const handleSubmitLIB = async () => {
    if (!libId) return
    try {
      await updateLIBStatus(
        {
          pathParams: { id: libId },
          queryParams: {},
          payload: { status: 'Submitted' },
        },
        {
          onSuccess: async () => {
            toast.success('LIB submitted for approval successfully!')
            setIsSubmitConfirmOpen(false)
            void refetch()
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].includes('/libs'),
            })
          },
        },
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit LIB'
      toast.error(message)
    }
  }

  // Handler for approving LIB
  const handleApproveLIB = (id: string, name?: string) => {
    setApprovalDialogState({
      open: true,
      action: 'approve',
      libId: id,
      libName: name || lib?.name || 'Line-Item Budget',
    })
  }

  // Handler for rejecting / returning LIB
  const handleRejectLIB = (id: string, name?: string) => {
    setApprovalDialogState({
      open: true,
      action: 'reject',
      libId: id,
      libName: name || lib?.name || 'Line-Item Budget',
    })
  }

  const handleConfirmApproval = async () => {
    if (!approvalDialogState.libId) return
    try {
      const targetStatus =
        approvalDialogState.action === 'approve' ? 'Approved' : 'Returned'
      await updateLIBStatus(
        {
          pathParams: { id: approvalDialogState.libId },
          queryParams: {},
          payload: { status: targetStatus },
        },
        {
          onSuccess: async () => {
            const actionLabel =
              approvalDialogState.action === 'approve'
                ? 'approved'
                : 'returned for revision'
            toast.success(`LIB "${approvalDialogState.libName}" has been ${actionLabel}!`)
            setApprovalDialogState({
              open: false,
              action: 'approve',
              libId: null,
              libName: '',
            })
            void refetch()
            await queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/libs'),
            })
          },
        },
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update LIB status'
      toast.error(message)
    }
  }


  const stats = [
    {
      title: 'Total Amount',
      value: isLIBActivitiesLoading ? (
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-2" />
      ) : (
        formatCurrencyPHP(totalBudgetFromSource)
      ),
      icon: <Wallet className="h-5 w-5" />,
      gradientClass: 'from-blue-50/40 to-white hover:from-blue-50/70',
      borderClass: 'from-blue-400 to-blue-600',
      iconColorClass: 'bg-blue-50 text-blue-600 border border-blue-100',
    },
    {
      title: 'Fiscal Year',
      value:
        typeof lib?.fiscalYear === 'string'
          ? lib.fiscalYear
          : lib?.fiscalYear?.year
            ? lib.fiscalYear.year.toString()
            : wfpData?.data?.projectStartDate && wfpData?.data?.projectEndDate
              ? new Date(wfpData.data.projectStartDate).getFullYear() ===
                new Date(wfpData.data.projectEndDate).getFullYear()
                ? new Date(wfpData.data.projectStartDate).getFullYear().toString()
                : `${new Date(wfpData.data.projectStartDate).getFullYear()} – ${new Date(wfpData.data.projectEndDate).getFullYear()}`
              : 'N/A',
      icon: <Calendar className="h-5 w-5" />,
      gradientClass: 'from-purple-50/40 to-white hover:from-purple-50/70',
      borderClass: 'from-purple-400 to-purple-600',
      iconColorClass: 'bg-purple-50 text-purple-600 border border-purple-100',
    },
    {
      title: 'Expenditures',
      value: isLIBActivitiesLoading ? (
        <Loader2 className="h-8 w-8 animate-spin text-primary mt-2" />
      ) : (
        formatCurrencyPHP(totalActivitiesDetailBudget)
      ),
      icon: <Coins className="h-5 w-5" />,
      gradientClass: 'from-emerald-50/40 to-white hover:from-emerald-50/70',
      borderClass: 'from-emerald-400 to-emerald-600',
      iconColorClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    },
  ]
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Title and Info */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {lib?.libNumber}
                </h1>
                <p className="text-sm text-gray-600 mt-1">{lib?.name}</p>
              </div>
            </div>

            {/* Right Section - Badges and Actions */}
            <div className="flex items-center gap-3">
              <Badge
                className={`${getStatusBadgeColor(lib?.status || '')} px-3 py-1`}
              >
                {lib?.status}
              </Badge>
              <Badge
                className={`${getSourceTypeColor(lib?.sourceType || '')} px-3 py-1`}
              >
                {lib?.sourceType}
              </Badge>

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-indigo-200 text-indigo-700 bg-indigo-50/10 hover:bg-indigo-50/50 hover:text-indigo-800"
                onClick={() => setShowSummary(true)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Ceiling Summary
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${showHistory
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : 'text-slate-650 hover:bg-slate-50'
                  }`}
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-4 h-4" />
                Version History
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onEdit}
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" disabled={isExporting}>
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('Excel')}>
                    Export as Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('Pdf')}>
                    Export as PDF (.pdf)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              // onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Workflow & Submission Readiness Persistent Card */}
        <LIBReadinessCard
          lib={lib}
          isLoading={
            isLoading ||
            (lib?.sourceType === 'OPCR'
              ? isOPCRLoading
              : lib?.sourceType === 'WFP'
                ? isWFPLoading
                : false) ||
            isLIBActivitiesLoading
          }
          onOpenSubmit={() => setIsSubmitConfirmOpen(true)}
          onOpenApprove={
            lib?.status === 'Submitted' ? () => handleApproveLIB(lib.id, lib.name) : undefined
          }
          onOpenReject={
            lib?.status === 'Submitted' ? () => handleRejectLIB(lib.id, lib.name) : undefined
          }
          isSubmitting={isSubmitting}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              gradientClass={stat.gradientClass}
              borderClass={stat.borderClass}
              iconColorClass={stat.iconColorClass}
            />
          ))}
        </div>
        {/* Activities and Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activities Column (left - spans 2) */}
          <div className="lg:col-span-2">
            {lib?.sourceType === 'WFP' && lib?.scope === 'Project' ? (
              // For WFP Project scope: Show Grouped Expenditure Items
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Line Items ({lib?.orphanDetails?.length || 0})
                    </h2>
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                      Project Scope
                    </span>
                  </div>
                  {/* Add Line Item Button for WFP Project scope */}
                  <CreateLIBActivityDialog
                    libId={libId ?? ''}
                    onActivityAdded={() => {
                      void refetch()
                    }}
                    type="WFP"
                    scope={lib?.scope}
                    wfpData={wfpData?.data}
                    isWFPLoading={isWFPLoading}
                  />
                </div>
                {lib?.orphanDetails && lib.orphanDetails.length > 0 ? (
                  <GroupedExpenditureItemsView
                    data={groupExpenditureItems(
                      lib.orphanDetails as unknown as LineItemBudgetDetails[],
                    )}
                    onDeleteItem={async (item: LineItemBudgetDetails) => {
                      setDeletingOrphanItemId(item.id)
                      try {
                        await deleteLineItemBudgetDetails(
                          {
                            pathParams: { id: item.id },
                          },
                          {
                            onSuccess: async () => {
                              toast.success('Line item deleted successfully!')
                              void refetch()
                            },
                          },
                        )
                      } catch (err) {
                        const message =
                          err instanceof Error ? err.message : 'Failed to delete line item'
                        toast.error(message)
                      } finally {
                        setDeletingOrphanItemId(null)
                      }
                    }}
                    isDeletingItemId={deletingOrphanItemId || undefined}
                  />
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center py-12">
                      <p className="text-gray-500 font-medium">
                        No line items found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Click "Add Line Items" to add expenditures
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Activities ({displayActivities?.length || 0})s
                    </h2>
                  </div>
                  {/* Add Activity Button - Only show for OPCR sources */}
                  {shouldShowCreateDialog && (
                    <CreateLIBActivityDialog
                      libId={libId ?? ''}
                      onActivityAdded={() => {
                        void refetch()
                      }}
                      type="OPCR"
                      opcrData={opcrData?.data}
                      existingOPCRActivityIds={
                        (displayActivities || [])
                          .map((a: any) => a.opcrActivityId)
                          .filter(Boolean) as string[]
                      }
                      isOPCRLoading={isOPCRLoading}
                      isWFPLoading={isWFPLoading}
                    />
                  )}
                  {shouldShowCreateWFPOObjectiveDialog && (
                    <CreateLIBActivityDialog
                      libId={libId ?? ''}
                      onActivityAdded={() => {
                        void refetch()
                      }}
                      type="WFP"
                      scope={lib?.scope}
                      wfpData={wfpData?.data}
                      isWFPLoading={isWFPLoading}
                    />
                    // <CreateLineItemBudgetDetailsDialog
                    //   libActivityId=""
                    //   libId={libId ?? ''}
                    //   sourceType="WFP"
                    //   scope={lib?.scope}
                    // />
                  )}
                  {/* {shouldShowCreateWFPOObjectiveDialog && <>WFP Dialog</>} */}
                </div>

                {isLIBActivitiesLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                ) : (
                  <>
                    {displayActivities && displayActivities.length > 0 ? (
                      <div className="space-y-4">
                        {displayActivities.map(
                          (activity: LIBActivity, index) => {
                            // Check if this LIB activity has a linked OPCR activity or WFP activity
                            const opcrActivity = activity.opcrActivity as
                              | OPCRActivity
                              | undefined
                            const wfpActivity = activity?.wfpObjectiveActivity

                            const handleDeleteActivity = async () => {
                              try {
                                await deleteActivity(
                                  {
                                    pathParams: { id: activity.id },
                                  },
                                  {
                                    onSuccess: async () => {
                                      toast.success(
                                        'Activity deleted successfully!',
                                      )
                                      void queryClient.invalidateQueries({
                                        predicate: (query) =>
                                          typeof query.queryKey[0] ===
                                          'string' &&
                                          query.queryKey[0].startsWith(
                                            '/lib-activities',
                                          ),
                                      })
                                    },
                                  },
                                )
                              } catch (err) {
                                const message =
                                  err instanceof Error
                                    ? err.message
                                    : 'Failed to delete activity'
                                toast.error(message)
                              }
                            }

                            return (
                              <>
                                {lib.sourceType === 'OPCR' && opcrActivity ? (
                                  <LIBActivityCard
                                    key={activity.id || index}
                                    activity={activity}
                                    subtitle={
                                      opcrActivity?.PAPDepartments
                                        ? `Responsible Office: ${opcrActivity.PAPDepartments.map(
                                          (dept) => dept.office.name,
                                        ).join(', ')}`
                                        : 'LIB Activity'
                                    }
                                    budget={opcrActivity?.budget}
                                    onViewExpenditures={() =>
                                      navigation({
                                        search: (prev) => ({
                                          ...prev,
                                          libActivityId: activity.id || '',
                                        }),
                                      })
                                    }
                                    actionMenu={
                                      <LIBActivityActionMenu
                                        onView={
                                          opcrActivity
                                            ? () =>
                                              setSelectedActivity(
                                                opcrActivity,
                                              )
                                            : undefined
                                        }
                                        onEdit={undefined}
                                        activity={activity}
                                        onDelete={handleDeleteActivity}
                                        isDeleting={isDeleting}
                                      />
                                    }
                                  />
                                ) : lib.sourceType === 'WFP' && wfpActivity ? (
                                  <LIBActivityCard
                                    key={activity.id || index}
                                    activity={activity}
                                    subtitle={`WFP Activity`}
                                    budget={calculateWFPBudget(wfpActivity)}
                                    onViewExpenditures={() =>
                                      navigation({
                                        search: (prev) => ({
                                          ...prev,
                                          libActivityId: activity.id || '',
                                          wfpObjectiveActivityId:
                                            activity.wfpObjectiveActivity?.id ||
                                            '',
                                        }),
                                      })
                                    }
                                    actionMenu={
                                      <LIBActivityActionMenu
                                        onView={undefined}
                                        onEdit={undefined}
                                        activity={activity}
                                        onDelete={handleDeleteActivity}
                                        isDeleting={isDeleting}
                                      />
                                    }
                                  />
                                ) : (
                                  <></>
                                )}
                              </>
                            )
                          },
                        )}
                      </div>
                    ) : (
                      <>
                        {isOPCRLoading || isWFPLoading ? (
                          <>
                            <LoadingSpinner message="Loading activities..." />
                          </>
                        ) : (
                          <Card className="border-dashed">
                            <CardContent className="pt-6 text-center">
                              <p className="text-gray-500">
                                No activities found
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Information Panel (right) */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h2 className="text-lg font-semibold text-gray-900">
                Information
              </h2>
            </div>

            <Card className="sticky top-20">
              <CardContent className="pt-6 space-y-5">
                {/* Name */}
                <div className="border-b pb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </p>
                  <p className="text-sm text-gray-900 mt-2 font-medium">
                    {lib?.name || 'N/A'}
                  </p>
                </div>

                {/* Number */}
                <div className="border-b pb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    LIB Number
                  </p>
                  <p className="text-sm text-gray-900 mt-2 font-medium font-mono">
                    {lib?.libNumber || 'N/A'}
                  </p>
                </div>

                {/* Source Type */}
                <div className="border-b pb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Source Type
                  </p>
                  <Badge
                    className={`${getSourceTypeColor(lib?.sourceType || '')} px-3 py-1 mt-2 inline-block`}
                  >
                    {lib?.sourceType || 'N/A'}
                  </Badge>
                </div>

                {/* Status */}
                <div className="border-b pb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </p>
                  <Badge
                    className={`${getStatusBadgeColor(lib?.status || '')} px-3 py-1 mt-2 inline-block`}
                  >
                    {lib?.status || 'N/A'}
                  </Badge>
                </div>

                {/* Created Date */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-900 mt-2">-</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Budget Summary Dashboard Dialog */}
      <LIBSummaryDialog
        open={showSummary}
        onOpenChange={setShowSummary}
        libId={libId || null}
      />

      {/* Version History Comparative Modal */}
      <LIBHistoryDialog
        open={showHistory}
        onOpenChange={setShowHistory}
        libId={libId || null}
      />

      {/* Submission Confirmation Dialog */}
      {isSubmitConfirmOpen &&
        (lib?.status === 'Draft' ||
          lib?.status === 'Returned' ||
          lib?.status === 'Proposed') && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Submit LIB for Review?
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Once submitted, this LIB will be sent for review and approval
                      by the Budget Office.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitConfirmOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitLIB}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit LIB'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Approval / Rejection Dialog */}
      <LIBApprovalDialog
        open={approvalDialogState.open}
        libName={approvalDialogState.libName}
        action={approvalDialogState.action}
        onConfirm={handleConfirmApproval}
        onCancel={() =>
          setApprovalDialogState({
            open: false,
            action: 'approve',
            libId: null,
            libName: '',
          })
        }
        isLoading={isLibSubmitting}
      />
    </div>
  )
}

// FOR OPCR
interface LIBActivityCardProps {
  activity: LIBActivity
  subtitle?: string
  budget?: number
  onViewExpenditures?: () => void
  actionMenu?: React.ReactNode
  icon?: React.ReactNode
}

export function LIBActivityCard({
  activity,
  subtitle,
  budget,
  onViewExpenditures,
  actionMenu,
  icon,
}: LIBActivityCardProps) {
  return (
    <Card className="border-l-4 border-l-green-500 transition-shadow hover:border-l-green-600 hover:shadow-md">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-start justify-between">
          {/* Left */}
          <div className="flex flex-1 items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
              {icon ?? <span className="text-sm">📄</span>}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">{activity.name}</h3>

              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {budget !== undefined && (
              <Badge className="gap-2 bg-blue-100 px-3 py-1 text-blue-700">
                <span>₱</span>
                {(budget / 1000).toFixed(0)}K
              </Badge>
            )}

            {actionMenu}
          </div>
        </div>

        {onViewExpenditures && (
          <div className="flex justify-start">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-green-600 hover:text-green-700"
              onClick={onViewExpenditures}
            >
              <Eye className="h-4 w-4" />
              View Expenditures
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Reusable stats card
type StatsCardProps = {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  gradientClass: string
  borderClass: string
  iconColorClass: string
}

function StatsCard({
  title,
  value,
  icon,
  gradientClass,
  borderClass,
  iconColorClass,
}: StatsCardProps) {
  return (
    <Card className={`relative overflow-hidden border border-gray-100 rounded-xl shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-br ${gradientClass}`}>
      {/* Visual Accent Top Bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${borderClass}`} />

      <CardContent className="pt-6 pb-5 px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {title}
            </p>
            <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {value}
            </div>
          </div>

          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-105 ${iconColorClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// {lib.sourceType === 'OPCR' ? (
//         <></>
//       ) : (
//         <>
//           {wfpData?.data.wfpObjectives?.map((objective) => (
//             <Card key={objective.id} className="mb-6">
//               <CardHeader>
//                 <CardTitle>Objective</CardTitle>

//                 <CardDescription className="space-y-2">
//                   <p>{objective.description}</p>

//                   <div className="flex gap-2">
//                     <Badge variant="secondary">
//                       Weight: {objective.weight}%
//                     </Badge>

//                     <Badge>
//                       {objective?.wfpObjectiveActivities?.length}{' '}
//                       Activities
//                     </Badge>
//                   </div>

//                   {objective.outcome && (
//                     <p>
//                       <span className="font-medium">Outcome:</span>{' '}
//                       {objective.outcome}
//                     </p>
//                   )}
//                 </CardDescription>
//               </CardHeader>

//               <CardContent className="space-y-4">
//                 {objective?.wfpObjectiveActivities?.map((activity) => (
//                   <Card key={activity.id}>
//                     <CardHeader className="pb-3">
//                       <CardTitle className="text-base">
//                         {activity.activityName}
//                       </CardTitle>

//                       <CardDescription>
//                         Indicator: {activity.indicator}
//                       </CardDescription>

//                       <Badge className="w-fit">
//                         Weight: {activity.weight}%
//                       </Badge>
//                     </CardHeader>

//                     <CardContent className="space-y-4">
//                       {/* Timelines */}
//                       <div>
//                         <h4 className="mb-2 font-medium">Timelines</h4>

//                         <div className="flex flex-wrap gap-2">
//                           {activity?.wfpObjectiveTimelines?.map(
//                             (timeline) => (
//                               <Badge key={timeline.id} variant="outline">
//                                 {timeline.timelineType} •{' '}
//                                 {timeline.targetValue}
//                               </Badge>
//                             ),
//                           )}
//                         </div>
//                       </div>

//                       <Separator />

//                       {/* Expenditures */}
//                       <div>
//                         <h4 className="mb-2 font-medium">Expenditures</h4>

//                         <div className="space-y-2">
//                           {activity?.wfpObjectiveActivityExpenditures?.map(
//                             (expense) => (
//                               <div
//                                 key={expense.id}
//                                 className="rounded-md border p-3"
//                               >
//                                 <p className="font-medium">
//                                   {expense.object.name}
//                                 </p>

//                                 <p className="text-sm text-muted-foreground">
//                                   {expense.itemDescription}
//                                 </p>

//                                 <div className="mt-2 flex gap-4 text-sm">
//                                   <span>Qty: {expense.quantity}</span>

//                                   <span>
//                                     Unit Cost: ₱
//                                     {expense.unitCost.toLocaleString()}
//                                   </span>
//                                 </div>
//                               </div>
//                             ),
//                           )}
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </CardContent>
//             </Card>
//           ))}
//         </>
//       )}
