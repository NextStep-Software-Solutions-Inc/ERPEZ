/**
 * AOB List Table Actions
 * Dropdown row actions for user/creator view
 * Actions: View Details, Print, Edit (Draft only), Delete (Draft only)
 */

import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { MoreHorizontal, Eye, Printer, Trash2, Edit } from 'lucide-react'
import type { AOB } from '../types/aobTypes'
import { AOBStatus } from '../types/aobTypes'

interface AOBListActionsProps {
  aob: AOB
  onView?: (aob: AOB) => void
  onEdit?: (aob: AOB) => void
  onDelete?: (aob: AOB) => void
}

export function AOBListActions({ aob, onView, onEdit, onDelete }: AOBListActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const canEditDelete = aob.status === AOBStatus.DRAFT

  const handleView = () => {
    setIsOpen(false)
    onView?.(aob)
  }

  const handleEdit = () => {
    setIsOpen(false)
    onEdit?.(aob)
  }

  const handlePrint = () => {
    setIsOpen(false)
    // TODO: Implement print functionality
    console.log('Print AOB:', aob.id)
  }

  const handleDelete = () => {
    setIsOpen(false)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false)
    onDelete?.(aob)
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          <span>Print AOB</span>
        </DropdownMenuItem>

        {canEditDelete && (
          <>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete AOB</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{aob.aobNumber}"? This action cannot be undone and will permanently remove the AOB and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete AOB
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
