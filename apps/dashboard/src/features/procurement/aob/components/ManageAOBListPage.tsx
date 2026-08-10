/**
 * Manage AOB List Page Component
 * Manager/approver dashboard for reviewing and approving AOBs
 * Features: Statistics, approval workflows, management table with Approve/Return actions
 *
 * @see documentations/aob-feature-overview.md for complete feature documentation
 */

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gavel } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getAOBListRequest } from '../handlers/getAOBListRequest'
import { ApproveAOBDialog } from '../dialogs/ApproveAOBDialog'
import { ReturnAOBDialog } from '../dialogs/ReturnAOBDialog'
import { AdminAOBsManagementTable } from './AdminAOBsManagementTable'
import type { AOB } from '../types'
import { AOBStatisticsCards } from './AOBStatisticsCards'
import { calculateStatistics } from '../utils/statistics'

const useAOBList = createQueryHookFromTemplate(getAOBListRequest)

interface ManageAOBListPageProps {
  onViewDetails?: (aob: AOB) => void
}

export function ManageAOBListPage({ onViewDetails }: ManageAOBListPageProps) {
  const [selectedAOB, setSelectedAOB] = useState<AOB | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)

  // Fetch AOB list with mock data fallback
  // TODO: Confirm if getAOBListRequest returns org-wide results or scopes to authenticated user.
  // Currently hardcoded to pageSize: 100. If endpoint scopes to current user, managers will only see their own AOBs.
  const { data: apiResponse, isLoading, isFetching } = useAOBList({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })

  const aobList = useMemo(() => {
    return apiResponse?.data || []
  }, [apiResponse])

  // Calculate statistics from AOB data
  const statistics = useMemo(() => calculateStatistics(aobList), [aobList])

  const handleViewDetails = (aob: AOB) => {
    setSelectedAOB(aob)
    onViewDetails?.(aob)
  }

  const handleApproveAOB = (aob: AOB) => {
    setSelectedAOB(aob)
    setApproveDialogOpen(true)
  }

  const handleReturnAOB = (aob: AOB) => {
    setSelectedAOB(aob)
    setReturnDialogOpen(true)
  }

  const handleConfirmApprove = async (data: { approvalDocument: File; approvalRemarks?: string; approvedBy: string }) => {
    if (!selectedAOB) return

    try {
      console.log('AOB Approved:', selectedAOB.aobNumber, 'File:', data.approvalDocument.name, 'By:', data.approvedBy)

      // Close dialog and reset
      setApproveDialogOpen(false)
      setSelectedAOB(null)

      // TODO: Call approval mutation when backend API is ready
      // Optionally refresh list
    } catch (error) {
      console.error('Error approving AOB:', error)
    }
  }

  const handleConfirmReturn = async (data: { reason: string; remarks?: string }) => {
    if (!selectedAOB) return

    try {
      console.log('AOB Returned:', selectedAOB.aobNumber, 'Reason:', data.reason, 'Remarks:', data.remarks)

      // Close dialog and reset
      setReturnDialogOpen(false)
      setSelectedAOB(null)

      // TODO: Call return mutation when backend API is ready
      // Optionally refresh list
    } catch (error) {
      console.error('Error returning AOB:', error)
    }
  }

  return (
    <>
      <div className="w-full space-y-6 pb-10">
        {/* Header - match Fiscal Year & Policies styling */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <CardTitle className="text-3xl">Manage Abstract of Bids (AOB)</CardTitle>
                <CardDescription className="text-base">
                  Review and approve supplier bids and award tabulation for procurement activities
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                  <Gavel className="h-3.5 w-3.5 mr-1.5" /> Manage AOB
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Abstract of Bids (AOB)</CardTitle>
            <CardDescription>Review and approve supplier bids and award tabulation for procurement activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statistics Cards */}
            <div>
              <AOBStatisticsCards statistics={statistics} />
            </div>

            {/* AOBs Management Table */}
            <div className="bg-white rounded-lg border p-4">
              <AdminAOBsManagementTable
                data={aobList}
                isLoading={isLoading || isFetching}
                onView={handleViewDetails}
                onApprove={handleApproveAOB}
                onReturn={handleReturnAOB} />
            </div>
          </CardContent>
        </Card>

        {/* Approve Dialog */}
        <ApproveAOBDialog
          open={approveDialogOpen}
          onOpenChange={setApproveDialogOpen}
          aob={selectedAOB || undefined}
          onApprove={handleConfirmApprove}
        />

        {/* Return Dialog */}
        <ReturnAOBDialog
          open={returnDialogOpen}
          onOpenChange={setReturnDialogOpen}
          aob={selectedAOB || undefined}
          onReturn={handleConfirmReturn}
        />
      </div>
    </>
  )
}
