/**
 * UserRequestDetailPanel
 * 40% slide-over showing request details with actions
 * For Draft: Edit/Delete buttons
 * For Submitted: View-only
 */

import { useAtom, useSetAtom } from 'jotai'
import { Trash2, Edit2, X } from 'lucide-react'
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
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { STATUS_COLORS } from '../utils/cascadingUacs'
import { useState } from 'react'
import {
  requestDetailSelectedIdAtom,
  editRequestDialogOpenAtom,
  editingRequestIdAtom,
} from '../atoms/requestAtoms'
import {
  useItemRequests,
  useDeleteItemRequestMutation,
} from '../hooks/useItemRequestQueries'
import { useMemo } from 'react'

export function UserRequestDetailPanel() {
  const [selectedRequestId, setSelectedRequestId] = useAtom(
    requestDetailSelectedIdAtom,
  )
  const { data: response } = useItemRequests({ pageSize: 100 })
  const deleteMutation = useDeleteItemRequestMutation()
  const setEditDialogOpen = useSetAtom(editRequestDialogOpenAtom)
  const setEditingRequestId = useSetAtom(editingRequestIdAtom)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const selectedRequest = useMemo(() => {
    return (response?.data || []).find((req) => req.id === selectedRequestId)
  }, [response?.data, selectedRequestId])

  const handleEditRequest = () => {
    setEditingRequestId(selectedRequestId)
    setEditDialogOpen(true)
  }

  const handleDeleteRequest = async () => {
    if (!selectedRequestId) return
    try {
      await deleteMutation.mutateAsync(selectedRequestId)
      setShowDeleteConfirm(false)
      setSelectedRequestId(null)
    } catch {
      // Error handled in mutation
    }
  }

  const isEditable =
    selectedRequest?.status === 'Draft' || selectedRequest?.status === 'Returned'
  const colors =
    (STATUS_COLORS as Record<string, string>)[
      selectedRequest?.status || 'Submitted'
    ] || STATUS_COLORS['Submitted']

  return (
    <>
      <Sheet
        open={
          !!selectedRequestId &&
          (selectedRequest?.status === 'Draft' ||
            selectedRequest?.status === 'Submitted')
        }
        onOpenChange={(open) => {
          if (!open) setSelectedRequestId(null)
        }}
      >
        <SheetContent
          side="right"
          className="w-[40%] sm:w-full max-w-2xl bg-background border-l border-border"
        >
          <SheetHeader className="space-y-2 pb-6">
            <div className="flex items-start justify-between gap-4">
              <SheetTitle className="text-lg">Request Details</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRequestId(null)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {selectedRequest ? (
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
              {/* Item Image */}
              {selectedRequest.imageUrl && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedRequest.imageUrl}
                    alt={selectedRequest.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Request Header */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{selectedRequest.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={colors}>
                    {selectedRequest.status}
                  </Badge>
                  <Badge variant="outline">
                    {selectedRequest.procurementCategoryName || selectedRequest.procurementCategory || 'Goods'}
                  </Badge>
                </div>
              </div>

              {/* Request Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Unit of Measure
                  </p>
                  <p className="text-sm font-semibold">
                    {selectedRequest.uomName || selectedRequest.unitOfMeasure || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Est. Unit Cost
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    ₱
                    {selectedRequest.estimatedUnitCost.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Item Category
                  </p>
                  <p className="text-sm">{selectedRequest.itemCategory}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Request Date
                  </p>
                  <p className="text-sm">
                    {new Date(selectedRequest.requestDate).toLocaleDateString(
                      'en-PH',
                    )}
                  </p>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  Specifications & Details
                </p>
                <p className="text-sm leading-relaxed rounded-md bg-muted p-3">
                  {selectedRequest.technicalSpecification || selectedRequest.specifications || '—'}
                </p>
              </div>

              {/* Requesting Office & User */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Office
                  </p>
                  <p className="text-sm">{selectedRequest.officeName || selectedRequest.requestingOffice || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Requested By
                  </p>
                  <p className="text-sm">{selectedRequest.createdBy || selectedRequest.requestingUser || '—'}</p>
                </div>
              </div>

              {/* Remarks (if exists) */}
              {(selectedRequest.twgRemarks || selectedRequest.remarks) && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Admin Remarks
                  </p>
                  <p className="text-sm leading-relaxed rounded-md bg-muted p-3 border-l-4 border-amber-500">
                    {selectedRequest.twgRemarks || selectedRequest.remarks}
                  </p>
                </div>
              )}

              {/* Actions (for Draft / Returned requests only) */}
              {isEditable && (
                <div className="pt-6 border-t border-border space-y-2">
                  <Button
                    onClick={handleEditRequest}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Request
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="destructive"
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Request
                  </Button>
                </div>
              )}

              {/* Status Info */}
              {!isEditable && (
                <div className="pt-6 border-t border-border bg-muted/50 p-3 rounded text-xs text-muted-foreground">
                  <p>This request is currently under review.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-center">
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
            <AlertDialogTitle>Delete Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The request will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
