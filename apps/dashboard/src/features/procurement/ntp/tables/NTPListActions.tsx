/**
 * NTP List Row Actions
 * Defines action buttons for each NTP row
 */

import { useState } from 'react'
import { MoreHorizontal, Eye, Printer, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { NoticeToProceedListItem } from '../types/ntpTypes'

export interface NTPListActionsProps {
  ntp: NoticeToProceedListItem
  onView: (ntp: NoticeToProceedListItem) => void
  onPrint: (ntp: NoticeToProceedListItem) => void
  onDelete?: (ntp: NoticeToProceedListItem) => void
  isDeleting?: boolean
}

export function NTPListActions({
  ntp,
  onView,
  onPrint,
  onDelete,
  isDeleting = false,
}: NTPListActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    onDelete?.(ntp)
    setShowDeleteConfirm(false)
  }

  const canDelete = ntp.status === 'Draft' && !!onDelete

  return (
    <>
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
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteConfirm(true)}
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

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft Notice to Proceed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {ntp.ntpNumber}? This draft will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
