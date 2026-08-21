/**
 * ApprovalDetailPanel
 * Slide-over panel for TWG/Admin review of submitted item requests.
 * Displays submitted request data and allows Approve or Reject (Return with remarks) actions.
 */

import { useState } from 'react'
import { useAtom } from 'jotai'
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
import { toast } from 'sonner'

import { STATUS_COLORS } from '../utils/cascadingUacs'
import { requestDetailSelectedIdAtom } from '../atoms/requestAtoms'
import {
  useItemRequests,
  useUpdateItemRequestMutation,
} from '../hooks/useItemRequestQueries'

export function ApprovalDetailPanel() {
  const [selectedRequestId, setSelectedRequestId] = useAtom(
    requestDetailSelectedIdAtom,
  )
  const { data: response } = useItemRequests({ pageSize: 100 })
  const updateMutation = useUpdateItemRequestMutation()

  const [action, setAction] = useState<'review' | 'return'>('review')
  const [returnRemarks, setReturnRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedRequest = (response?.data || []).find(
    (req) => req.id === selectedRequestId,
  )

  const handleClose = () => {
    setSelectedRequestId(null)
    setAction('review')
    setReturnRemarks('')
  }

  const handleApprove = async () => {
    if (!selectedRequest) return
    try {
      setIsSubmitting(true)
      await updateMutation.mutateAsync({
        id: selectedRequest.id,
        payload: {
          status: 'Approved',
        },
      })
      toast.success('Request approved successfully!')
      handleClose()
    } catch (err) {
      console.error('Approval error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReturn = async () => {
    if (!selectedRequest) return
    if (!returnRemarks.trim()) {
      toast.error('Remarks are required when rejecting a request.')
      return
    }
    try {
      setIsSubmitting(true)
      await updateMutation.mutateAsync({
        id: selectedRequest.id,
        payload: {
          status: 'Returned',
          twgRemarks: returnRemarks,
        },
      })
      toast.success('Request returned with remarks.')
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
      <p className="text-sm font-medium">
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
          <SheetTitle className="text-lg">Review Request</SheetTitle>
        </SheetHeader>

        {selectedRequest && selectedRequest.status === 'Submitted' && (
          <div className="space-y-5">
            {/* Request Summary Header */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold">{selectedRequest.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={colors}>
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

            {/* Request Information */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Request Information
              </p>

              {/* Name & Item Type */}
              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay label="Item Name" value={selectedRequest.name} />
                <FieldDisplay
                  label="Procurement Category"
                  value={
                    selectedRequest.procurementCategoryName ||
                    selectedRequest.procurementCategory ||
                    '—'
                  }
                />
              </div>

              {/* Category & UoM */}
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

              {/* Pricing & Date */}
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
                  ).toLocaleDateString('en-PH')}
                />
              </div>

              {/* Office & Submitter */}
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
              </div>

              {/* Technical Specifications */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Technical Specifications / Justification
                </p>
                <p className="text-sm leading-relaxed rounded-md bg-muted p-3 whitespace-pre-wrap">
                  {selectedRequest.technicalSpecification ||
                    selectedRequest.specifications ||
                    '—'}
                </p>
              </div>
            </div>

            <Divider />

            {/* Review Mode: Actions */}
            {action === 'review' && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setAction('return')}
                  disabled={isSubmitting}
                  className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            )}

            {/* Return / Reject Mode */}
            {action === 'return' && (
              <div className="space-y-4 bg-muted/40 p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-destructive">
                    Reject Request with Remarks
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAction('review')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarks">
                    Remarks / Justification <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="remarks"
                    placeholder="Provide mandatory feedback explaining why this request is being rejected..."
                    value={returnRemarks}
                    onChange={(e) => setReturnRemarks(e.target.value)}
                    disabled={isSubmitting}
                    rows={4}
                    className="min-h-24"
                  />
                  {!returnRemarks.trim() && (
                    <p className="text-xs text-muted-foreground">
                      Remarks are required before rejecting.
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setAction('review')}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleReturn}
                    disabled={isSubmitting || !returnRemarks.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isSubmitting ? 'Rejecting...' : 'Confirm Reject'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
