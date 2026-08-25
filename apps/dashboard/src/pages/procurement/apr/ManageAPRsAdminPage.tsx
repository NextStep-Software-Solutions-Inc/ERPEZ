/**
 * Admin APR Management Page
 * 
 * Main admin dashboard for managing APRs across all offices with live database data
 */

import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { APRStatisticsCards } from '@/features/procurement/apr/components/APRStatisticsCards'
import { AdminAPRsManagementTable } from '@/features/procurement/apr/components/AdminAPRsManagementTable'
import { ApproveAPRDialog } from '@/features/procurement/apr/dialogs/ApproveAPRDialog'
import { ReturnAPRDialog } from '@/features/procurement/apr/dialogs/ReturnAPRDialog'
import type { APRListItemDto } from '@/features/procurement/apr/types'
import type { APRStatistics } from '@/features/procurement/apr/types/adminTypes'
import {
  useAPRs,
  useApproveAPRMutation,
  useReturnAPRMutation,
} from '@/features/procurement/apr/handlers/hooks'
import { invalidateAPRQueries } from '@/features/procurement/apr/utils/invalidateAPRQueries'
import { normalizeAPRStatus } from '@/features/procurement/apr/utils'

/**
 * Calculate live statistics from live APR data
 */
function calculateStatistics(aprList: any[]): APRStatistics {
  const stats: APRStatistics = {
    totalSubmitted: 0,
    totalApproved: 0,
    totalPending: 0,
    totalReturned: 0,
    totalDraft: 0,
    totalBudgetRequested: 0,
    totalBudgetApproved: 0,
    statisticsByStatus: {
      DRAFT: 0,
      FOR_APPROVAL: 0,
      RETURNED: 0,
      APPROVED: 0,
      PARTIALLY_AVAILABLE: 0,
      OUT_OF_STOCK: 0,
    },
    statisticsByFiscalYear: {},
  }

  aprList.forEach((apr) => {
    const status = normalizeAPRStatus(apr.status)
    const amount = Number(apr.totalAmount) || 0
    stats.totalBudgetRequested += amount

    if (status === 'APPROVED') {
      stats.totalApproved += 1
      stats.totalBudgetApproved += amount
      stats.statisticsByStatus.APPROVED = (stats.statisticsByStatus.APPROVED || 0) + 1
    } else if (status === 'FOR_APPROVAL') {
      stats.totalPending += 1
      stats.totalSubmitted += 1
      stats.statisticsByStatus.FOR_APPROVAL = (stats.statisticsByStatus.FOR_APPROVAL || 0) + 1
    } else if (status === 'RETURNED') {
      stats.totalReturned += 1
      stats.statisticsByStatus.RETURNED = (stats.statisticsByStatus.RETURNED || 0) + 1
    } else if (status === 'DRAFT') {
      stats.totalDraft += 1
      stats.statisticsByStatus.DRAFT = (stats.statisticsByStatus.DRAFT || 0) + 1
    } else if (status === 'PARTIALLY_AVAILABLE') {
      stats.statisticsByStatus.PARTIALLY_AVAILABLE = (stats.statisticsByStatus.PARTIALLY_AVAILABLE || 0) + 1
    } else if (status === 'OUT_OF_STOCK') {
      stats.statisticsByStatus.OUT_OF_STOCK = (stats.statisticsByStatus.OUT_OF_STOCK || 0) + 1
    }

    const fy = apr.fiscalYear || new Date().getFullYear()
    stats.statisticsByFiscalYear[fy] = (stats.statisticsByFiscalYear[fy] || 0) + 1
  })

  return stats
}

export function ManageAPRsAdminPage() {
  const navigate = useNavigate()
  const [selectedAPR, setSelectedAPR] = useState<any | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)

  // Fetch live APRs from backend database
  const { data: responseData, isLoading, error, refetch } = useAPRs({
    queryParams: {
      PageNumber: 1,
      PageSize: 100,
    },
  } as any)

  const { mutateAsync: approveAPR, isPending: isApproving } = useApproveAPRMutation()
  const { mutateAsync: returnAPR, isPending: isReturning } = useReturnAPRMutation()

  // Extract APR array
  const aprList: APRListItemDto[] = useMemo(() => {
    if (!responseData) return []
    if (Array.isArray(responseData)) return responseData
    if (Array.isArray((responseData as any).data)) return (responseData as any).data
    if (Array.isArray((responseData as any).items)) return (responseData as any).items
    return []
  }, [responseData])

  // Calculate live statistics
  const statistics = useMemo(() => calculateStatistics(aprList), [aprList])

  const handleViewAPR = (apr: any) => {
    setSelectedAPR(apr)
    navigate({
      to: '/v2/manage-aprs/$aprId',
      params: { aprId: apr.id },
    })
  }

  const handleApproveAPR = (apr: any) => {
    setSelectedAPR(apr)
    setApproveDialogOpen(true)
  }

  const handleReturnAPR = (apr: any) => {
    setSelectedAPR(apr)
    setReturnDialogOpen(true)
  }

  const queryClient = useQueryClient()

  const handleConfirmApprove = async (file?: File) => {
    if (!selectedAPR) return

    try {
      await approveAPR({
        pathParams: { aprId: selectedAPR.id },
        payload: {
          aprId: selectedAPR.id,
          signedDocumentFile: file,
          approvedAt: new Date().toISOString(),
        },
      } as any)

      toast.success(`APR ${selectedAPR.aprNumber} has been approved successfully`)
      invalidateAPRQueries(queryClient)
      setApproveDialogOpen(false)
      setSelectedAPR(null)
      refetch()
    } catch (err: any) {
      console.error('Failed to approve APR:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to approve APR'
      toast.error(msg)
    }
  }

  const handleConfirmReturn = async (remarks: string) => {
    if (!selectedAPR) return

    try {
      await returnAPR({
        pathParams: { aprId: selectedAPR.id },
        payload: {
          aprId: selectedAPR.id,
          remarks,
          returnedAt: new Date().toISOString(),
        },
      } as any)

      toast.success(`APR ${selectedAPR.aprNumber} has been returned for revisions`)
      invalidateAPRQueries(queryClient)
      setReturnDialogOpen(false)
      setSelectedAPR(null)
      refetch()
    } catch (err: any) {
      console.error('Failed to return APR:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to return APR'
      toast.error(msg)
    }
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      {<Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Manage APRs</CardTitle>
              <CardDescription className="text-base">
                Review and approve Agency Purchase Requests from all offices
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Agency Purchase Requests
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card> as any}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Failed to load APR records</p>
                <p className="text-sm">{String((error as any)?.message || 'An error occurred while fetching APRs')}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div>
        <APRStatisticsCards statistics={statistics} />
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-sm font-medium text-gray-500">Loading APRs from database...</span>
        </div>
      )}

      {/* APRs Management Table with Toolbar and Filters */}
      {!isLoading && (
        <div className="bg-white rounded-lg border p-4">
          <AdminAPRsManagementTable
            data={aprList as any}
            isLoading={false}
            onView={handleViewAPR}
            onApprove={handleApproveAPR}
            onReturn={handleReturnAPR}
          />
        </div>
      )}

      {/* Approve Dialog */}
      <ApproveAPRDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        apr={selectedAPR}
        isSubmitting={isApproving}
        onConfirm={handleConfirmApprove}
      />

      {/* Return Dialog */}
      <ReturnAPRDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        apr={selectedAPR}
        isSubmitting={isReturning}
        onConfirm={handleConfirmReturn}
      />
    </div>
  )
}
