/**
 * APR Items Preview Component
 * 
 * Displays pre-populated APR items from selected APP line items
 * Shows variance information and budget alignment
 * Part of SelectAPPDialog workflow
 */

import { useMemo } from 'react'
import { AlertCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BACMilestonesInline } from './BACMilestonesDisplay'
import { BudgetCeilingStatus } from './BudgetCeilingStatus'
import {
  calculateTotalVariance,
  getVarianceWarning,
  validateBudgetCeiling,
} from '../utils'
import type { ConsolidatedAPRItem } from '../types'

interface APRItemsPreviewProps {
  appId?: string
  appBACId?: string
  appName: string
  items: ConsolidatedAPRItem[]
  appTotalBudget: number
}

export function APRItemsPreview({
  appName,
  items,
  appTotalBudget,
}: APRItemsPreviewProps) {
  // Calculate variance
  const variance = useMemo(() => calculateTotalVariance(items), [items])

  // Check for threshold violations
  const hasVarianceIssues = useMemo(
    () => items.some((item) => getVarianceWarning(item)),
    [items]
  )

  // Validate budget ceiling against APP approved budget
  const currentBudget = useMemo(
    () => items.reduce((sum, item) => sum + item.totalAmount, 0),
    [items]
  )

  const budgetCeilingValidation = useMemo(() => {
    return validateBudgetCeiling(
      currentBudget,
      appTotalBudget,
      5, // threshold %
      10 // warning %
    )
  }, [currentBudget, appTotalBudget])

  if (items.length === 0) return null

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-base">Preview: Items from {appName} to be Added to APR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Summary */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Items</p>
            <p className="font-semibold">{items.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Approved Budget</p>
            <p className="font-semibold">₱{variance.totalApprovedBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current Budget</p>
            <p className="font-semibold">₱{currentBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Budget Variance</p>
            <p className={`font-semibold ${variance.totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {variance.totalVariancePercent > 0 ? '+' : ''}{variance.totalVariancePercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Variance Warning */}
        {hasVarianceIssues && (
          <Alert color="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Variance Threshold Warning</AlertTitle>
            <AlertDescription>
              Some items exceed the 10% variance threshold. Review before proceeding.
            </AlertDescription>
          </Alert>
        )}

        {/* Budget Ceiling Validation */}
        <BudgetCeilingStatus
          validation={budgetCeilingValidation}
          compact={false}
          showRecommendation={true}
        />

        {/* Items Table */}
        <div className="border rounded-lg overflow-hidden">
          <ScrollArea className="h-64">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted border-b">
                <tr>
                  <th className="text-left p-3">Description</th>
                  <th className="text-right p-3">Qty</th>
                  <th className="text-right p-3">Unit Cost</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-center p-3">Variance</th>
                  <th className="text-center p-3">BAC Milestones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const warning = getVarianceWarning(item)
                  return (
                    <tr
                      key={item.id || `item-preview-${index}`}
                      className={`border-b hover:bg-muted/50 ${
                        warning ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="p-3 font-medium text-xs">
                        <div className="truncate">{item.description}</div>
                        {warning && (
                          <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {warning}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">₱{item.unitCost.toLocaleString()}</td>
                      <td className="p-3 text-right font-semibold">
                        ₱{item.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          color={
                            (item.budgetVariancePercent ?? 0) === 0
                              ? 'secondary'
                              : Math.abs(item.budgetVariancePercent ?? 0) > 10
                                ? 'destructive'
                                : 'warning'
                          }
                          variant="outline"
                        >
                          {(item.budgetVariancePercent ?? 0) > 0 ? '+' : ''}
                          {(item.budgetVariancePercent ?? 0).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <BACMilestonesInline milestones={item.bacMilestones} compact />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        {/* Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>APP Pre-population</AlertTitle>
          <AlertDescription>
            These items will be automatically added to your APR. You can modify quantities and
            costs after creation.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
