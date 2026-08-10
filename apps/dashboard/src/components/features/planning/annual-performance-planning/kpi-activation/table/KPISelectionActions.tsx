/**
 * KPI Selection Table Actions
 * Step 2: KPI Activation - Actions for KPI selection table
 */

import { MoreVertical, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { MasterKPI } from '@/components/features/planning/annual-performance-planning/shared/utils/mockMasterKPIs'

interface KPISelectionActionsProps {
  kpi: MasterKPI
  onViewDetails: (kpi: MasterKPI) => void
}

export function KPISelectionActions({ kpi, onViewDetails }: KPISelectionActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleViewDetails = () => {
    console.log('View Details clicked for KPI:', kpi)
    onViewDetails(kpi)
    setIsOpen(false)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={toggleMenu}
      >
        <MoreVertical className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[9999]">
          <div className="p-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start cursor-pointer hover:bg-gray-100"
              onClick={handleViewDetails}
            >
              <Eye className="mr-2 h-4 w-4" />
              <span>View Details</span>
            </Button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}