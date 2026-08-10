/**
 * Manage NTP List Page (Admin)
 * Admin view for managing all NTP documents
 * Separate from office/user view (NTPListPage) - admin workflow
 */

import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PlayCircle } from 'lucide-react'
import { NTPTable, ManageNTPListToolbar } from '../tables'
import { selectedNTPAtom } from '../atoms/ntpAtoms'
import { mockNTPStore, printNTP } from '../utils'
import type { NTP, NTPStatus } from '../types/ntpTypes'

export function ManageNTPListPage() {
  const navigate = useNavigate()
  const [, setSelectedNTP] = useAtom(selectedNTPAtom)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<NTPStatus | 'All'>('All')
  const [isLoading] = useState(false)

  // Load NTP data from mock store
  const ntpList = useMemo(() => {
    const response = mockNTPStore.getList(1, 100)
    return response.data || []
  }, [])

  const handleViewDetails = (ntp: NTP) => {
    console.log('[ManageNTPListPage] Navigating to NTP admin details:', {
      id: ntp.id,
      ntpNumber: ntp.ntpNumber,
      supplier: ntp.supplierName,
    })
    
    // Set atom before navigation
    setSelectedNTP(ntp)
    
    // Navigate to admin detail page (manage-ntp/$ntpId, not notice-to-proceed-ntp/$ntpId)
    navigate({
      to: `/v2/manage-ntp/${ntp.id}`,
    })
  }

  const handlePrintNTP = (ntp: NTP) => {
    printNTP(ntp)
  }

  const handleApproveNTP = (ntp: NTP) => {
    console.log('[ManageNTPListPage] Approving NTP:', {
      id: ntp.id,
      ntpNumber: ntp.ntpNumber,
    })
    // TODO: Implement API call to approve NTP
  }

  const handleReturnNTP = (ntp: NTP) => {
    console.log('[ManageNTPListPage] Returning NTP:', {
      id: ntp.id,
      ntpNumber: ntp.ntpNumber,
    })
    // TODO: Implement API call to return NTP
  }

  return (
    <div className="space-y-6">
      {/* Header - match Fiscal Year & Policies styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Manage NTP</CardTitle>
              <CardDescription className="text-base">
                Administrative view for managing all Notice to Proceed (NTP) documents. Review, approve, and manage NTP submissions.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Manage NTP
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Separator />

      {/* Toolbar & Table */}
      <Card className="p-6">
        <ManageNTPListToolbar
          onSearch={setSearchQuery}
          onStatusFilter={setSelectedStatus}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
        />

        <NTPTable
          data={ntpList}
          isLoading={isLoading}
          onView={handleViewDetails}
          onPrint={handlePrintNTP}
          onApprove={handleApproveNTP}
          onReturn={handleReturnNTP}
          searchQuery={searchQuery}
          selectedStatus={selectedStatus}
          variant="manager"
        />
      </Card>
    </div>
  )
}
