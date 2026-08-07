/**
 * Manage NTP List Row Actions (Manager/Approver View)
 * Defines action buttons for each NTP row (View, Print, Approve, Return)
 * Managers can only approve or return NTPs, no edit or delete
 */

import { MoreHorizontal, Eye, Printer, CheckCircle2, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { NTP } from '../types/ntpTypes'

export interface ManageNTPListActionsProps {
  ntp: NTP
  onView: (ntp: NTP) => void
  onPrint: (ntp: NTP) => void
  onApprove?: (ntp: NTP) => void
  onReturn?: (ntp: NTP) => void
  isApproving?: boolean
  isReturning?: boolean
}

export function ManageNTPListActions({
  ntp,
  onView,
  onPrint,
  onApprove,
  onReturn,
  isApproving = false,
  isReturning = false,
}: ManageNTPListActionsProps) {
  // Can approve/return only if status is "For Approval"
  const canApproveReturn = ntp.status === 'For Approval'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(ntp)}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPrint(ntp)}>
          <Printer className="mr-2 h-4 w-4" />
          <span>Print</span>
        </DropdownMenuItem>
        {canApproveReturn && (onApprove || onReturn) && (
          <>
            <DropdownMenuSeparator />
            {onReturn && (
              <DropdownMenuItem
                onClick={() => onReturn(ntp)}
                disabled={isReturning}
                className="text-yellow-600 focus:text-yellow-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                <span>Return</span>
              </DropdownMenuItem>
            )}
            {onApprove && (
              <DropdownMenuItem
                onClick={() => onApprove(ntp)}
                disabled={isApproving}
                className="text-green-600 focus:text-green-600"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>Approve</span>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
