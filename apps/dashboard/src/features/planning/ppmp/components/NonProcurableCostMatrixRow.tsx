/**
 * NonProcurableCostMatrixRow
 * Renders a single cost category row in the non-procurable cost matrix table
 * Shows category name, total cost, monthly allocations, allocation %, MoP, and actions (edit/delete)
 */

import { useState } from 'react'
import { MoreVertical, Pencil, Trash2, AlertCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { NonProcurableCost, ProjectType, PreProcurementConferenceValue } from '../types'
import { ALL_MONTHS } from '../types'
import { displayPreProcurementConference } from '../lib/ppmpFieldDefaults'
import { formatCurrency } from '../lib/ppmpUtils'
import {
  calculateMonthlyPercentages,
  isOverBudget,
} from '../lib/distributionUtils'
import { cn } from '@/lib/utils'

const MOP_LABELS: Record<string, string> = {
  'request-for-quote': 'RFQ',
  'direct-purchase': 'Direct',
  'in-house': 'In-House',
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  Goods: 'Goods',
  Infra: 'Infra',
  Consulting: 'Consulting',
  'N/A': 'N/A',
}

interface NonProcurableCostMatrixRowProps {
  cost: NonProcurableCost
  budgetLimit: number
  isReadOnly?: boolean
  onEdit?: (cost: NonProcurableCost) => void
  onDelete?: (costId: string) => void
}

export function NonProcurableCostMatrixRow({
  cost,
  budgetLimit,
  isReadOnly = false,
  onEdit,
  onDelete,
}: NonProcurableCostMatrixRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const monthlyPercentages = calculateMonthlyPercentages(
    cost.monthlyAllocations,
  )
  const overBudget = isOverBudget(cost.monthlyAllocations, budgetLimit)

  const handleDelete = () => {
    onDelete?.(cost.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <tr
        className={cn(
          'border-b border-border hover:bg-muted/50',
          overBudget && 'bg-destructive/5',
        )}
      >
        {/* Category Name */}
        <td className="px-3 py-2 text-left font-medium min-w-[180px]">
          <div className="flex items-center gap-2">
            <span className="text-sm">{cost.costItemName}</span>
            {overBudget && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>Exceeds budget limit</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </td>

        {/* Total Cost */}
        <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
          {formatCurrency(cost.totalCost)}
        </td>

        {/* Monthly Allocations */}
        {ALL_MONTHS.map((month) => (
          <td
            key={month}
            className="px-1 py-2 text-center text-xs whitespace-nowrap"
          >
            <div className="text-foreground font-medium">
              {formatCurrency(cost.monthlyAllocations[month] || 0)}
            </div>
            <div className="text-muted-foreground text-[10px]">
              {monthlyPercentages[month]?.toFixed(0)}%
            </div>
          </td>
        ))}

        {/* Total % Allocation */}
        <td className="px-3 py-2 text-center whitespace-nowrap">
          <span className="text-xs font-semibold text-foreground">100%</span>
        </td>

        {/* Mode of Procurement */}
        <td className="px-3 py-2 text-center whitespace-nowrap">
          {cost.mop ? (
            <Badge variant="outline" className="text-xs">
              {MOP_LABELS[cost.mop] || cost.mop}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </td>

        {/* Project Type (NEW) - Editable */}
        <td className="px-3 py-2 text-center whitespace-nowrap">
          {!isReadOnly ? (
            <select
              value={cost.projectType || 'unset'}
              onChange={(e) =>
                onEdit?.({
                  ...cost,
                  projectType:
                    e.target.value === 'unset' ? null : (e.target.value as ProjectType),
                })
              }
              className="h-8 px-2 rounded border border-input bg-background text-xs"
            >
              <option value="unset">Not set</option>
              <option value="Goods">Goods</option>
              <option value="Infra">Infra</option>
              <option value="Consulting">Consulting</option>
              <option value="N/A">N/A</option>
            </select>
          ) : cost.projectType ? (
            <Badge variant="outline" className="text-xs">
              {PROJECT_TYPE_LABELS[cost.projectType] || cost.projectType}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </td>

        {/* Quantity and Size of the Project to be Procured - Editable */}
        <td className="px-3 py-2 text-left whitespace-nowrap max-w-xs">
          {!isReadOnly ? (
            <input
              type="text"
              value={cost.sizeSpecification || ''}
              onChange={(e) =>
                onEdit?.({
                  ...cost,
                  sizeSpecification: e.target.value || null,
                })
              }
              placeholder="Quantity and size"
              title={cost.sizeSpecification || ''}
              className="w-full h-8 px-2 rounded border border-input bg-background text-xs truncate"
            />
          ) : cost.sizeSpecification ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-foreground truncate cursor-help">
                    {cost.sizeSpecification.length > 30
                      ? `${cost.sizeSpecification.substring(0, 30)}...`
                      : cost.sizeSpecification}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {cost.sizeSpecification}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </td>

        {/* Pre-Procurement Conference (NEW) - Editable */}
        <td className="px-3 py-2 text-center whitespace-nowrap">
          {!isReadOnly ? (
            <select
              value={cost.preProcurementConference || 'N/A'}
              onChange={(e) =>
                onEdit?.({
                  ...cost,
                  preProcurementConference:
                    e.target.value === 'N/A' ? null : (e.target.value as PreProcurementConferenceValue),
                })
              }
              className="h-8 px-2 rounded border border-input bg-background text-xs"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="N/A">N/A</option>
            </select>
          ) : cost.preProcurementConference != null ? (
            <Badge
              variant={
                cost.preProcurementConference === 'yes' ? 'soft' : 'outline'
              }
              className="text-xs"
            >
              {displayPreProcurementConference(cost.preProcurementConference)}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </td>

        {/* Procurement Period (NEW) - Start & End - Editable */}
        <td className="px-3 py-2 text-center whitespace-nowrap text-xs">
          {!isReadOnly ? (
            <div className="space-y-1 flex flex-col">
              <input
                type="text"
                value={cost.procurementStart || ''}
                onChange={(e) =>
                  onEdit?.({
                    ...cost,
                    procurementStart: e.target.value || null,
                  })
                }
                placeholder="Start"
                className="h-7 px-1.5 rounded border border-input bg-background text-[10px]"
              />
              <input
                type="text"
                value={cost.procurementEnd || ''}
                onChange={(e) =>
                  onEdit?.({
                    ...cost,
                    procurementEnd: e.target.value || null,
                  })
                }
                placeholder="End"
                className="h-7 px-1.5 rounded border border-input bg-background text-[10px]"
              />
            </div>
          ) : cost.procurementStart || cost.procurementEnd ? (
            <div className="space-y-0.5">
              {cost.procurementStart && (
                <div className="text-foreground">{cost.procurementStart}</div>
              )}
              {cost.procurementEnd && (
                <div className="text-muted-foreground text-[10px]">
                  → {cost.procurementEnd}
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </td>

        {/* Market Scoping Reference (NEW) - Editable */}
        <td className="px-3 py-2 text-center whitespace-nowrap">
          {!isReadOnly ? (
            <input
              type="text"
              value={cost.marketScopingRef || ''}
              onChange={(e) =>
                onEdit?.({
                  ...cost,
                  marketScopingRef: e.target.value || null,
                })
              }
              placeholder="MSF Ref"
              className="w-24 h-8 px-2 rounded border border-input bg-background text-xs font-mono"
            />
          ) : cost.marketScopingRef ? (
            <Badge variant="outline" className="text-xs font-mono">
              {cost.marketScopingRef}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </td>

        {/* Market Scoping Cost Estimate (NEW) */}
        <td className="px-3 py-2 text-right whitespace-nowrap text-xs">
          {cost.marketScopingCostEstimate ? (
            <span className="text-foreground">
              {formatCurrency(cost.marketScopingCostEstimate)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>

        {/* Actions */}
        <td className="px-2 py-2 text-center whitespace-nowrap">
          {!isReadOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Open actions</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onEdit?.(cost)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </td>
      </tr>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cost Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{cost.costItemName}" from the cost breakdown.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted/50 rounded p-3 text-sm">
            <p className="text-muted-foreground">
              <strong>Cost Item:</strong> {cost.costItemName}
            </p>
            <p className="text-muted-foreground">
              <strong>Amount:</strong> {formatCurrency(cost.totalCost)}
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
