/**
 * ItemDetailReadOnlyPanel
 * 40% slide-over for viewing approved and returned catalog items.
 * All fields are read-only.
 * For Returned status, displays the return remarks.
 *
 * Uses requestDetailSelectedIdAtom (Jotai atom for selection).
 */

import { useAtom, useSetAtom } from 'jotai'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { STATUS_COLORS } from '../utils/cascadingUacs'
import {
  requestDetailSelectedIdAtom,
  editRequestDialogOpenAtom,
  editingRequestIdAtom,
} from '../atoms/requestAtoms'
import { useItemRequests } from '../hooks/useItemRequestQueries'

export function ItemDetailReadOnlyPanel() {
  const [selectedItemId, setSelectedItemId] = useAtom(
    requestDetailSelectedIdAtom,
  )
  const { data: response } = useItemRequests({ pageSize: 100 })
  const setEditDialogOpen = useSetAtom(editRequestDialogOpenAtom)
  const setEditingRequestId = useSetAtom(editingRequestIdAtom)

  const selectedItem = (response?.data || []).find((item) => item.id === selectedItemId)

  const isApprovedOrReturned =
    selectedItem?.status === 'Approved' || selectedItem?.status === 'Returned'

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

  const handleClose = () => {
    setSelectedItemId(null)
  }

  const handleEditReturnedRequest = () => {
    if (!selectedItem) return
    setEditingRequestId(selectedItem.id)
    setEditDialogOpen(true)
  }

  const colors =
    (STATUS_COLORS as Record<string, string>)[selectedItem?.status ?? 'Submitted'] ||
    STATUS_COLORS['Submitted']

  return (
    <Sheet
      open={!!selectedItemId && isApprovedOrReturned}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <SheetContent
        side="right"
        className="w-[45%] sm:w-full max-w-2xl bg-background border-l border-border overflow-y-auto"
      >
        <SheetHeader className="space-y-2 pb-4">
          <SheetTitle className="text-lg">Item Details</SheetTitle>
        </SheetHeader>

        {selectedItem && isApprovedOrReturned && (
          <div className="space-y-5">
            {/* Item Summary Header */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold">{selectedItem.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={colors}>
                  {selectedItem.status}
                </Badge>
                <Badge variant="outline">
                  {selectedItem.procurementCategoryName || selectedItem.procurementCategory || 'Goods'}
                </Badge>
              </div>
            </div>

            {/* Submitter info */}
            <div className="grid grid-cols-2 gap-3 text-sm bg-muted/50 rounded-lg p-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Submitted By
                </p>
                <p className="font-medium">{selectedItem.createdBy || selectedItem.requestingUser || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Office
                </p>
                <p className="font-medium">{selectedItem.officeName || selectedItem.requestingOffice || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Request Date
                </p>
                <p className="font-medium">
                  {new Date(selectedItem.requestDate).toLocaleDateString(
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
                  {selectedItem.estimatedUnitCost.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Original Specifications */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-medium">
                Submitted Specifications
              </p>
              <p className="text-sm leading-relaxed rounded-md bg-muted p-3">
                {selectedItem.technicalSpecification || selectedItem.specifications || '—'}
              </p>
            </div>

            <Divider />

            {/* Item Details - All Read-Only */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Item Information
              </p>

              {/* Name & Item Type */}
              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay label="Name" value={selectedItem.name} />
                <FieldDisplay
                  label="Item Type"
                  value={selectedItem.procurementCategoryName || selectedItem.procurementCategory || 'Goods'}
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay
                  label="Category"
                  value={selectedItem.itemCategory}
                />
                <FieldDisplay
                  label="Subcategory"
                  value={selectedItem.itemCategory}
                />
              </div>

              {/* UoM & Supplier */}
              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay
                  label="Unit of Measure"
                  value={selectedItem.unitOfMeasure}
                />
                <FieldDisplay label="Supplier" value="—" />
              </div>

              <Divider />

              {/* Pricing & Status */}
              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay
                  label="Current Unit Price"
                  value={`₱${selectedItem.estimatedUnitCost.toLocaleString(
                    'en-PH',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}`}
                />
                <FieldDisplay label="Status" value={selectedItem.status} />
              </div>

              <Divider />

              {/* Specification */}
              {selectedItem.specifications && (
                <>
                  <FieldDisplay
                    label="Specification"
                    value={
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {selectedItem.specifications}
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
                  value={selectedItem.requestingOffice}
                />
                <FieldDisplay
                  label="Requesting User"
                  value={selectedItem.requestingUser}
                />
              </div>

              <FieldDisplay
                label="Request Date"
                value={new Date(selectedItem.requestDate).toLocaleDateString(
                  'en-PH',
                )}
              />

              <Divider />

              {/* Classification Fields - Read-Only */}
              <div className="space-y-4 bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                  Classification
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <FieldDisplay
                    label="UACS Code"
                    value={selectedItem.uacsCode ?? '—'}
                  />
                  <FieldDisplay
                    label="UNSPSC Code"
                    value={selectedItem.unspscCode ?? '—'}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    CSE Item
                  </p>
                  <Badge variant={selectedItem.isCSE ? 'soft' : 'outline'}>
                    {selectedItem.isCSE ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Return Remarks - Only show if Returned */}
            {selectedItem.status === 'Returned' && (
              <>
                <Divider />
                <div className="space-y-2 bg-amber-50 dark:bg-amber-950 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    Return Remarks
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {selectedItem.remarks ?? '—'}
                  </p>
                </div>
              </>
            )}

            {selectedItem.status === 'Returned' && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={handleEditReturnedRequest}
                  className="w-full gap-2"
                >
                  Edit & Resubmit
                </Button>
              </div>
            )}

            {/* Close Button */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
