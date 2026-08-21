/**
 * UserRequestDetailPanel
 * Slide-over detail panel for item requests in My Requests.
 * Supports contextual actions and timeline based on status:
 * - Draft: Submit Request (primary), Edit Request (secondary), Delete Request (destructive with confirmation)
 * - Submitted: Read-only view with review status notice
 * - Approved: Read-only view with approval status notice
 * - Returned: Read-only view with highlighted TWG remarks and Edit & Resubmit action
 */

import { useState, useMemo } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Trash2, Edit2, Send, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { STATUS_COLORS } from '../utils/cascadingUacs'
import { toast } from 'sonner'
import {
  requestDetailSelectedIdAtom,
  editRequestDialogOpenAtom,
  editingRequestIdAtom,
} from '../atoms/requestAtoms'
import {
  useItemRequests,
  useDeleteItemRequestMutation,
  useUpdateItemRequestMutation,
} from '../hooks/useItemRequestQueries'

export function UserRequestDetailPanel() {
  const [selectedRequestId, setSelectedRequestId] = useAtom(
    requestDetailSelectedIdAtom,
  )
  const { data: response } = useItemRequests({ pageSize: 100 })
  const deleteMutation = useDeleteItemRequestMutation()
  const updateMutation = useUpdateItemRequestMutation()
  const setEditDialogOpen = useSetAtom(editRequestDialogOpenAtom)
  const setEditingRequestId = useSetAtom(editingRequestIdAtom)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false)

  const selectedRequest = useMemo(() => {
    return (response?.data || []).find((req) => req.id === selectedRequestId)
  }, [response?.data, selectedRequestId])

  const handleEditRequest = () => {
    if (!selectedRequestId) return
    setEditingRequestId(selectedRequestId)
    setEditDialogOpen(true)
  }

  const handleSubmitDraft = async () => {
    if (!selectedRequestId || !selectedRequest) return
    try {
      setIsSubmittingDraft(true)
      await updateMutation.mutateAsync({
        id: selectedRequestId,
        payload: {
          status: 'Submitted',
        },
      })
      toast.success(
        'Item request submitted successfully! It is now under Technical Working Group review.',
      )
      setSelectedRequestId(null)
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmittingDraft(false)
    }
  }

  const handleDeleteRequest = async () => {
    if (!selectedRequestId) return
    try {
      await deleteMutation.mutateAsync(selectedRequestId)
      toast.success('Draft item request deleted.')
      setShowDeleteConfirm(false)
      setSelectedRequestId(null)
    } catch {
      // Error handled in mutation
    }
  }

  const isDraft = selectedRequest?.status === 'Draft'
  const isSubmitted = selectedRequest?.status === 'Submitted'
  const isApproved = selectedRequest?.status === 'Approved'
  const isReturned = selectedRequest?.status === 'Returned'

  const colors =
    (STATUS_COLORS as Record<string, string>)[
      selectedRequest?.status || 'Submitted'
    ] || STATUS_COLORS['Submitted']

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
      <p className="text-sm font-medium">
        {value || (
          <span className="italic text-muted-foreground text-xs">—</span>
        )}
      </p>
    </div>
  )

  const Divider = () => <hr className="border-border my-4" />

  return (
    <>
      <Sheet
        open={!!selectedRequestId}
        onOpenChange={(open) => {
          if (!open) setSelectedRequestId(null)
        }}
      >
        <SheetContent
          side="right"
          className="w-[45%] sm:w-full max-w-2xl bg-background border-l border-border overflow-y-auto"
        >
          <SheetHeader className="space-y-2 pb-4">
            <SheetTitle className="text-lg">Request Details</SheetTitle>
          </SheetHeader>

          {selectedRequest ? (
            <div className="space-y-5">
              {/* Header: Name & Badges */}
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

              {/* Status Notice Banners */}
              {isSubmitted && (
                <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Under TWG Review</p>
                    <p className="mt-0.5 text-blue-700 dark:text-blue-400">
                      This request has been submitted and is currently being reviewed by the Technical Working Group.
                    </p>
                  </div>
                </div>
              )}

              {isApproved && (
                <div className="flex items-start gap-3 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Request Approved</p>
                    <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                      This item request has been approved by the Technical Working Group.
                    </p>
                  </div>
                </div>
              )}

              {isReturned && (
                <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <p className="font-semibold">Returned for Revision</p>
                    {(selectedRequest.twgRemarks || selectedRequest.remarks) && (
                      <div className="mt-2 p-2.5 bg-background/80 rounded border border-amber-300 dark:border-amber-700 text-foreground font-normal">
                        <span className="font-semibold text-xs text-muted-foreground block mb-0.5">
                          Admin Remarks:
                        </span>
                        {selectedRequest.twgRemarks || selectedRequest.remarks}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Divider />

              {/* Request Information Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Request Information
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <FieldDisplay
                    label="Estimated Unit Cost"
                    value={`₱${selectedRequest.estimatedUnitCost.toLocaleString(
                      'en-PH',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}`}
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FieldDisplay
                    label="Requesting Office"
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
                </div>
              </div>

              <Divider />

              {/* Technical Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Technical Specifications & Justification
                </h4>
                <div className="text-sm leading-relaxed rounded-md bg-muted/40 p-3.5 border border-border whitespace-pre-wrap">
                  {selectedRequest.technicalSpecification ||
                    selectedRequest.specifications ||
                    '—'}
                </div>
              </div>

              <Divider />

              {/* Contextual Actions */}
              {isDraft && (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleEditRequest}
                      className="flex-1 gap-2"
                      variant="outline"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Request
                    </Button>
                    <Button
                      onClick={handleSubmitDraft}
                      disabled={isSubmittingDraft}
                      className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmittingDraft ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Draft
                    </Button>
                  </div>
                </div>
              )}

              {isReturned && (
                <div className="pt-2">
                  <Button
                    onClick={handleEditRequest}
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit & Resubmit Request
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No request selected
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this draft item request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
