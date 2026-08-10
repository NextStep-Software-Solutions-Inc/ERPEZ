import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Badge } from '@/components/ui/badge'
import type { PriceCatalogueItem } from '../../types'

interface ViewPriceCatalogueDialogProps {
  item: PriceCatalogueItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewPriceCatalogueDialog({
  item,
  open,
  onOpenChange,
}: ViewPriceCatalogueDialogProps) {
  if (!item) return null

  const itemLabel = item.procurementItemName ?? item.itemName
  const fiscalYearLabel = item.fiscalYearYear
    ? `FY ${item.fiscalYearYear}`
    : `FY ${item.fiscalYear}`

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="View Price Catalogue"
      description="Complete details of the price catalogue entry"
      footer={null}
      showCloseButton
    >
      <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        {/* Item Name */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Item Name
          </label>
          <p className="text-base font-medium mt-1">{itemLabel}</p>
        </div>

        {/* Procurement Item ID */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Procurement Item ID
          </label>
          <p className="text-base font-medium mt-1 break-all">
            {item.procurementItemId}
          </p>
        </div>

        {/* Unit Price */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Unit Price
          </label>
          <p className="text-base font-medium mt-1">
            ₱
            {item.unitPrice.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Fiscal Year */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Fiscal Year
          </label>
          <p className="text-base font-medium mt-1">{fiscalYearLabel}</p>
        </div>

        {/* Fiscal Year ID */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Fiscal Year ID
          </label>
          <p className="text-base font-medium mt-1 break-all">
            {item.fiscalYearId}
          </p>
        </div>

        {/* Last Updated */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Last Updated
          </label>
          <p className="text-base font-medium mt-1">
            {new Date(item.lastUpdated).toLocaleDateString('en-PH')}
          </p>
        </div>

        {/* Price History */}
        {item.priceHistory && item.priceHistory.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-muted-foreground">
              Price History
            </label>
            <div className="mt-2 space-y-2">
              {item.priceHistory.map((history, index) => (
                <div key={history.id} className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Previous: ₱
                      {history.previousPrice.toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-sm font-medium">
                      Current: ₱
                      {history.currentPrice.toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-600">
                      Changed:{' '}
                      {new Date(history.changedAt).toLocaleDateString('en-PH')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(history.percentageChange)}% change
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ResponsiveDialog>
  )
}
