/**
 * Manage NTP List Row Actions (Admin View)
 * Defines action buttons for each NTP row in admin management
 */

import { MoreHorizontal, Eye, Printer, Send, CheckCircle2, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { NoticeToProceedListItem } from '../types/ntpTypes'

export interface ManageNTPListActionsProps {
  ntp: NoticeToProceedListItem
  onView: (ntp: NoticeToProceedListItem) => void
  onPrint: (ntp: NoticeToProceedListItem) => void
  onIssue?: (ntp: NoticeToProceedListItem) => void
  onRecordReceipt?: (ntp: NoticeToProceedListItem) => void
  onDelete?: (ntp: NoticeToProceedListItem) => void
  isDeleting?: boolean
}

export function ManageNTPListActions({
  ntp,
  onView,
  onPrint,
  onIssue,
  onRecordReceipt,
  onDelete,
  isDeleting = false,
}: ManageNTPListActionsProps) {
  const canIssue = ntp.status === 'Draft' && !!onIssue
  const canRecordReceipt = ntp.status === 'Issued' && !!onRecordReceipt
  const canDelete = ntp.status === 'Draft' && !!onDelete

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
          <span>Preview / Print</span>
        </DropdownMenuItem>

        {canIssue && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onIssue(ntp)}
              className="text-blue-600 focus:text-blue-600"
            >
              <Send className="mr-2 h-4 w-4" />
              <span>Issue NTP</span>
            </DropdownMenuItem>
          </>
        )}

        {canRecordReceipt && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onRecordReceipt(ntp)}
              className="text-emerald-600 focus:text-emerald-600"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>Record Conforme</span>
            </DropdownMenuItem>
          </>
        )}

        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(ntp)}
              disabled={isDeleting}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
