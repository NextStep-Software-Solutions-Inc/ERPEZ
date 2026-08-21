/**
 * ItemDetailReadOnlyPanel
 * Slide-over detail panel for viewing approved or returned item requests in the Admin Queue.
 * All fields are presented in a clean read-only structure.
 * Displays TWG remarks for Returned requests.
 */

import { useAtom } from 'jotai'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { CheckCircle2, AlertCircle } from 'lucide-react'

import { STATUS_COLORS } from '../utils/cascadingUacs'
import { requestDetailSelectedIdAtom } from '../atoms/requestAtoms'
import { useItemRequests } from '../hooks/useItemRequestQueries'

export function ItemDetailReadOnlyPanel() {
  const [selectedItemId, setSelectedItemId] = useAtom(
    requestDetailSelectedIdAtom,
  )
  const { data: response } = useItemRequests({ pageSize: 100 })

  const selectedItem = (response?.data || []).find(
    (item) => item.id === selectedItemId,
  )

  const isApprovedOrReturned =
    selectedItem?.status === 'Approved' || selectedItem?.status === 'Returned'

  const handleClose = () => {
    setSelectedItemId(null)
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
      selectedItem?.status ?? 'Submitted'
    ] || STATUS_COLORS['Submitted']

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
          <SheetTitle className="text-lg">Item Request Details</SheetTitle>
        </SheetHeader>

        {selectedItem && isApprovedOrReturned && (
          <div className="space-y-5">
            {/* Header: Title & Status */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                {selectedItem.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`font-medium ${colors}`}>
                  {selectedItem.status}
                </Badge>
                <Badge variant="outline">
                  {selectedItem.procurementCategoryName ||
                    selectedItem.procurementCategory ||
                    'Goods'}
                </Badge>
              </div>
            </div>

            {/* Status Notice Banner */}
            {selectedItem.status === 'Approved' && (
              <div className="flex items-start gap-3 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Approved by TWG</p>
                  <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                    This item request has been approved by the Technical Working Group.
                  </p>
                </div>
              </div>
            )}

            {selectedItem.status === 'Returned' && (
              <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <p className="font-semibold">Returned to Requesting Office</p>
                  {(selectedItem.twgRemarks || selectedItem.remarks) && (
                    <div className="mt-2 p-2.5 bg-background/80 rounded border border-amber-300 dark:border-amber-700 text-foreground font-normal">
                      <span className="font-semibold text-xs text-muted-foreground block mb-0.5">
                        TWG Remarks:
                      </span>
                      {selectedItem.twgRemarks || selectedItem.remarks}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Divider />

            {/* Request Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Request Information
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay
                  label="Office"
                  value={
                    selectedItem.officeName ||
                    selectedItem.requestingOffice ||
                    '—'
                  }
                />
                <FieldDisplay
                  label="Submitted By"
                  value={
                    selectedItem.createdBy ||
                    selectedItem.requestingUser ||
                    'system'
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay
                  label="Request Date"
                  value={new Date(selectedItem.requestDate).toLocaleDateString(
                    'en-PH',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    },
                  )}
                />
                <FieldDisplay
                  label="Estimated Unit Cost"
                  value={`₱${selectedItem.estimatedUnitCost.toLocaleString(
                    'en-PH',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}`}
                />
              </div>
            </div>

            <Divider />

            {/* Item Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Item Details
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay
                  label="Procurement Category"
                  value={
                    selectedItem.procurementCategoryName ||
                    selectedItem.procurementCategory ||
                    '—'
                  }
                />
                <FieldDisplay
                  label="Item Category"
                  value={selectedItem.itemCategory}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay
                  label="Unit of Measure"
                  value={
                    selectedItem.uomName ||
                    selectedItem.unitOfMeasure ||
                    '—'
                  }
                />
                <FieldDisplay
                  label="Current Status"
                  value={selectedItem.status}
                />
              </div>
            </div>

            <Divider />

            {/* Technical Specifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Technical Specifications & Justification
              </h4>
              <div className="text-sm leading-relaxed rounded-md bg-muted/40 p-3.5 border border-border whitespace-pre-wrap text-foreground">
                {selectedItem.technicalSpecification ||
                  selectedItem.specifications ||
                  '—'}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
