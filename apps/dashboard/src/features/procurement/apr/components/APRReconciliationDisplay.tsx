/**
 * APR vs APP Reconciliation Display Component
 * Shows detailed comparison of APR items vs original APP items
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, CheckCircle2, Minus } from 'lucide-react'
import type { APRVsAPPReconciliation } from '../utils/reconcileAPRWithAPP'
import { getReconciliationStatus } from '../utils/reconcileAPRWithAPP'

export interface APRReconciliationDisplayProps {
  reconciliation: APRVsAPPReconciliation | null
  compact?: boolean
  showTable?: boolean
}

const mapStatusVariantToColor = (variant: string): 'default' | 'destructive' | 'success' | 'info' | 'warning' | 'secondary' | 'dark' => {
  switch (variant) {
    case 'destructive':
      return 'destructive'
    case 'default':
      return 'success'
    case 'secondary':
      return 'secondary'
    case 'outline':
      return 'warning'
    default:
      return 'default'
  }
}

/**
 * Display reconciliation summary and optionally detailed table
 */
export function APRReconciliationDisplay({
  reconciliation,
  compact = false,
  showTable = true,
}: APRReconciliationDisplayProps) {
  if (!reconciliation) {
    return null
  }

  const status = getReconciliationStatus(reconciliation)
  const budgetVarianceColor =
    reconciliation.budgetVariancePercent > 10
      ? 'text-red-600'
      : reconciliation.budgetVariancePercent > 0
        ? 'text-yellow-600'
        : 'text-green-600'

  const getStatusIcon = () => {
    if (reconciliation.isFullyAligned) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    }
    if (reconciliation.budgetVariancePercent > 10 || reconciliation.itemsExcluded > 0) {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    }
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />
  }

  if (compact) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {getStatusIcon()}
              <div className="flex-1">
                <p className="font-medium">{status.label}</p>
                <p className="text-sm text-muted-foreground">
                  {reconciliation.itemsIncluded} included, {reconciliation.itemsModified}{' '}
                  modified, {reconciliation.itemsExcluded} excluded
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${budgetVarianceColor}`}>
                {reconciliation.budgetVariancePercent > 0 ? '+' : ''}
                {reconciliation.budgetVariancePercent.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground">Budget Variance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                APR vs APP Reconciliation
              </CardTitle>
              <CardDescription>Comparison of APR items against approved APP</CardDescription>
            </div>
            <Badge color={mapStatusVariantToColor(status.variant)}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Included Items</p>
              <p className="text-lg font-semibold text-green-600">{reconciliation.itemsIncluded}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Modified Items</p>
              <p className="text-lg font-semibold text-yellow-600">{reconciliation.itemsModified}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Excluded Items</p>
              <p className="text-lg font-semibold text-red-600">{reconciliation.itemsExcluded}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Budget Variance</p>
              <p className={`text-lg font-semibold ${budgetVarianceColor}`}>
                {reconciliation.budgetVariancePercent > 0 ? '+' : ''}
                {reconciliation.budgetVariancePercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Budget Details */}
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">APP Budget</p>
                <p className="font-semibold">
                  ₱{reconciliation.appTotalBudget.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">APR Budget</p>
                <p className="font-semibold">
                  ₱{reconciliation.aprTotalBudget.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Variance</p>
                <p className={`font-semibold ${budgetVarianceColor}`}>
                  ₱{reconciliation.budgetVariance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {!reconciliation.isFullyAligned && (
            <Alert color="warning" className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Deviations Detected</AlertTitle>
              <AlertDescription className="text-yellow-700">
                <p className="text-sm">
                  This APR deviates from the approved APP. Review the items below to ensure all
                  changes are authorized.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {reconciliation.isFullyAligned && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Fully Aligned</AlertTitle>
              <AlertDescription className="text-green-700">
                <p className="text-sm">
                  All approved APP items are included in this APR with no modifications.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detailed Items Table */}
      {showTable && reconciliation.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Item Details</CardTitle>
            <CardDescription>Item-by-item comparison between APP and APR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">APP Qty</TableHead>
                    <TableHead className="text-right">APR Qty</TableHead>
                    <TableHead className="text-right">Delta</TableHead>
                    <TableHead className="text-right">APP Budget</TableHead>
                    <TableHead className="text-right">APR Budget</TableHead>
                    <TableHead className="text-right">Delta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliation.items.map((item) => {
                    const statusColors = {
                      INCLUDED: 'bg-green-50',
                      MODIFIED: 'bg-yellow-50',
                      EXCLUDED: 'bg-red-50',
                    }
                    const statusIcons = {
                      INCLUDED: <CheckCircle2 className="h-4 w-4 text-green-600" />,
                      MODIFIED: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
                      EXCLUDED: <Minus className="h-4 w-4 text-red-600" />,
                    }

                    return (
                      <TableRow key={item.appLineItemId} className={statusColors[item.status]}>
                        <TableCell className="w-12">
                          <div className="flex justify-center">{statusIcons[item.status]}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{item.description}</p>
                            {item.reason && (
                              <p className="text-xs text-muted-foreground">{item.reason}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {item.appQuantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {item.aprQuantity.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`text-right text-sm font-medium ${item.quantityDelta !== 0 ? 'text-yellow-600' : ''}`}
                        >
                          {item.quantityDelta > 0 ? '+' : ''}
                          {item.quantityDelta}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ₱{item.appBudget.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ₱{item.aprBudget.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell
                          className={`text-right text-sm font-medium ${item.budgetDelta !== 0 ? 'text-yellow-600' : ''}`}
                        >
                          {item.budgetDelta > 0 ? '+' : ''}
                          ₱
                          {item.budgetDelta.toLocaleString('en-US', {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
