/**
 * Line Items Selection Field Component
 * 
 * Encapsulates the line items selection UI with scrollable list and checkbox handling
 * Extracted from SelectAPPForm to keep form <200 lines
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AppMaster } from '../types'

interface LineItemsSelectFieldProps {
  app: AppMaster | null
  selectedLineItemIds: string[]
  onToggleLineItem: (lineItemId: string) => void
  onSelectAll: () => void
}

export function LineItemsSelectField({
  app,
  selectedLineItemIds,
  onToggleLineItem,
  onSelectAll,
}: LineItemsSelectFieldProps) {
  if (!app) return null

  const allItemsSelected =
    selectedLineItemIds.length > 0 &&
    selectedLineItemIds.length === app.bac.lineItems.length

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-blue-900">
        📦 Step 2: Select Line Items from {app.appCode}
      </h3>
      <Card className="border-blue-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">
            {app.appCode} - Line Items ({app.bac.lineItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Budget</p>
              <p className="font-semibold">₱{app.bac.totalBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Items</p>
              <p className="font-semibold">{app.bac.lineItems.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Selected Items</p>
              <p className="font-semibold">{selectedLineItemIds.length}</p>
            </div>
          </div>

          {/* Select All */}
          <div className="flex items-center gap-2 border-t pt-4">
            <Checkbox
              id="select-all"
              checked={allItemsSelected}
              onCheckedChange={onSelectAll}
            />
            <label htmlFor="select-all" className="cursor-pointer text-sm font-medium flex-1">
              Select All Line Items
            </label>
          </div>

          {/* Line Items */}
          <ScrollArea className="h-56 border rounded-md">
            <div className="space-y-1 p-4">
              {app.bac.lineItems.map((lineItem) => (
                <div key={lineItem.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                  <Checkbox
                    id={`line-item-${lineItem.id}`}
                    checked={selectedLineItemIds.includes(lineItem.id)}
                    onCheckedChange={() => onToggleLineItem(lineItem.id)}
                    className="mt-1"
                  />
                  <label htmlFor={`line-item-${lineItem.id}`} className="cursor-pointer flex-1 text-sm">
                    <div>
                      <p className="font-medium">{lineItem.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {lineItem.quantity} {lineItem.unit} @ ₱{lineItem.unitCost.toLocaleString()}/unit = ₱
                        {lineItem.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
