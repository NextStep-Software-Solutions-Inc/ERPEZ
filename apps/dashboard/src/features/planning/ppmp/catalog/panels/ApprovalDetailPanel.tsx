/**
 * ApprovalDetailPanel
 * 40% slide-over for approving/returning item requests.
 * Approve step: Admin fills/edits the full catalog item form before confirming.
 * Return step: Admin provides mandatory remarks.
 *
 * Uses approveItemRequestAtom and returnItemRequestAtom (Jotai write atoms).
 */

import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
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
  itemRequestsAtom,
  approveItemRequestAtom,
  returnItemRequestAtom,
} from '../atoms/catalogAtoms'
import type { CatalogItemFormValues } from '../forms/CatalogItemFormSchema'
import type {
  ApproveItemRequestInput,
  CatalogUoM,
} from '../types/catalog.types'

export function ApprovalDetailPanel() {
  const [selectedRequestId, setSelectedRequestId] = useAtom(
    requestDetailSelectedIdAtom,
  )
  const [itemRequests] = useAtom(itemRequestsAtom)
  const approveRequest = useSetAtom(approveItemRequestAtom)
  const returnRequest = useSetAtom(returnItemRequestAtom)

  const [action, setAction] = useState<'approve' | 'return' | null>('approve')
  const [returnRemarks, setReturnRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedRequest = itemRequests.find(
    (req) => req.id === selectedRequestId,
  )

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
      <p className="text-sm">
        {value || (
          <span className="italic text-muted-foreground text-xs">—</span>
        )}
      </p>
    </div>
  )

  const Divider = () => <hr className="border-border my-3" />

  const handleApprove = (formData: CatalogItemFormValues) => {
    if (!selectedRequest) return
    try {
      setIsSubmitting(true)
      const input: ApproveItemRequestInput = {
        requestId: selectedRequest.id,
        catalogItem: {
          name: formData.name,
          category: formData.category,
          subcategory: formData.subcategory ?? null,
          unitOfMeasure: formData.unitOfMeasure,
          currentPrice: formData.currentPrice,
          specification: formData.specification ?? '',
          itemType: formData.itemType,
          supplier: formData.supplier ?? null,
          imageUrl: formData.imageUrl ?? null,
          uacsCode: formData.uacsCode ?? null,
          unspscCode: formData.unspscCode,
          isCSE: formData.isCSE ?? false,
          sourceRequestId: selectedRequest.id,
          isActive: true,
        },
      }
      approveRequest(input)
      toast.success('Request approved — item added to catalog.')
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReturn = () => {
    if (!selectedRequest) return
    if (!returnRemarks.trim()) {
      toast.error('Remarks are required when returning a request.')
      return
    }
    try {
      setIsSubmitting(true)
      returnRequest({ requestId: selectedRequest.id, remarks: returnRemarks })
      toast.success('Request returned with remarks.')
      handleClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to return request.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedRequestId(null)
    setAction(null)
    setReturnRemarks('')
  }

  const colors = STATUS_COLORS[selectedRequest?.status ?? 'Submitted']

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
                  {selectedRequest.procurementCategory}
                </Badge>
              </div>
            </div>

            {/* Submitter info */}
            <div className="grid grid-cols-2 gap-3 text-sm bg-muted/50 rounded-lg p-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Submitted By
                </p>
                <p className="font-medium">{selectedRequest.requestingUser}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Office
                </p>
                <p className="font-medium">
                  {selectedRequest.requestingOffice}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Request Date
                </p>
                <p className="font-medium">
                  {new Date(selectedRequest.requestDate).toLocaleDateString(
                    'en-PH',
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Est. Unit Cost
                </p>
                <p className="font-semibold text-primary">
                  ₱
                  {selectedRequest.estimatedUnitCost.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Specifications preview */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-medium">
                Submitted Specifications
              </p>
              <p className="text-sm leading-relaxed rounded-md bg-muted p-3">
                {selectedRequest.specifications}
              </p>
            </div>

            {/* Request image */}
            {selectedRequest.imageUrl && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Attached Image
                </p>
                <img
                  src={selectedRequest.imageUrl}
                  alt={selectedRequest.name}
                  className="w-full max-h-40 object-cover rounded-lg border border-border"
                />
              </div>
            )}

            <Divider />
            {action === 'approve' && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-green-700">
                  Catalog Item
                </p>

                {/* Item Image at Top */}
                {selectedRequest.imageUrl && (
                  <>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={selectedRequest.imageUrl}
                        alt={selectedRequest.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Divider />
                  </>
                )}

                {/* Complete Item Details - All Read-Only */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Item Information
                  </p>

                  {/* Name & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <FieldDisplay label="Name" value={selectedRequest.name} />
                    <FieldDisplay
                      label="Item Type"
                      value={selectedRequest.procurementCategory}
                    />
                  </div>

                  {/* Category & Subcategory */}
                  <div className="grid grid-cols-2 gap-4">
                    <FieldDisplay
                      label="Category"
                      value={selectedRequest.itemCategory}
                    />
                    <FieldDisplay
                      label="Subcategory"
                      value={selectedRequest.itemCategory}
                    />
                  </div>

                  {/* UoM & Supplier */}
                  <div className="grid grid-cols-2 gap-4">
                    <FieldDisplay
                      label="Unit of Measure"
                      value={selectedRequest.unitOfMeasure}
                    />
                    <FieldDisplay label="Supplier" value="—" />
                  </div>

                  <Divider />

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-4">
                    <FieldDisplay
                      label="Current Unit Price"
                      value={`₱${selectedRequest.estimatedUnitCost.toLocaleString(
                        'en-PH',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}`}
                    />
                    <FieldDisplay
                      label="Status"
                      value={selectedRequest.status}
                    />
                  </div>

                  <Divider />

                  {/* Specification */}
                  {selectedRequest.specifications && (
                    <>
                      <FieldDisplay
                        label="Specification"
                        value={
                          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                            {selectedRequest.specifications}
                          </p>
                        }
                      />
                      <Divider />
                    </>
                  )}

                  {/* Requestor Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <FieldDisplay
                      label="Requesting Office"
                      value={selectedRequest.requestingOffice}
                    />
                    <FieldDisplay
                      label="Requesting User"
                      value={selectedRequest.requestingUser}
                    />
                  </div>

                  <FieldDisplay
                    label="Request Date"
                    value={new Date(
                      selectedRequest.requestDate,
                    ).toLocaleDateString('en-PH')}
                  />
                </div>

                <Divider />

                {/* Editable Fields - Only UACS, UNSPSC, CSE */}
                <div className="space-y-4 bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    Editable Fields
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="uacsCode" className="text-xs font-medium">
                        UACS Code
                      </Label>
                      <input
                        id="uacsCode"
                        type="text"
                        defaultValue={selectedRequest.uacsCode ?? ''}
                        placeholder="Enter UACS code"
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="unspscCode"
                        className="text-xs font-medium"
                      >
                        UNSPSC Code <span className="text-red-500">*</span>
                      </Label>
                      <input
                        id="unspscCode"
                        type="text"
                        defaultValue={selectedRequest.unspscCode || ''}
                        placeholder="Enter UNSPSC code"
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="isCSE"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        id="isCSE"
                        type="checkbox"
                        defaultChecked={false}
                        className="w-4 h-4 rounded border-input"
                      />
                      <span className="text-sm font-medium">CSE Item</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Mark as Common Service Equipment if applicable
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setAction('return')}
                    disabled={isSubmitting}
                    className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Reject'}
                  </Button>
                  <Button
                    onClick={() => {
                      // Get values from inputs
                      const uacsCode =
                        (
                          document.getElementById(
                            'uacsCode',
                          ) as HTMLInputElement
                        )?.value ?? null
                      const unspscCode = (
                        document.getElementById(
                          'unspscCode',
                        ) as HTMLInputElement
                      )?.value
                      const isCSE =
                        (document.getElementById('isCSE') as HTMLInputElement)
                          ?.checked ?? false

                      if (!unspscCode?.trim()) {
                        toast.error('UNSPSC code is required')
                        return
                      }

                      const formData: CatalogItemFormValues = {
                        name: selectedRequest.name,
                        itemType: selectedRequest.procurementCategory,
                        category: selectedRequest.itemCategory,
                        subcategory: null,
                        unitOfMeasure:
                          selectedRequest.unitOfMeasure as CatalogUoM,
                        currentPrice: selectedRequest.estimatedUnitCost,
                        specification: selectedRequest.specifications,
                        supplier: null,
                        imageUrl: selectedRequest.imageUrl ?? null,
                        uacsCode: uacsCode,
                        unspscCode: unspscCode,
                        isCSE: isCSE,
                        status: 'Active',
                      }
                      handleApprove(formData)
                    }}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              </div>
            )}

            {/* Return: Remarks form */}
            {action === 'return' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-700">
                    Return with Remarks
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAction('approve')}
                    disabled={isSubmitting}
                  >
                    ← Back
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>
                    Remarks <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    placeholder="Explain why this request is being returned..."
                    value={returnRemarks}
                    onChange={(e) => setReturnRemarks(e.target.value)}
                    disabled={isSubmitting}
                    rows={4}
                    className="min-h-24"
                  />
                  {!returnRemarks.trim() && (
                    <p className="text-xs text-muted-foreground">
                      Remarks are required before returning.
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setAction('approve')}
                    disabled={isSubmitting}
                    className="flex-1 text-green-700 border-green-300 hover:bg-green-50"
                  >
                    ← Back to Approve
                  </Button>
                  <Button
                    onClick={handleReturn}
                    disabled={isSubmitting || !returnRemarks.trim()}
                    className="bg-amber-600 hover:bg-amber-700 flex-1"
                  >
                    {isSubmitting ? 'Rejecting...' : 'Reject Request'}
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
