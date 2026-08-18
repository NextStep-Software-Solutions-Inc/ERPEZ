/**
 * Line Items Selection Field Component
 * 
 * Encapsulates multi-APP line items selection UI with scrollable list and checkbox handling
 */

import React from 'react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface LineItemsSelectFieldProps {
  apps: any[]
  lineItems: any[]
  selectedLineItemIds: string[]
  onToggleLineItem: (lineItemId: string) => void
  onSelectAll: () => void
}

export const LineItemsSelectField = React.memo(function LineItemsSelectField({
  apps,
  lineItems,
  selectedLineItemIds,
  onToggleLineItem,
  onSelectAll,
}: LineItemsSelectFieldProps) {
  const totalBudget = useMemo(
    () =>
      lineItems.reduce(
        (sum, item) =>
          sum +
          (item.totalAmount ||
            (item.quantity * item.unitCost) ||
            item.originalPPMPBudget ||
            item.effectiveABC ||
            0),
        0
      ),
    [lineItems]
  )

  if (!apps || apps.length === 0) return null

  const allItemsSelected =
    lineItems.length > 0 &&
    selectedLineItemIds.length === lineItems.length

  const appCodesSummary = apps
    .map((a) => a.appNumber || a.appCode || `APP-${a.id.substring(0, 8)}`)
    .join(', ')

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-blue-900">
        📦 Step 2: Select Line Items from Selected APPs ({apps.length} APP{apps.length !== 1 ? 's' : ''})
      </h3>
      <Card className="border-blue-200 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-900 flex items-center justify-between gap-2 flex-wrap">
            <span className="truncate">
              Selected APPs: <span className="font-normal text-sm text-muted-foreground">{appCodesSummary}</span>
            </span>
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
              {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-4 text-sm bg-slate-50 p-3 rounded-lg border">
            <div>
              <p className="text-muted-foreground text-xs">Total Available Budget</p>
              <p className="font-semibold text-sm">₱{totalBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Line Items</p>
              <p className="font-semibold text-sm">{lineItems.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Selected Items</p>
              <p className="font-semibold text-sm text-primary">
                {selectedLineItemIds.length} of {lineItems.length}
              </p>
            </div>
          </div>

          {/* Select All */}
          {lineItems.length > 0 && (
            <div
              className="flex items-center gap-2 border-t pt-3 cursor-pointer select-none"
              onClick={onSelectAll}
            >
              <Checkbox
                checked={allItemsSelected}
                onCheckedChange={onSelectAll}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm font-medium flex-1">
                Select All Line Items across all selected APPs
              </span>
            </div>
          )}

          {/* Line Items List */}
          <ScrollArea className="h-72 border rounded-md">
            <div className="space-y-2 p-3">
              {lineItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No line items found in the selected APP(s).
                </div>
              ) : (
                lineItems.map((lineItem: any) => {
                  const desc =
                    lineItem.ppmpItemName ||
                    lineItem.description ||
                    lineItem.name ||
                    'Procurement Item'
                  const qty = lineItem.quantity ?? 1
                  const unit = lineItem.unit || 'unit'
                  const unitCost = lineItem.unitCost ?? 0
                  const total = lineItem.totalAmount ?? (qty * unitCost)
                  const isSelected = selectedLineItemIds.includes(lineItem.id)
                  const officeName = lineItem.officeName || lineItem.office
                  const fundSource = lineItem.fundSourceName || lineItem.fundSource
                  const procurementMode = lineItem.procurementModeName || lineItem.procurementMode

                  return (
                    <div
                      key={`${lineItem.sourceAppId || 'app'}-${lineItem.id}`}
                      onClick={() => onToggleLineItem(lineItem.id)}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Checkbox
                        id={`line-item-${lineItem.id}`}
                        checked={isSelected}
                        onCheckedChange={() => onToggleLineItem(lineItem.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-gray-900">{desc}</p>
                          <span className="text-sm font-semibold text-primary">
                            ₱{total.toLocaleString()}
                          </span>
                        </div>
                        {lineItem.remarks && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {lineItem.remarks}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                          {lineItem.sourceAppCode && (
                            <Badge variant="outline" className="text-[10px] py-0 h-5 bg-purple-50 text-purple-700 border-purple-300 font-mono">
                              {lineItem.sourceAppCode}
                            </Badge>
                          )}
                          <span className="text-muted-foreground">
                            {qty} {unit} @ ₱{unitCost.toLocaleString()}/unit
                          </span>
                          {officeName && (
                            <Badge variant="outline" className="text-[10px] py-0 h-5">
                              {officeName}
                            </Badge>
                          )}
                          {fundSource && (
                            <Badge variant="outline" className="text-[10px] py-0 h-5 bg-blue-50 text-blue-700 border-blue-200">
                              {fundSource}
                            </Badge>
                          )}
                          {procurementMode && (
                            <Badge variant="outline" className="text-[10px] py-0 h-5 bg-amber-50 text-amber-700 border-amber-200">
                              {procurementMode}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
});
