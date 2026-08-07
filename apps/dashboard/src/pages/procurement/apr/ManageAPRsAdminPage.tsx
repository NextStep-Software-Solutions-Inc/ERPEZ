/**
 * Admin APR Management Page
 * 
 * Main admin dashboard for managing APRs across all offices
 * Features:
 * - Statistics overview (submitted, approved, pending, returned)
 * - Table of all APRs for review
 * - Actions: View, Approve, Return for revision
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ClipboardList } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APRStatisticsCards } from '@/features/procurement/apr/components/APRStatisticsCards'
import { AdminAPRsManagementTable } from '@/features/procurement/apr/components/AdminAPRsManagementTable'
import { ApproveAPRDialog } from '@/features/procurement/apr/dialogs/ApproveAPRDialog'
import { ReturnAPRDialog } from '@/features/procurement/apr/dialogs/ReturnAPRDialog'
import type { APRMaster } from '@/features/procurement/apr/types'
import type { APRStatistics } from '@/features/procurement/apr/types/adminTypes'
import { mockAPRList } from '@/features/procurement/apr/mocks'

/**
 * Calculate statistics from mock data
 * Pre-initializes all APRStatus keys to prevent undefined counts
 */
function calculateStatistics(aprList: APRMaster[]): APRStatistics {
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
    stats.statisticsByStatus[apr.status] += 1
    stats.totalBudgetRequested += apr.totalAmount

    if (apr.status === 'APPROVED') {
      stats.totalApproved += 1
      stats.totalBudgetApproved += apr.totalAmount
    } else if (apr.status === 'FOR_APPROVAL') {
      stats.totalPending += 1
    } else if (apr.status === 'RETURNED') {
      stats.totalReturned += 1
    } else if (apr.status === 'DRAFT') {
      stats.totalDraft += 1
    }

    if (apr.submittedAt) {
      stats.totalSubmitted += 1
    }

    if (!stats.statisticsByFiscalYear[apr.fiscalYear]) {
      stats.statisticsByFiscalYear[apr.fiscalYear] = 0
    }
    stats.statisticsByFiscalYear[apr.fiscalYear] += 1
  })

  return stats
}

export function ManageAPRsAdminPage() {
  const navigate = useNavigate()
  const [selectedAPR, setSelectedAPR] = useState<APRMaster | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isReturning, setIsReturning] = useState(false)

  // Calculate statistics from mock data
  const statistics = calculateStatistics(mockAPRList)

  const handleViewAPR = (apr: APRMaster) => {
    setSelectedAPR(apr)
    // Navigate to APR details page for admin review
    navigate({
      to: '/v2/agency-purchase-requests-apr/$aprId',
      params: { aprId: apr.id },
      search: { from: 'manage-aprs' },
    })
  }

  const handleApproveAPR = (apr: APRMaster) => {
    setSelectedAPR(apr)
    setApproveDialogOpen(true)
  }

  const handleReturnAPR = (apr: APRMaster) => {
    setSelectedAPR(apr)
    setReturnDialogOpen(true)
  }

  const handleConfirmApprove = async (file?: File) => {
    if (!selectedAPR) return

    setIsApproving(true)
    try {
      // TODO: Call approval mutation when backend API is ready
      //   const { mutate: approveAPR } = useApproveAPRMutation()
      //   await approveAPR({ aprId: selectedAPR.id, signedDocument: file })

      console.log('APR Approved:', selectedAPR.aprNumber, 'File:', file?.name)

      // Close dialog and reset
      setApproveDialogOpen(false)
      setSelectedAPR(null)

      // Show success toast (implement when toast service is available)
    } finally {
      setIsApproving(false)
    }
  }

  const handleConfirmReturn = async (remarks: string) => {
    if (!selectedAPR) return

    setIsReturning(true)
    try {
      // TODO: Call return mutation when backend API is ready
      //   const { mutate: returnAPR } = useReturnAPRMutation()
      //   await returnAPR({ aprId: selectedAPR.id, remarks })

      console.log('APR Returned:', selectedAPR.aprNumber, 'Remarks:', remarks)

      // Close dialog and reset
      setReturnDialogOpen(false)
      setSelectedAPR(null)

      // Show success toast (implement when toast service is available)
    } finally {
      setIsReturning(false)
    }
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header - match Fiscal Year & Policies styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
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
      </Card>

      {/* Statistics Cards */}
      <div>
        <APRStatisticsCards statistics={statistics} />
      </div>

      {/* APRs Management Table with Toolbar and Filters */}
      <div className="bg-white rounded-lg border p-4">
        <AdminAPRsManagementTable
          data={mockAPRList}
          isLoading={false}
          onView={handleViewAPR}
          onApprove={handleApproveAPR}
          onReturn={handleReturnAPR}
        />
      </div>

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
