import { useNavigate } from '@tanstack/react-router'
import { LIBDetails } from '../types'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import CreateLineItemBudgetDetailsDialog from '../../line-item-budget-details/components/CreateLineItemBudgetDetailsDialog'
import { toast } from 'sonner'
import GroupedExpenditureItemsView from '../../line-item-budget-details/components/GroupedExpenditureItemsView'
import { groupExpenditureItems } from '../../line-item-budget-details/utils/groupExpenditureData'
import { LineItemBudgetDetails } from '../../line-item-budget-details/types/types'
import { Card, CardContent } from '@/components/ui/card'
import { getLineItemBudgetDetailsRequest } from '../../line-item-budget-details/hooks/getLineItemBudgetDetailsRequest'
import { deleteLineItemBudgetDetailsRequest } from '../../line-item-budget-details/handlers/deleteLineItemBudgetDetailsRequest'
import { ViewLineItemBudgetDetailsDialog } from '../../line-item-budget-details/components/ViewLineItemBudgetDetailsDialog'
import { EditLineItemBudgetDetailsDialog } from '../../line-item-budget-details/components/EditLineItemBudgetDetailsDialog'
import { Badge } from '@/components/ui/badge'

const useLineItemBudgetDetails = createQueryHookFromTemplate(
  getLineItemBudgetDetailsRequest,
)
const useDeleteLineItemBudgetDetails = createMutationHookFromTemplate(
  deleteLineItemBudgetDetailsRequest,
)

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

interface LIBItemExpendituresProps {
  lib: LIBDetails
  libId: string
  libActivityId: string
}

export default function LIBItemExpenditures({
  lib,
  libId,
  libActivityId,
}: LIBItemExpendituresProps) {
  const navigation = useNavigate({ from: '/v2/line-item-budgeting' })
  const queryClient = useQueryClient()
  const isReadOnly = lib?.status === 'Approved' || lib?.status === 'Submitted'

  // Identify current activity name for contextual header and badge
  const currentActivity = lib?.activities?.find((a) => a.id === libActivityId)
  const currentActivityName =
    currentActivity?.name ||
    (currentActivity?.wfpObjectiveActivity as { activityName?: string; name?: string } | undefined)?.activityName ||
    currentActivity?.wfpObjectiveActivity?.name ||
    currentActivity?.opcrActivity?.name ||
    'Selected Activity'

  // Build filter: when viewing a specific activity, scope line items to both libId and libActivityId
  const filterString = libActivityId
    ? `lineItemBudgetId==${libId},lineItemBudgetActivityId==${libActivityId}`
    : `lineItemBudgetId==${libId}`

  const {
    data: libActivityDetailsData,
    isLoading: isLIBActivityDetailsLoading,
  } = useLineItemBudgetDetails({
    pathParams: {},
    queryParams: {
      filters: filterString,
      pageSize: 1000,
      pageNumber: 1,
    },
    enabled: !!libId && (lib?.scope === 'Project' || !!libActivityId),
  })
  const { mutateAsync: deleteLineItem } = useDeleteLineItemBudgetDetails()
  const [deletingLineItemId, setDeletingLineItemId] = useState<string | null>(
    null,
  )
  const [viewingItem, setViewingItem] = useState<LineItemBudgetDetails | null>(
    null,
  )
  const [editingItem, setEditingItem] = useState<LineItemBudgetDetails | null>(
    null,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section matching LIB Detail Page */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Title and Info */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => {
                  void queryClient.invalidateQueries({
                    predicate: (query) =>
                      typeof query.queryKey[0] === 'string' &&
                      (query.queryKey[0].includes('/libs') ||
                        query.queryKey[0].includes('/lib-activities')),
                  })
                  navigation({
                    search: (prev) => ({
                      ...prev,
                      libActivityId: undefined,
                      wfpObjectiveActivityId: undefined,
                    }),
                  })
                }}
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

            {/* Right Section - Badges */}
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
              {currentActivityName && (
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
                  {currentActivityName}
                </span>
              )}
              {currentActivity?.papCode && (
                <span className="text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-semibold">
                  PAP: {currentActivity.papCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content matching Project-Level Line Items structure */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLIBActivityDetailsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section Header with Add Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Line Items ({libActivityDetailsData?.data?.length || 0})
                </h2>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                  {currentActivityName}
                </span>
                {currentActivity?.papCode && (
                  <span className="text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">
                    PAP: {currentActivity.papCode}
                  </span>
                )}
              </div>
              {lib?.sourceType && !isReadOnly && (
                <CreateLineItemBudgetDetailsDialog
                  sourceType={lib.sourceType}
                  libId={libId}
                  libActivityId={libActivityId}
                  scope={lib.scope as 'Activity' | 'Project' | undefined}
                  onCreated={() => {
                    toast.success('Line Item created successfully!')
                    void queryClient.invalidateQueries({
                      predicate: (query) =>
                        typeof query.queryKey[0] === 'string' &&
                        (query.queryKey[0].startsWith(
                          '/line-item-budget-details',
                        ) ||
                          query.queryKey[0].includes('/libs') ||
                          query.queryKey[0].includes('/lib-activities')),
                    })
                  }}
                />
              )}
            </div>

            {/* Grouped Expenditure Table Matrix */}
            {libActivityDetailsData?.data &&
            libActivityDetailsData.data.length > 0 ? (
              <GroupedExpenditureItemsView
                data={groupExpenditureItems(
                  libActivityDetailsData.data as LineItemBudgetDetails[],
                )}
                readOnly={isReadOnly}
                onViewItem={(item: LineItemBudgetDetails) => {
                  setViewingItem(item)
                }}
                onEditItem={(item: LineItemBudgetDetails) => {
                  setEditingItem(item)
                }}
                onDeleteItem={async (item: LineItemBudgetDetails) => {
                  setDeletingLineItemId(item.id)
                  try {
                    await deleteLineItem(
                      {
                        pathParams: { id: item.id },
                      },
                      {
                        onSuccess: () => {
                          toast.success('Line item deleted successfully!')
                          void queryClient.invalidateQueries({
                            predicate: (query) =>
                              typeof query.queryKey[0] === 'string' &&
                              (query.queryKey[0].startsWith(
                                '/line-item-budget-details',
                              ) ||
                                query.queryKey[0].includes('/libs') ||
                                query.queryKey[0].includes('/lib-activities')),
                          })
                        },
                        onError: (error: unknown) => {
                          toast.error(
                            `Failed to delete line item: ${error instanceof Error ? error.message : 'Unknown error'}`,
                          )
                        },
                      },
                    )
                  } finally {
                    setDeletingLineItemId(null)
                  }
                }}
                isDeletingItemId={deletingLineItemId || undefined}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-gray-500 font-medium">
                    No line items found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click &quot;Add Line Items&quot; to add expenditures
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* View Line Item Details Dialog */}
      <ViewLineItemBudgetDetailsDialog
        item={viewingItem}
        open={!!viewingItem}
        onOpenChange={(open) => !open && setViewingItem(null)}
        onEdit={(item) => setEditingItem(item)}
        readOnly={isReadOnly}
      />

      {/* Edit Line Item Dialog */}
      <EditLineItemBudgetDetailsDialog
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        libId={libId}
        libActivityId={libActivityId}
        onSuccess={() => {
          void queryClient.invalidateQueries({
            predicate: (query) =>
              typeof query.queryKey[0] === 'string' &&
              (query.queryKey[0].startsWith('/line-item-budget-details') ||
                query.queryKey[0].includes('/libs') ||
                query.queryKey[0].includes('/lib-activities')),
          })
        }}
      />
    </div>
  )
}
