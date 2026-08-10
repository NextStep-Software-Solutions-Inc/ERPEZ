import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Send, Trash2, Check, XCircle } from 'lucide-react'
import api from '@/services/api'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { deleteLIBRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/deleteLIBRequest'
import {
  useSubmitLIBAmendment,
  useDeleteLIBAmendment,
  useApproveLIBAmendment,
  useReturnLIBAmendment,
} from '../hooks/useLIBAmendments'
import { DraftAmendmentActivityView } from './DraftAmendmentActivityView'
import { DraftAmendmentProjectView } from './DraftAmendmentProjectView'
import type { LIBAmendment } from '../../line-item-budget/types/type'
import type { Activity, ObjectGroup } from '../types/realignment.types'
import type { LIB, LIBDetails } from '../../line-item-budget/types'
import { useDashboardRole } from '@/hooks/useDashboardRole'
import { useRealignmentStore } from '../store/realignmentStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface AmendmentEditPanelProps {
  amendment: LIBAmendment
  originalLib: LIB
  approvedActivities: Activity[]
  approvedProjectGroups: ObjectGroup[]
}

const useDeleteLIB = createMutationHookFromTemplate(deleteLIBRequest)

export function AmendmentEditPanel({
  amendment,
  originalLib,
  approvedActivities,
  approvedProjectGroups,
}: AmendmentEditPanelProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [draftLib, setDraftLib] = useState<LIBDetails | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const { isPlanningUser } = useDashboardRole()
  const activeOpcrData = useRealignmentStore((state) => state.activeOpcrData)
  const activeWfpData = useRealignmentStore((state) => state.activeWfpData)

  const { mutateAsync: submitAmendment, isPending: isSubmitting } =
    useSubmitLIBAmendment()
  const { mutateAsync: deleteAmendment, isPending: isDeleting } =
    useDeleteLIBAmendment()
  const { mutateAsync: approveAmendment, isPending: isApproving } =
    useApproveLIBAmendment()
  const { mutateAsync: returnAmendment, isPending: isReturning } =
    useReturnLIBAmendment()
  const { mutateAsync: deleteCloneBudget } = useDeleteLIB()

  const [showReturnRemarks, setShowReturnRemarks] = useState(false)
  const [returnRemarksText, setReturnRemarksText] = useState('')

  const handleApprove = async () => {
    if (
      confirm(
        'Are you sure you want to approve this budget realignment request? This will merge the changes into the official Line Item Budget.',
      )
    ) {
      try {
        await approveAmendment({
          pathParams: { id: amendment.id },
        })
        toast({
          title: 'Approved Successfully',
          description: 'The budget realignment request has been approved.',
        })
        await queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].startsWith('/lib-amendment-requests') ||
              query.queryKey[0].startsWith('/libs')),
        })
      } catch (err) {
        console.error('Failed to approve realignment request:', err)
        toast({
          title: 'Error',
          description:
            err instanceof Error
              ? err.message
              : 'Failed to approve realignment request.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleReturnSubmit = async () => {
    if (!returnRemarksText.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide return remarks.',
        variant: 'destructive',
      })
      return
    }

    try {
      await returnAmendment({
        pathParams: { id: amendment.id },
      })
      toast({
        title: 'Returned Successfully',
        description: 'The realignment request has been returned to draft.',
      })
      setShowReturnRemarks(false)
      setReturnRemarksText('')
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          (query.queryKey[0].startsWith('/lib-amendment-requests') ||
            query.queryKey[0].startsWith('/libs')),
      })
    } catch (err) {
      console.error('Failed to return realignment request:', err)
      toast({
        title: 'Error',
        description:
          err instanceof Error
            ? err.message
            : 'Failed to return realignment request.',
        variant: 'destructive',
      })
    }
  }

  const loadDraftLib = async () => {
    setIsLoading(true)
    try {
      const res = await api.get<{ data: LIBDetails }>(`/libs/${amendment.proposedLineItemBudgetId}`)
      const data = res.data?.data
      if (data) {
        setDraftLib(data)
      }
    } catch (err) {
      console.error('Failed to load draft clone LIB:', err)
      toast({
        title: 'Error',
        description: 'Failed to load proposed realignment budget details.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDraftLib()
  }, [amendment.proposedLineItemBudgetId])

  const handleSubmitForApproval = async () => {
    try {
      await submitAmendment({
        pathParams: { id: amendment.id },
      })
      // Invalidate queries to refresh parent state and status
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          (query.queryKey[0].startsWith('/lib-amendment-requests') ||
            query.queryKey[0].startsWith('/libs')),
      })
    } catch (err) {
      console.error('Failed to submit realignment request:', err)
      toast({
        title: 'Error',
        description: 'Failed to submit realignment request. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDiscard = async () => {
    if (
      confirm(
        'Are you sure you want to discard and delete this realignment request? This will permanently delete your draft budget clone.',
      )
    ) {
      try {
        await deleteAmendment({
          pathParams: { id: amendment.id },
        })

        // Delete the clone budget directly
        if (amendment.proposedLineItemBudgetId) {
          try {
            await deleteCloneBudget({
              pathParams: { id: amendment.proposedLineItemBudgetId },
            })
          } catch (cloneErr) {
            console.warn('Failed to delete budget clone:', cloneErr)
          }
        }

        await queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].startsWith('/lib-amendment-requests') ||
              query.queryKey[0].startsWith('/libs')),
        })
      } catch (err) {
        console.error('Failed to delete amendment request:', err)
        toast({
          title: 'Error',
          description:
            'Failed to discard realignment request. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs font-medium">
          Loading realignment details...
        </span>
      </div>
    )
  }

  if (!draftLib) {
    return (
      <div className="text-center py-8 text-red-500 font-medium text-xs">
        Failed to fetch proposed budget details. Please try again.
      </div>
    )
  }

  const isReadOnly = amendment.status === 'Submitted'

  return (
    <div className="space-y-6">
      {/* Visual Sandbox Editor Container */}
      <div className="bg-gradient-to-br from-indigo-50/30 to-violet-50/20 border-2 border-dashed border-indigo-500/25 p-6 rounded-xl relative shadow-md shadow-indigo-500/5 transition-all duration-300 hover:border-indigo-500/45 hover:shadow-lg hover:shadow-indigo-500/10">
        {/* Floating Top Accent Badges */}
        <div className="absolute top-0 right-6 -translate-y-1/2 flex items-center gap-1.5 z-10">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
          </span>
          <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-0.5 border-none shadow-sm">
            Realignment Sandbox
          </Badge>
          <Badge variant="outline" className="bg-violet-50 text-violet-750 font-bold text-[9px] uppercase px-2.5 py-0.5 border-violet-100 shadow-sm">
            Draft v{draftLib.version} Clone
          </Badge>
        </div>

        {/* Realignment Draft Content Editor */}
        {originalLib.scope === 'Project' ? (
          <DraftAmendmentProjectView
            draftLibId={amendment.proposedLineItemBudgetId}
            draftLib={draftLib}
            approvedProjectGroups={approvedProjectGroups}
            readOnly={isReadOnly}
          />
        ) : (
          <DraftAmendmentActivityView
            draftLibId={amendment.proposedLineItemBudgetId}
            draftLib={draftLib}
            approvedActivities={approvedActivities}
            opcrData={activeOpcrData}
            wfpData={activeWfpData}
            readOnly={isReadOnly}
          />
        )}
      </div>

      {/* Action Footer for Submission / Discard */}
      {!isReadOnly && (
        <div className="flex justify-between pt-4 border-t border-dashed border-slate-200">
          <Button
            onClick={handleDiscard}
            disabled={isDeleting || isSubmitting}
            variant="destructive"
            className="text-xs h-9 gap-1.5 font-semibold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Discarding...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Discard Request
              </>
            )}
          </Button>

          <Button
            onClick={handleSubmitForApproval}
            disabled={isSubmitting || isDeleting}
            className="bg-green-600 hover:bg-green-700 text-white text-xs h-9 gap-1.5 font-semibold shadow-sm transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Submit for Approval
              </>
            )}
          </Button>
        </div>
      )}

      {/* Reviewer Action Footer */}
      {isReadOnly && isPlanningUser && amendment.status === 'Submitted' && (
        <div className="flex justify-end gap-3 pt-4 border-t border-dashed border-slate-200">
          <Button
            onClick={() => setShowReturnRemarks(true)}
            disabled={isApproving || isReturning}
            variant="outline"
            className="text-xs h-9 gap-1.5 font-semibold border-red-250 text-red-600 hover:bg-red-50/50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Return Realignment
          </Button>

          <Button
            onClick={handleApprove}
            disabled={isApproving || isReturning}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5 font-semibold shadow-sm"
          >
            {isApproving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Approve Realignment
              </>
            )}
          </Button>
        </div>
      )}

      {/* Return Remarks Dialog */}
      <Dialog open={showReturnRemarks} onOpenChange={setShowReturnRemarks}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5 text-red-600">
              <XCircle className="w-5 h-5" /> Return Realignment Request
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide instructions or reason for returning this request back to
              draft.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              value={returnRemarksText}
              onChange={(e) => setReturnRemarksText(e.target.value)}
              placeholder="Explain what needs to be adjusted..."
              rows={4}
              className="text-xs font-semibold"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReturnRemarks(false)}
              disabled={isReturning}
              className="text-xs h-9 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReturnSubmit}
              disabled={!returnRemarksText.trim() || isReturning}
              className="bg-red-600 hover:bg-red-750 text-white text-xs h-9 font-semibold"
            >
              {isReturning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Returning...
                </>
              ) : (
                'Return to Draft'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
