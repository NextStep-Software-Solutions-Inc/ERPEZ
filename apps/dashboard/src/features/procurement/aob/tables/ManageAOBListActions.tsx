/**
 * Manage AOB List Actions
 * Dropdown row actions for manager/approver view
 * Actions: View Details, Approve (For Approval only), Return (For Approval only)
 */

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, CheckCircle, AlertCircle } from 'lucide-react'
import type { AOB } from '../types/aobTypes'
import { AOBStatus } from '../types/aobTypes'

interface ManageAOBListActionsProps {
  aob: AOB
  onView?: (aob: AOB) => void
  onApprove?: (aob: AOB) => void
  onReturn?: (aob: AOB) => void
  isApproving?: boolean
  isReturning?: boolean
}

export function ManageAOBListActions({
  aob,
  onView,
  onApprove,
  onReturn,
  isApproving = false,
  isReturning = false,
}: ManageAOBListActionsProps) {
  const canApproveReturn = aob.status === AOBStatus.FOR_APPROVAL

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView?.(aob)}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>

        {canApproveReturn && (
          <>
            <DropdownMenuItem
              onClick={() => onReturn?.(aob)}
              disabled={isReturning}
              className="text-yellow-600"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              <span>Return</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onApprove?.(aob)}
              disabled={isApproving}
              className="text-green-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Approve</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
