/**
 * ApprovalDetailPanel
 * Slide-over panel for TWG/Admin review of submitted item requests.
 * Features:
 * - Clear separation of Request Summary, Item Details, and Submitted Specifications
 * - Confirmation dialog before Approval
 * - Mandatory remarks requirement for Returning a request
 * - Focused on Phase 1 Item Request data (no downstream UACS/UNSPSC/CSE/catalog fields)
 */

import { useState } from 'react'
import { useAtom } from 'jotai'
import { Check, RotateCcw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { toast } from 'sonner'

import { STATUS_COLORS } from '../utils/cascadingUacs'
import { requestDetailSelectedIdAtom } from '../atoms/requestAtoms'
import {
  useItemRequests,
  useUpdateItemRequestMutation,
} from '../hooks/useItemRequestQueries'
import { formatCurrencyPHP } from '@/utils/formatters'

export function ApprovalDetailPanel() {
  const [selectedRequestId, setSelectedRequestId] = useAtom(
    requestDetailSelectedIdAtom,
  )
  const { data: response } = useItemRequests({ pageSize: 100 })
  const updateMutation = useUpdateItemRequestMutation()

  const [isReturnMode, setIsReturnMode] = useState(false)
  const [returnRemarks, setReturnRemarks] = useState('')
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedRequest = (response?.data || []).find(
    (req) => req.id === selectedRequestId,
  )

  const handleClose = () => {
    setSelectedRequestId(null)
    setIsReturnMode(false)
    setReturnRemarks('')
    setShowApproveConfirm(false)
  }

  const handleConfirmApprove = async () => {
    if (!selectedRequest) return
    try {
      setIsSubmitting(true)
      await updateMutation.mutateAsync({
        id: selectedRequest.id,
        payload: {
          status: 'Approved',
        },
      })
      toast.success('Item request approved.')
      handleClose()
    } catch (err) {
      console.error('Approval error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmReturn = async () => {
    if (!selectedRequest) return
    if (!returnRemarks.trim()) {
      toast.error('Please provide a reason or remarks for returning this request.')
      return
    }
    try {
      setIsSubmitting(true)
      await updateMutation.mutateAsync({
        id: selectedRequest.id,
        payload: {
          status: 'Returned',
          twgRemarks: returnRemarks.trim(),
        },
      })
      toast.success('Item request returned.')
      handleClose()
    } catch (err) {
      console.error('Return error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Field display component
  const FieldDisplay = ({
    label,
    value,
  }: {
    label: string
    value: React.ReactNode
  }) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">
        {value || (
          <span className="italic text-muted-foreground text-xs">—</span>
        )}
      </p>
    </div>
  )

  const Divider = () => <hr className="border-border my-4" />

  const colors =
    (STATUS_COLORS as Record<string, string>)[
      selectedRequest?.status ?? 'Submitted'
    ] || STATUS_COLORS['Submitted']

  return (
    <>
      <Sheet
        open={!!selectedRequestId && selectedRequest?.status === 'Submitted'}
        onOpenChange={(open) => {
          if (!open) handleClose()
        }}
      >
        <SheetContent
          side="right"
          className="w-[45%] sm:w-full max-w-2xl bg-background border-l border-border overflow-y-auto"
        >
          <SheetHeader className="space-y-2 pb-4">
            <SheetTitle className="text-lg">Review Item Request</SheetTitle>
          </SheetHeader>

          {selectedRequest && selectedRequest.status === 'Submitted' && (
            <div className="space-y-5">
              {/* Header: Title & Badges */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  {selectedRequest.name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`font-medium ${colors}`}>
                    {selectedRequest.status}
                  </Badge>
                  <Badge variant="outline">
                    {selectedRequest.procurementCategoryName ||
                      selectedRequest.procurementCategory ||
                      'Goods'}
                  </Badge>
                </div>
              </div>

              <Divider />

              {/* Section 1: Request Summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Request Summary
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <FieldDisplay
                    label="Office"
                    value={
                      selectedRequest.officeName ||
                      selectedRequest.requestingOffice ||
                      '—'
                    }
                  />
                  <FieldDisplay
                    label="Submitted By"
                    value={
                      selectedRequest.createdBy ||
                      selectedRequest.requestingUser ||
                      'system'
                    }
                  />
                  <FieldDisplay
                    label="Request Date"
                    value={new Date(
                      selectedRequest.requestDate,
                    ).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  />
                  <FieldDisplay
                    label="Estimated Unit Cost"
                    value={formatCurrencyPHP(
                      selectedRequest.estimatedUnitCost,
                    )}
                  />
                </div>
              </div>

              <Divider />

              {/* Section 2: Item Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Item Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <FieldDisplay
                    label="Item Name"
                    value={selectedRequest.name}
                  />
                  <FieldDisplay
                    label="Procurement Category"
                    value={
                      selectedRequest.procurementCategoryName ||
                      selectedRequest.procurementCategory ||
                      '—'
                    }
                  />
                  <FieldDisplay
                    label="Item Category"
                    value={selectedRequest.itemCategory}
                  />
                  <FieldDisplay
                    label="Unit of Measure"
                    value={
                      selectedRequest.uomName ||
                      selectedRequest.unitOfMeasure ||
                      '—'
                    }
                  />
                </div>
              </div>

              <Divider />

              {/* Section 3: Submitted Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Submitted Specifications & Justification
                </h4>
                <div className="text-sm leading-relaxed rounded-md bg-muted/40 p-3.5 border border-border whitespace-pre-wrap text-foreground">
                  {selectedRequest.technicalSpecification ||
                    selectedRequest.specifications ||
                    '—'}
                </div>
              </div>

              <Divider />

              {/* Review Actions Mode */}
              {!isReturnMode ? (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsReturnMode(true)}
                    disabled={isSubmitting}
                    className="flex-1 border-amber-300 text-amber-800 dark:text-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Return Request
                  </Button>
                  <Button
                    onClick={() => setShowApproveConfirm(true)}
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              ) : (
                /* Return Mode with Remarks */
                <div className="space-y-4 bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                      <AlertCircle className="h-4 w-4" />
                      Return Request
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsReturnMode(false)}
                      disabled={isSubmitting}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-remarks" className="text-xs font-medium">
                      Remarks / Justification <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="return-remarks"
                      placeholder="Please provide a reason or remarks for returning this request..."
                      value={returnRemarks}
                      onChange={(e) => setReturnRemarks(e.target.value)}
                      disabled={isSubmitting}
                      rows={4}
                      className="min-h-24 bg-background"
                    />
                    {!returnRemarks.trim() && (
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        Remarks are required before returning.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsReturnMode(false)}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleConfirmReturn}
                      disabled={isSubmitting || !returnRemarks.trim()}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {isSubmitting ? 'Returning...' : 'Confirm Return'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Approve Confirmation Dialog */}
      <AlertDialog
        open={showApproveConfirm}
        onOpenChange={setShowApproveConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Item Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this request? It will be marked as Approved in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApprove}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
