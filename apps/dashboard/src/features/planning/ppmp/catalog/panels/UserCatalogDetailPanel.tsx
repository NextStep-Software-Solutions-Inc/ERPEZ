/**
 * UserCatalogDetailPanel
 * Slide-over detail panel showing live Non-CSE catalog item details
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
import { useNonCSEItemById } from '../hooks/useNonCSEItemQueries'
import { formatDateTimeLocal } from '@/lib/fiscal-year-and-policies/utils'
import { formatCurrencyPHP } from '@/utils/formatters'
import { Loader2 } from 'lucide-react'

export function UserCatalogDetailPanel() {
  const [selectedItemId, setSelectedItemId] = useAtom(
    catalogDetailSelectedIdAtom,
  )

  const { data: itemResponse, isLoading } = useNonCSEItemById(selectedItemId)
  const selectedItem = itemResponse?.data

  const FieldSection = ({
    label,
    children,
  }: {
    label: string
    children: React.ReactNode
  }) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
        {label}
      </p>
      <div className="text-sm font-medium text-foreground">{children}</div>
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
        className="w-full sm:max-w-lg md:max-w-xl bg-background border-l border-border"
      >
        <SheetHeader className="space-y-2 pb-4 border-b">
          <SheetTitle className="text-lg font-bold">Catalog Item Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading item details...</p>
          </div>
        ) : selectedItem ? (
          <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-120px)] pr-2 py-4">
            {/* Item Title & Category */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                {selectedItem.name || 'Unnamed Item'}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs bg-muted">
                  {selectedItem.procurementCategoryName || 'Goods'}
                </Badge>
                {selectedItem.productCode && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {selectedItem.productCode}
                  </Badge>
                )}
              </div>
            </div>

            <Divider />

            {/* Pricing & Units */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border">
              <FieldSection label="Estimated Unit Price">
                <span className="text-base font-bold text-primary">
                  {formatCurrencyPHP(selectedItem.currentPrice)}
                </span>
              </FieldSection>
              <FieldSection label="Unit of Measure">
                <span>{selectedItem.uomName || '—'}</span>
              </FieldSection>
            </div>

            {/* Specifications */}
            <FieldSection label="Technical Specifications & Description">
              <div className="rounded-lg bg-muted/30 p-3.5 border text-sm whitespace-pre-wrap leading-relaxed">
                {selectedItem.description || 'No detailed specifications provided.'}
              </div>
            </FieldSection>

            {/* Remarks if any */}
            {selectedItem.remarks && (
              <FieldSection label="Remarks">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedItem.remarks}
                </p>
              </FieldSection>
            )}

            <Divider />

            {/* Audit Information */}
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <FieldSection label="Catalog Date">
                <span>
                  {selectedItem.createdAt
                    ? formatDateTimeLocal(new Date(selectedItem.createdAt))
                    : '—'}
                </span>
              </FieldSection>
              {selectedItem.createdBy && (
                <FieldSection label="Added By">
                  <span>{selectedItem.createdBy}</span>
                </FieldSection>
              )}
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
