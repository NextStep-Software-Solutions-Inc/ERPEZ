/**
 * RequestDetailPanel
 * Unified detail panel for viewing item requests (Draft, Submitted, Approved, Returned)
 * Read-only display with conditional content based on request status.
 * Shows request details + status-specific information.
 */

import { useAtom, useAtomValue } from 'jotai'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  requestDetailSelectedIdAtom,
  requestDetailPanelVisibleAtom,
} from '../atoms/requestAtoms'
import { catalogItemsAtom } from '../atoms/catalogAtoms'
import { useItemRequests } from '../hooks/useItemRequestQueries'
import { cn } from '@/lib/utils'
import { STATUS_COLORS } from '../utils/cascadingUacs'

export function RequestDetailPanel() {
  const [selectedRequestId, setSelectedRequestId] = useAtom(
    requestDetailSelectedIdAtom,
  )
  const [visibleAtom, setVisible] = useAtom(requestDetailPanelVisibleAtom)
  const { data: response } = useItemRequests({ pageSize: 100 })
  const catalogItems = useAtomValue(catalogItemsAtom)

  const selectedRequest = (response?.data || []).find(
    (req) => req.id === selectedRequestId,
  )

  // For approved requests, find the created catalog item
  const createdCatalogItem =
    selectedRequest?.status === 'Approved'
      ? catalogItems.find((item) => item.sourceRequestId === selectedRequest.id)
      : null

  const colors =
    (STATUS_COLORS as Record<string, string>)[selectedRequest?.status ?? 'Submitted'] ||
    STATUS_COLORS['Submitted']

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

  const Divider = () => <hr className="border-border my-4" />

  const handleClose = () => {
    setSelectedRequestId(null)
    setVisible(false)
  }

  return (
    <Sheet open={visibleAtom && !!selectedRequestId} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-[45%] sm:w-full max-w-2xl bg-background border-l border-border overflow-y-auto"
      >
        <SheetHeader className="space-y-2 pb-4">
          <SheetTitle className="text-lg">Request Details</SheetTitle>
        </SheetHeader>

        {selectedRequest && (
          <div className="space-y-4">
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

            <Divider />

            {/* Request Information */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Request Information
              </p>

              {/* Name & Category */}
              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay
                  label="Item Category"
                  value={selectedRequest.itemCategory}
                />
                <FieldDisplay
                  label="Procurement Category"
                  value={selectedRequest.procurementCategoryName || selectedRequest.procurementCategory || 'Goods'}
                />
              </div>

              {/* UACS & UoM */}
              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay
                  label="UACS Code"
                  value={
                    selectedRequest.uacsCode ? (
                      <span className="font-mono text-xs">
                        {selectedRequest.uacsCode}
                      </span>
                    ) : (
                      '—'
                    )
                  }
                />
                <FieldDisplay
                  label="Unit of Measure"
                  value={selectedRequest.uomName || selectedRequest.unitOfMeasure || '—'}
                />
              </div>

              {/* Pricing & Codes */}
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
            </div>

            <Divider />

            {/* Requestor Information */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Requestor Information
              </p>

              <div className="grid grid-cols-2 gap-4">
                <FieldDisplay
                  label="Requesting Office"
                  value={selectedRequest.officeName || selectedRequest.requestingOffice || '—'}
                />
                <FieldDisplay
                  label="Requesting User"
                  value={selectedRequest.createdBy || selectedRequest.requestingUser || '—'}
                />
              </div>
            </div>

            <Divider />

            {/* Specification */}
            {selectedRequest.specifications && (
              <>
                <FieldDisplay
                  label="Specifications"
                  value={
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {selectedRequest.specifications}
                    </p>
                  }
                />
                <Divider />
              </>
            )}

            {/* Status-Specific Sections */}

            {/* Submitted: TWG Review Fields (if populated) */}
            {selectedRequest.status === 'Submitted' &&
              (selectedRequest.unspscCode ||
                selectedRequest.isCSE !== undefined) && (
                <>
                  <div className="space-y-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                      TWG Review (In Progress)
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <FieldDisplay
                        label="UNSPSC Code"
                        value={
                          selectedRequest.unspscCode ? (
                            <span className="font-mono text-xs bg-muted p-2 rounded">
                              {selectedRequest.unspscCode}
                            </span>
                          ) : (
                            <span className="italic text-muted-foreground text-xs">
                              Submitted...
                            </span>
                          )
                        }
                      />
                      <FieldDisplay
                        label="CSE Item"
                        value={
                          selectedRequest.isCSE !== undefined ? (
                            <span className="text-xs font-semibold">
                              {selectedRequest.isCSE ? (
                                <span className="text-green-600 dark:text-green-400">
                                  Yes
                                </span>
                              ) : (
                                <span className="text-gray-500">No</span>
                              )}
                            </span>
                          ) : (
                            <span className="italic text-muted-foreground text-xs">
                              Submitted...
                            </span>
                          )
                        }
                      />
                    </div>
                  </div>
                  <Divider />
                </>
              )}

            {/* Approved: Show Created Catalog Item */}
            {selectedRequest.status === 'Approved' && createdCatalogItem && (
              <>
                <div className="space-y-3 bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-900 dark:text-green-300 uppercase tracking-wider">
                    Approved Catalog Item
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <FieldDisplay
                      label="UACS Code"
                      value={
                        createdCatalogItem.uacsCode ? (
                          <span className="font-mono text-xs">
                            {createdCatalogItem.uacsCode}
                          </span>
                        ) : (
                          '—'
                        )
                      }
                    />
                    <FieldDisplay
                      label="UNSPSC Code"
                      value={
                        <span className="font-mono text-xs">
                          {createdCatalogItem.unspscCode}
                        </span>
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FieldDisplay
                      label="CSE Item"
                      value={
                        <span className="text-xs font-semibold">
                          {createdCatalogItem.isCSE ? (
                            <span className="text-green-600 dark:text-green-400">
                              Yes
                            </span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </span>
                      }
                    />
                    <FieldDisplay
                      label="Catalog Status"
                      value={
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs w-fit',
                            createdCatalogItem.status === 'Active'
                              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
                              : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900',
                          )}
                        >
                          {createdCatalogItem.status}
                        </Badge>
                      }
                    />
                  </div>

                  {createdCatalogItem.supplier && (
                    <FieldDisplay
                      label="Supplier"
                      value={createdCatalogItem.supplier}
                    />
                  )}

                  <FieldDisplay
                    label="Current Unit Price"
                    value={`₱${createdCatalogItem.currentPrice.toLocaleString(
                      'en-PH',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}`}
                  />
                </div>
                <Divider />
              </>
            )}

            {/* Returned: Show Admin Remarks */}
            {selectedRequest.status === 'Returned' && (
              <>
                <div className="space-y-3 bg-amber-50 dark:bg-amber-950 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    Return Remarks
                  </p>

                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {selectedRequest.remarks || (
                      <span className="italic text-muted-foreground text-xs">
                        No remarks provided
                      </span>
                    )}
                  </p>
                </div>
                <Divider />
              </>
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
