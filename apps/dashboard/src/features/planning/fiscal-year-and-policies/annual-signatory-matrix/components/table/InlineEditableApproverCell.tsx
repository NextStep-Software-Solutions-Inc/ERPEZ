'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { User } from '@/lib/fiscal-year-and-policies/types'
import {
  useResolveApprovers,
  useUpdateWorkflowMatrix,
} from '../../handlers/hooks'
import { WorkflowMatrix } from '../../types/workflowMatrixTypes'

interface InlineEditableApproverCellProps {
  item: WorkflowMatrix
  approverRole: 'recommending' | 'final'
  approverName: string | null
  approverId: string
  availableUsers: User[]
  onSuccess?: () => void
}

/**
 * InlineEditableApproverCell Component
 * Provides inline editing with a confirmation dialog for approver changes
 * Follows React best practices with proper hook usage at component level
 */
export function InlineEditableApproverCell({
  item,
  approverRole,
  approverName,
  approverId,
  availableUsers,
  onSuccess,
}: InlineEditableApproverCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(approverId)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const { mutateAsync: resolveApprovers } = useResolveApprovers()
  const { mutateAsync: updateWorkflowMatrix, isPending } =
    useUpdateWorkflowMatrix()

  const userOptions = availableUsers.map((user) => ({
    value: user.id,
    label: user.name,
  }))

  const handleStartEdit = () => {
    setIsEditing(true)
    setSelectedUserId(approverId)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedUserId(approverId)
  }

  const handleUserChange = (userId: string) => {
    if (userId !== approverId) {
      setPendingUserId(userId)
      setShowConfirmation(true)
    }
  }

  const handleConfirmChange = async () => {
    if (!pendingUserId) return

    try {
      const resolvedApprovers = await resolveApprovers({
        pathParams: {},
        payload: {
          officeId: item.officeId,
          recommendingApproverUserId:
            approverRole === 'recommending'
              ? pendingUserId
              : item.recommendingApprover.currentUser.id,
          finalApproverUserId:
            approverRole === 'recommending'
              ? item.finalApprover.currentUser.id
              : pendingUserId,
        },
      })

      await updateWorkflowMatrix({
        pathParams: { id: item.id },
        payload: {
          documentType: item?.documentType || 'general',
          recommendingApproverPositionId:
            resolvedApprovers.data.recommendingApproverPositionId,
          finalApproverPositionId:
            resolvedApprovers.data.finalApproverPositionId,
        },
      })

      toast.success(
        `${approverRole === 'recommending' ? 'Recommending' : 'Final'} approver updated successfully`,
      )
      setIsEditing(false)
      setSelectedUserId(pendingUserId)
      setPendingUserId(null)
      onSuccess?.()
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update approver'
      toast.error(errorMessage)
      setShowConfirmation(false)
    }
  }

  if (isEditing) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Combobox
            options={userOptions}
            value={selectedUserId}
            onValueChange={handleUserChange}
            placeholder="Search and assign..."
            searchPlaceholder="Search users..."
            disabled={isPending}
            className="w-[200px]"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            disabled={isPending}
            className="h-8 w-8"
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Change</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change the{' '}
                {approverRole === 'recommending' ? 'recommending' : 'final'}{' '}
                approver for {item.officeName}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmChange}
                disabled={isPending}
              >
                {isPending ? 'Updating...' : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <button
      onClick={handleStartEdit}
      className="text-left hover:bg-slate-100 hover:text-slate-900 px-2 py-1 rounded cursor-pointer transition-colors w-full"
      title={`Click to edit ${approverRole} approver`}
    >
      {approverName || '—'}
    </button>
  )
}
