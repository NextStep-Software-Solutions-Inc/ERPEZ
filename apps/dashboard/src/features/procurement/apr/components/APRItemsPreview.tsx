/**
 * APR Items Preview Component
 * 
 * Displays pre-populated APR items from selected APP line items
 * Shows variance information and budget alignment
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
  // Sanitize items array to remove any null/undefined entries
  const safeItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return []
    return items.filter(Boolean)
  }, [items])

  // Calculate variance safely
  const variance = useMemo(() => {
    if (safeItems.length === 0) return { totalApprovedBudget: 0, totalVariance: 0, totalVariancePercent: 0 }
    return calculateTotalVariance(safeItems)
  }, [safeItems])

  // Check for threshold violations safely
  const hasVarianceIssues = useMemo(
    () => safeItems.some((item) => Boolean(getVarianceWarning(item))),
    [safeItems]
  )

  // Validate budget ceiling against APP approved budget safely
  const currentBudget = useMemo(
    () => safeItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
    [safeItems]
  )

  const budgetCeilingValidation = useMemo(() => {
    if (safeItems.length === 0) return null
    return validateBudgetCeiling(
      currentBudget,
      appTotalBudget,
      5, // threshold %
      10 // warning %
    )
  }, [safeItems.length, currentBudget, appTotalBudget])

  if (safeItems.length === 0) return null

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">
          Preview: Items from {appName} to be Added to APR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Summary */}
        <div className="grid grid-cols-4 gap-4 text-xs bg-card p-3 rounded-lg border border-border">
          <div>
            <p className="text-muted-foreground">Items</p>
            <p className="font-semibold text-sm text-foreground">{safeItems.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Approved Budget</p>
            <p className="font-semibold text-sm text-foreground tabular-nums">₱{variance.totalApprovedBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current Budget</p>
            <p className="font-semibold text-sm text-foreground tabular-nums">₱{currentBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Budget Variance</p>
            <p className={`font-semibold text-sm tabular-nums ${variance.totalVariance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
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
        {budgetCeilingValidation && (
          <BudgetCeilingStatus
            validation={budgetCeilingValidation}
            compact={false}
            showRecommendation={true}
          />
        )}

        {/* Items Table */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <ScrollArea className="h-64">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/80 backdrop-blur-xs border-b border-border">
                <tr>
                  <th className="text-left p-2.5 font-semibold text-foreground">Description</th>
                  <th className="text-right p-2.5 font-semibold text-foreground">Qty</th>
                  <th className="text-right p-2.5 font-semibold text-foreground">Unit Cost</th>
                  <th className="text-right p-2.5 font-semibold text-foreground">Total</th>
                  <th className="text-center p-2.5 font-semibold text-foreground">Variance</th>
                  <th className="text-center p-2.5 font-semibold text-foreground">BAC Milestones</th>
                </tr>
              </thead>
              <tbody>
                {safeItems.map((item, index) => {
                  const warning = getVarianceWarning(item)
                  return (
                    <tr
                      key={item.id || `item-preview-${index}`}
                      className={`border-b border-border/70 hover:bg-slate-50/80 dark:hover:bg-slate-800/55 ${
                        warning ? 'bg-red-50/50 dark:bg-red-500/10' : ''
                      }`}
                    >
                      <td className="p-2.5 font-medium text-foreground">
                        <div className="truncate max-w-[200px]">{item.description}</div>
                        {warning && (
                          <div className="text-red-600 dark:text-red-400 text-[11px] mt-0.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 flex-shrink-0" />
                            {warning}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono text-foreground">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono text-foreground">₱{(item.unitCost || 0).toLocaleString()}</td>
                      <td className="p-2.5 text-right font-semibold font-mono text-foreground">
                        ₱{(item.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 h-4 ${
                            (item.budgetVariancePercent ?? 0) === 0
                              ? 'bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                              : Math.abs(item.budgetVariancePercent ?? 0) > 10
                              ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/35'
                              : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/35'
                          }`}
                        >
                          {(item.budgetVariancePercent ?? 0) > 0 ? '+' : ''}
                          {(item.budgetVariancePercent ?? 0).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-2.5 text-center">
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
          <AlertDescription className="text-xs">
            These items will be automatically added to your APR. You can modify quantities and
            costs after creation.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
