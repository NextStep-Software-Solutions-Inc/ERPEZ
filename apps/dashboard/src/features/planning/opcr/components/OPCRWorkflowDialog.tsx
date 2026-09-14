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
import { Loader2 } from 'lucide-react'

export type OPCRWorkflowAction = 'submit' | 'approve' | 'return'

interface OPCRWorkflowDialogProps {
  open: boolean
  opcrName: string
  action: OPCRWorkflowAction
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export const OPCRWorkflowDialog = ({
  open,
  opcrName,
  action,
  onConfirm,
  onCancel,
  isLoading = false,
}: OPCRWorkflowDialogProps) => {
  const titles: Record<OPCRWorkflowAction, string> = {
    submit: 'Submit OPCR for Review & Approval?',
    approve: 'Approve OPCR Commitment?',
    return: 'Return OPCR for Revision?',
  }

  const descriptions: Record<OPCRWorkflowAction, string> = {
    submit: `Are you sure you want to submit "${opcrName}"? Once submitted, this OPCR will be forwarded to the Approval Workflow for review and approval.`,
    approve: `Are you sure you want to approve "${opcrName}"? This will officially mark the OPCR commitment as Approved.`,
    return: `Are you sure you want to return "${opcrName}"? This will return the OPCR to Draft status so the office can make revisions and resubmit.`,
  }

  const buttonLabels: Record<OPCRWorkflowAction, string> = {
    submit: 'Submit OPCR',
    approve: 'Approve OPCR',
    return: 'Return OPCR',
  }

  const buttonStyles: Record<OPCRWorkflowAction, string> = {
    submit: 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium',
    approve: 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium',
    return: 'bg-amber-600 hover:bg-amber-700 text-white font-medium',
  }

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titles[action]}</AlertDialogTitle>
          <AlertDialogDescription>{descriptions[action]}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className={buttonStyles[action]}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              buttonLabels[action]
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
