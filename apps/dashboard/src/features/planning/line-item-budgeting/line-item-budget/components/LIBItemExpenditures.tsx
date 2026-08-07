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
import WFPLineItemsView from '../../line-item-budget-details/components/WFPLineItemsView'

const useLineItemBudgetDetails = createQueryHookFromTemplate(
  getLineItemBudgetDetailsRequest,
)
const useDeleteLineItemBudgetDetails = createMutationHookFromTemplate(
  deleteLineItemBudgetDetailsRequest,
)

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
  const isWFP = lib?.sourceType === 'WFP'
  const isReadOnly = lib?.status === 'Approved' || lib?.status === 'Submitted'

  // Build filter based on sourceType
  const filterString = isWFP
    ? `lineItemBudgetId==${libId}`
    : `lineItemBudgetId==${libId},lineItemBudgetActivityId==${libActivityId}`

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
    enabled: isWFP ? !!libId : !!libId && !!libActivityId,
  })
  const { mutateAsync: deleteLineItem } = useDeleteLineItemBudgetDetails()
  const [deletingLineItemId, setDeletingLineItemId] = useState<string | null>(
    null,
  )
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() =>
                  navigation({
                    search: (prev) => ({
                      ...prev,
                      libActivityId: undefined,
                      wfpObjectiveActivityId: undefined,
                    }),
                  })
                }
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Line Items & Expenditures
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLIBActivityDetailsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Line Items ({libActivityDetailsData?.data?.length || 0})
                </h2>
              </div>
              {lib?.sourceType && !isReadOnly && (
                <CreateLineItemBudgetDetailsDialog
                  sourceType={lib.sourceType}
                  libId={libId}
                  libActivityId={libActivityId}
                  onCreated={() => {
                    toast.success('Line Item created successfully!')
                    void queryClient.invalidateQueries({
                      predicate: (query) =>
                        typeof query.queryKey[0] === 'string' &&
                        query.queryKey[0].startsWith(
                          '/line-item-budget-details',
                        ),
                    })
                  }}
                />
              )}
            </div>

            {/* Line Items List */}
            {libActivityDetailsData?.data &&
            libActivityDetailsData.data.length > 0 ? (
              isWFP ? (
                <WFPLineItemsView
                  data={groupExpenditureItems(libActivityDetailsData.data)}
                  readOnly={isReadOnly}
                  onViewItem={(item: LineItemBudgetDetails) => {
                    // Handle view item - can navigate or open a detail modal
                  }}
                  onEditItem={(item: LineItemBudgetDetails) => {
                    // Handle edit item - can open edit dialog or navigate
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
                                query.queryKey[0].startsWith(
                                  '/line-item-budget-details',
                                ),
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
                <GroupedExpenditureItemsView
                  data={groupExpenditureItems(
                    libActivityDetailsData.data as LineItemBudgetDetails[],
                  )}
                  readOnly={isReadOnly}
                  onViewItem={(item: LineItemBudgetDetails) => {
                    // Handle view item - can navigate or open a detail modal
                  }}
                  onEditItem={(item: LineItemBudgetDetails) => {
                    // Handle edit item - can open edit dialog or navigate
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
                                query.queryKey[0].startsWith(
                                  '/line-item-budget-details',
                                ),
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
              )
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-gray-500 font-medium">
                    No line items found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click "Create Line Item" to add items
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
