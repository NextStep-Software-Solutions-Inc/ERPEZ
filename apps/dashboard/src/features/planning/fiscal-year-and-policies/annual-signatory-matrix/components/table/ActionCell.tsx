'use client'

import { useAtom } from 'jotai'
import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SignatoryAssignment } from '@/lib/fiscal-year-and-policies/types'
import {
  editSignatoryDialogOpenAtom,
  deleteSignatoryDialogOpenAtom,
  selectedSignatoryAtom,
} from '../../atoms/signatoryMatrixAtoms'
import { usePatchWorkflowMatrix } from '../../handlers/hooks'
import type {
  PatchWorkflowMatrixPayload,
  WorkflowMatrix,
} from '../../types/workflowMatrixTypes'

interface ActionCellProps {
  item: WorkflowMatrix
  onSuccess?: () => void
}

function toSignatoryAssignment(item: WorkflowMatrix): SignatoryAssignment {
  return {
    id: item.id,
    fiscalYearId: item.fiscalYearId,
    departmentId: item.officeId,
    documentType: item.documentType,
    role: 'recommending',
    signatoryUserId: item.recommendingApprover.currentUser.id,
    signatoryUserName: item.recommendingApprover.currentUser.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    departmentName: item.officeName,
    recommendingApproverId: item.recommendingApprover.currentUser.id,
    recommendingApproverName: item.recommendingApprover.currentUser.name,
    finalApproverId: item.finalApprover.currentUser.id,
    finalApproverName: item.finalApprover.currentUser.name,
  }
}

/**
 * ActionCell Component
 * Properly handles hooks at component level (not in column definition)
 * This fixes the anti-pattern of calling hooks inside cell functions
 */
export function ActionCell({ item, onSuccess }: ActionCellProps) {
  const [, setEditDialogOpen] = useAtom(editSignatoryDialogOpenAtom)
  const [, setDeleteDialogOpen] = useAtom(deleteSignatoryDialogOpenAtom)
  const [, setSelectedSignatory] = useAtom(selectedSignatoryAtom)
  const { mutateAsync: patchWorkflowMatrix, isPending: isPatching } =
    usePatchWorkflowMatrix()

  const handleEdit = () => {
    setSelectedSignatory(toSignatoryAssignment(item))
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    setSelectedSignatory(toSignatoryAssignment(item))
    setDeleteDialogOpen(true)
  }

  const handlePatch = async () => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active'

    try {
      await patchWorkflowMatrix({
        pathParams: { id: item.id },
        payload: {
          status: nextStatus,
        } satisfies PatchWorkflowMatrixPayload,
      })

      toast.success(
        `Workflow matrix ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      )
      onSuccess?.()
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to patch workflow matrix'
      toast.error(errorMessage)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handlePatch} disabled={isPatching}>
          {item.status === 'active' ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
