/**
 * UserCatalogDetailPanel
 * 40% slide-over detail panel showing catalog item details
 * Allows user to submit request from here
 */

import { useAtom } from 'jotai'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { catalogDetailSelectedIdAtom } from '../atoms/requestAtoms'
import { catalogItemsAtom } from '../atoms/catalogAtoms'
import { useAtomValue } from 'jotai'
import { cn } from '@/lib/utils'
import { formatDateTimeLocal } from '@/lib/fiscal-year-and-policies/utils'

export function UserCatalogDetailPanel() {
  const [selectedItemId, setSelectedItemId] = useAtom(
    catalogDetailSelectedIdAtom,
  )
  const catalogItems = useAtomValue(catalogItemsAtom)

  const selectedItem = catalogItems.find((item) => item.id === selectedItemId)

  const FieldSection = ({
    label,
    children,
  }: {
    label: string
    children: React.ReactNode
  }) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  )

  const Divider = () => <hr className="border-border my-4" />

  return (
    <Sheet
      open={!!selectedItemId}
      onOpenChange={(open) => {
        if (!open) setSelectedItemId(null)
      }}
    >
      <SheetContent
        side="right"
        className="w-[40%] sm:w-full max-w-2xl bg-background border-l border-border"
      >
        <SheetHeader className="space-y-2 pb-6">
          <div className="flex items-start justify-between gap-4">
            <SheetTitle className="text-lg">Item Details</SheetTitle>
          </div>
        </SheetHeader>

        {selectedItem ? (
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-4">
            {/* Item Image */}
            {selectedItem.imageUrl && (
              <>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Divider />
              </>
            )}

            {/* Item Name & Status Badges */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold">{selectedItem.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    selectedItem.status === 'Active'
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
                      : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900',
                  )}
                >
                  {selectedItem.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedItem.category}
                </Badge>
                {selectedItem.subcategory && (
                  <Badge variant="outline" className="text-xs">
                    {selectedItem.subcategory}
                  </Badge>
                )}
                {selectedItem.isCSE && (
                  <Badge className="text-xs bg-blue-600 hover:bg-blue-700">
                    CSE Item
                  </Badge>
                )}
              </div>
            </div>

            <Divider />

            {/* Pricing & Classification */}
            <div className="grid grid-cols-2 gap-4">
              <FieldSection label="Current Unit Price">
                <span className="font-mono font-semibold text-primary">
                  ₱
                  {selectedItem.currentPrice.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </FieldSection>
              <FieldSection label="Item Type">
                <span className="capitalize">{selectedItem.itemType}</span>
              </FieldSection>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <FieldSection label="Category">
                {selectedItem.category}
              </FieldSection>
              <FieldSection label="Subcategory">
                {selectedItem.subcategory ?? (
                  <span className="italic text-muted-foreground text-xs">
                    —
                  </span>
                )}
              </FieldSection>
            </div>

            {/* UoM & Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <FieldSection label="Unit of Measure">
                <span className="capitalize">{selectedItem.unitOfMeasure}</span>
              </FieldSection>
              <FieldSection label="Supplier">
                {selectedItem.supplier ?? (
                  <span className="italic text-muted-foreground text-xs">
                    —
                  </span>
                )}
              </FieldSection>
            </div>

            <Divider />

            {/* Codes & Classifications */}
            <div className="space-y-3">
              <FieldSection label="UACS Code">
                {selectedItem.uacsCode ? (
                  <span className="font-mono text-xs bg-muted p-2 rounded">
                    {selectedItem.uacsCode}
                  </span>
                ) : (
                  <span className="italic text-muted-foreground text-xs">
                    —
                  </span>
                )}
              </FieldSection>

              <FieldSection label="UNSPSC Code">
                <span className="font-mono text-xs bg-muted p-2 rounded">
                  {selectedItem.unspscCode}
                </span>
              </FieldSection>

              <div className="grid grid-cols-2 gap-4">
                <FieldSection label="CSE Item">
                  <span className="text-xs font-semibold">
                    {selectedItem.isCSE ? (
                      <span className="text-green-600 dark:text-green-400">
                        Yes
                      </span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </span>
                </FieldSection>
                <FieldSection label="Status">
                  <span className="text-xs font-semibold capitalize">
                    {selectedItem.status}
                  </span>
                </FieldSection>
              </div>
            </div>

            <Divider />

            {/* Specification */}
            {selectedItem.specification && (
              <>
                <FieldSection label="Specification">
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {selectedItem.specification}
                  </p>
                </FieldSection>
                <Divider />
              </>
            )}

            {/* Origin / Requestor Info */}
            {(selectedItem.requestingOffice || selectedItem.requestingUser) && (
              <>
                <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-4 border border-blue-200 dark:border-blue-800 space-y-3">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                    Origin / Requested By
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedItem.requestingOffice && (
                      <FieldSection label="Requesting Office">
                        {selectedItem.requestingOffice}
                      </FieldSection>
                    )}
                    {selectedItem.requestingUser && (
                      <FieldSection label="Requesting User">
                        {selectedItem.requestingUser}
                      </FieldSection>
                    )}
                    {selectedItem.sourceRequestId && (
                      <FieldSection label="Source Request ID">
                        <span className="font-mono text-xs text-muted-foreground">
                          {selectedItem.sourceRequestId}
                        </span>
                      </FieldSection>
                    )}
                  </div>
                </div>
                <Divider />
              </>
            )}

            {/* Audit Trail */}
            <div className="grid grid-cols-2 gap-4 pb-4">
              <FieldSection label="Created Date">
                <span className="text-xs text-muted-foreground">
                  {formatDateTimeLocal(selectedItem.createdDate)}
                </span>
              </FieldSection>
              <FieldSection label="Last Modified">
                <span className="text-xs text-muted-foreground">
                  {formatDateTimeLocal(selectedItem.lastModified)}
                </span>
              </FieldSection>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No item selected</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
