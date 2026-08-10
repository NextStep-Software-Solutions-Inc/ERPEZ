/**
 * NTP List Page
 * Main page for viewing and managing NTPs
 */

import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PlayCircle } from 'lucide-react'
import { NTPTable, NTPListToolbar } from '../tables'
import { CreateNTPDialog } from '../dialogs'
import { isCreateNTPDialogOpenAtom, selectedNTPAtom } from '../atoms/ntpAtoms'
import { mockNTPStore, printNTP } from '../utils'
import type { NTP, NTPStatus } from '../types/ntpTypes'

export function NTPListPage() {
  const navigate = useNavigate()
  const [, setIsCreateDialogOpen] = useAtom(isCreateNTPDialogOpenAtom)
  const [, setSelectedNTP] = useAtom(selectedNTPAtom)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<NTPStatus | 'All'>('All')
  const [isLoading] = useState(false)

  // Load NTP data from mock store
  const ntpList = useMemo(() => {
    const response = mockNTPStore.getList(1, 100)
    return response.data || []
  }, [])

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true)
  }

  const handleViewDetails = (ntp: NTP) => {
    console.log('[NTPListPage] Navigating to NTP details:', {
      id: ntp.id,
      ntpNumber: ntp.ntpNumber,
      supplier: ntp.supplierName,
    })
    
    // Set atom before navigation
    setSelectedNTP(ntp)
    
    // Navigate to details page
    navigate({
      to: `/v2/notice-to-proceed-ntp/${ntp.id}`,
    })
  }

  const handlePrintNTP = (ntp: NTP) => {
    printNTP(ntp)
  }

  // TODO: Implement edit mode when inline editing is available (Task: NTP Edit Form)

  const handleDeleteNTP = (ntp: NTP) => {
    // TODO: Implement delete with mutation (Task 15)
    console.log('Delete NTP:', ntp.id)
    try {
      mockNTPStore.delete(ntp.id)
      // Trigger refetch
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete NTP:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - match Fiscal Year & Policies styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Notice to Proceed</CardTitle>
              <CardDescription className="text-base">
                Manage and track Notice to Proceed (NTP) documents from procurement orders and contracts.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Notice to Proceed
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Separator />

      {/* Toolbar & Table */}
      <Card className="p-6">
        <NTPListToolbar
          onSearch={setSearchQuery}
          onStatusFilter={setSelectedStatus}
          onCreateClick={handleCreateClick}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
        />

        <NTPTable
          data={ntpList}
          isLoading={isLoading}
          onView={handleViewDetails}
          onPrint={handlePrintNTP}
          onDelete={handleDeleteNTP}
          searchQuery={searchQuery}
          selectedStatus={selectedStatus}
          variant="user"
        />
      </Card>

      {/* Dialogs */}
      <CreateNTPDialog />
    </div>
  )
}
