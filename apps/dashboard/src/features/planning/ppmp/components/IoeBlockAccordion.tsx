/**
 * IoeBlockAccordion
 * Renders one IoE (Item of Expenditure) block with expandable content.
 * Shows budget limit, total cost (green/red), Add Items button, and the schedule matrix table.
 * For non-procurable blocks: shows cost categories with monthly distribution instead of items.
 */

import { useCallback, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import {
  ChevronDown,
  Link2,
  PackageSearch,
  PlusCircle,
  Trash2,
} from 'lucide-react'
import {
  ALL_MONTHS,
  MONTH_LABELS,
  createEmptyMonthlyQuantities,
} from '../types'
import {
  PPMP_FIELD_LABELS,
  PPMP_METADATA_DEFAULTS,
} from '../lib/ppmpFieldDefaults'
import { formatCurrency } from '../lib/ppmpUtils'
import { AddNonProcurableCostDialog } from '../dialogs/AddNonProcurableCostDialog'
import { SelectCostItemDialog } from '../catalog/dialogs/SelectCostItemDialog'
import {
  catalogPickerModalOpenAtom,
  expandedIoEBlocksAtom,
  pendingNonProcurableCostsAtom,
  selectedPpmpForEditAtom,
  targetIoEBlockIdAtom,
  bulkLinkMsfModalOpenAtom,
  selectedLineItemIdsAtom,
} from '../atoms'
import {
  updateNonProcurableCostsRequest,
  updateNonProcurableCostMetadataRequest,
} from '../handlers'
import { InlineNonProcurableCostRow } from './InlineNonProcurableCostRow'
import { NonProcurableCostDetailForm } from './NonProcurableCostDetailForm'
import { ScheduleMatrixRow } from './ScheduleMatrixRow'
import { BudgetOverflowWarning } from './BudgetOverflowWarning'
import { IoEBlockBadge } from './IoEBlockBadge'
// LinkScopingFormModal is rendered once at the PPMP workspace level; not here to avoid duplicates
import type {
  CostItemMaster,
  Month,
  NonProcurableCost,
  PPMPIoEBlock,
} from '../types'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface IoeBlockAccordionProps {
  block: PPMPIoEBlock
  ppmpId: string
  activityName?: string
  onScheduleChange: (itemId: string, month: Month, value: number) => void
  onDeleteItem: (itemId: string) => void
  onDeleteBlock: (blockId: string) => Promise<void> | void
  isMutating?: boolean
  isReadOnly?: boolean
}

export function IoeBlockAccordion({
  block,
  ppmpId,
  activityName,
  onScheduleChange,
  onDeleteItem,
  onDeleteBlock,
  isMutating = false,
  isReadOnly = false,
}: IoeBlockAccordionProps) {
  const [expandedBlocks, setExpandedBlocks] = useAtom(expandedIoEBlocksAtom)
  const setPpmp = useSetAtom(selectedPpmpForEditAtom)
  const setCatalogPickerOpen = useSetAtom(catalogPickerModalOpenAtom)
  const setTargetIoEBlockId = useSetAtom(targetIoEBlockIdAtom)
  const [, setPendingCosts] = useAtom(pendingNonProcurableCostsAtom)
  const setBulkLinkOpen = useSetAtom(bulkLinkMsfModalOpenAtom)
  const [globalSelectedIds, setGlobalSelectedIds] = useAtom(
    selectedLineItemIdsAtom,
  )

  // Block-level selection helpers (operate on this block's items only)
  const blockItemIds = block.items.map((i) => i.id)
  const selectedInBlock = blockItemIds.filter((id) => globalSelectedIds.has(id))
  const allSelected =
    blockItemIds.length > 0 && selectedInBlock.length === blockItemIds.length
  const someSelected = selectedInBlock.length > 0 && !allSelected

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setGlobalSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(itemId)
      else next.delete(itemId)
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    setGlobalSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) blockItemIds.forEach((id) => next.add(id))
      else blockItemIds.forEach((id) => next.delete(id))
      return next
    })
  }

  const handleBulkLink = () => {
    if (selectedInBlock.length === 0) return
    setBulkLinkOpen(true)
  }

  // Non-procurable cost management
  const [costs, setCosts] = useState<Array<NonProcurableCost>>(
    block.costs ?? [],
  )
  const [showNewCostRow, setShowNewCostRow] = useState(false)
  const [showMasterCostDialog, setShowMasterCostDialog] = useState(false)
  const [showCustomCostDialog, setShowCustomCostDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingCost, setEditingCost] = useState<NonProcurableCost | null>(null)
  const [showDetailForm, setShowDetailForm] = useState(false)
  const [isSavingMetadata, setIsSavingMetadata] = useState(false)

  const isExpanded = expandedBlocks.has(block.id)
  const overflow = Math.max(0, block.totalCost - block.budgetLimit)

  const toggle = () => {
    setExpandedBlocks((prev: Set<string>) => {
      const next = new Set(prev)
      if (next.has(block.id)) {
        next.delete(block.id)
      } else {
        next.add(block.id)
      }
      return next
    })
  }

  const handleAddItems = () => {
    setTargetIoEBlockId(block.id)
    setCatalogPickerOpen(true)
  }

  const persistCosts = useCallback(
    async (nextCosts: Array<NonProcurableCost>) => {
      setCosts(nextCosts)
      setPendingCosts((prev) => ({
        ...prev,
        [block.id]: nextCosts,
      }))

      try {
        const updatedPpmp = await updateNonProcurableCostsRequest.fetcher({
          data: {
            ppmpId,
            blockId: block.id,
            costs: nextCosts,
          },
        })
        setPpmp(updatedPpmp)
        setPendingCosts((prev) => {
          const next = { ...prev }
          delete next[block.id]
          return next
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save cost.')
      }
    },
    [block.id, ppmpId, setPendingCosts],
  )

  const handleUpdateCost = useCallback(
    async (cost: NonProcurableCost) => {
      const nextCosts = costs.map((c) => (c.id === cost.id ? cost : c))
      await persistCosts(nextCosts)
    },
    [costs, persistCosts],
  )

  const handleEditCostMetadata = useCallback((cost: NonProcurableCost) => {
    setEditingCost(cost)
    setShowDetailForm(true)
  }, [])

  const handleSaveCostMetadata = useCallback(
    async (updatedCost: NonProcurableCost) => {
      setIsSavingMetadata(true)
      try {
        const updatedPpmp =
          await updateNonProcurableCostMetadataRequest.fetcher({
            data: {
              ppmpId,
              blockId: block.id,
              costId: updatedCost.id,
              metadata: updatedCost,
            },
          })
        setPpmp(updatedPpmp)
        setShowDetailForm(false)
        setEditingCost(null)
        // Update local costs state
        setCosts((prev) =>
          prev.map((c) => (c.id === updatedCost.id ? updatedCost : c)),
        )
        toast.success('Cost metadata updated.')
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to save metadata.',
        )
      } finally {
        setIsSavingMetadata(false)
      }
    },
    [ppmpId, block.id, setPpmp],
  )

  const handleDeleteCost = useCallback(
    async (costId: string) => {
      const updatedCosts = costs.filter((c) => c.id !== costId)
      await persistCosts(updatedCosts)
    },
    [costs, persistCosts],
  )

  const handleAddCustomCost = useCallback(
    async (cost: NonProcurableCost) => {
      setShowCustomCostDialog(false)
      setShowNewCostRow(true)
      await persistCosts([...costs, cost])
    },
    [costs, persistCosts],
  )

  const handleSelectMasterCost = useCallback(
    async (item: CostItemMaster) => {
      if (
        costs.some(
          (cost) =>
            cost.isCustom === false &&
            cost.costItemName.trim().toLowerCase() ===
              item.costItemName.trim().toLowerCase() &&
            cost.standardUnitCost === item.standardUnitCost,
        )
      ) {
        toast.info(
          'That master cost item is already added to this Item of Expenditure block.',
        )
        return
      }

      const newCost: NonProcurableCost = {
        id: `cost-${Date.now()}`,
        costItemName: item.costItemName,
        standardUnitCost: item.standardUnitCost,
        totalCost: 0,
        monthlyAllocations: createEmptyMonthlyQuantities(),
        distributionPattern: 'custom',
        mop: null,
        isComplete: false,
        isCustom: false,
        isReadOnly: true,
        ...PPMP_METADATA_DEFAULTS,
      }

      setShowNewCostRow(true)
      await persistCosts([...costs, newCost])
    },
    [costs, persistCosts],
  )

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex items-stretch',
          isExpanded && 'border-b border-border',
        )}
      >
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex flex-1 items-center justify-between gap-4 px-4 py-3 text-left transition-colors',
            isExpanded ? 'rounded-tl-lg' : 'rounded-lg',
            'hover:bg-muted/30',
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col items-start gap-0.5 min-w-0">
              <span className="font-semibold text-sm text-foreground truncate max-w-xs">
                {block.ioEName}
              </span>
              <span className="text-xs text-muted-foreground ">
                {block.ioECode}
              </span>
            </div>
            <IoEBlockBadge
              isProcurable={block.isProcurable}
              className="whitespace-nowrap shrink-0"
            />
          </div>

          <div className="flex items-center gap-6 shrink-0 text-sm">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Budget Limit
              </span>
              <span className="font-medium text-foreground">
                {formatCurrency(block.budgetLimit)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Total Cost
              </span>
              <span
                className={cn(
                  'font-semibold',
                  block.isOverBudget
                    ? 'text-destructive'
                    : 'text-emerald-600 dark:text-emerald-400',
                )}
              >
                {formatCurrency(block.totalCost)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Items
              </span>
              <span className="font-medium">
                {block.isProcurable ? block.items.length : costs.length}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                isExpanded && 'rotate-180',
              )}
            />
          </div>
        </button>

        {!isReadOnly && (
          <div
            className={cn(
              'flex items-center pr-2',
              isExpanded ? 'rounded-tr-lg' : 'rounded-r-lg',
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isMutating}
              onClick={() => setShowDeleteDialog(true)}
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Item of Expenditure block</span>
            </Button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {block.isOverBudget && (
            <BudgetOverflowWarning
              overflow={overflow}
              totalCost={block.totalCost}
              budgetLimit={block.budgetLimit}
            />
          )}
          {block.isProcurable && (
            <>
              {block.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <PackageSearch className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No items added yet. Click "Add Items" to browse the catalog.
                  </p>
                </div>
              ) : (
                <ScrollArea className="">
                  <div className="overflow-x-auto rounded border border-border">
                    <table className="w-full text-sm min-w-[2100px]">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                          {!isReadOnly && (
                            <th className="px-2 py-2 text-center font-medium w-8">
                              <input
                                type="checkbox"
                                aria-label="Select all items"
                                checked={allSelected}
                                ref={(el) => {
                                  if (el) el.indeterminate = someSelected
                                }}
                                onChange={(e) =>
                                  handleSelectAll(e.target.checked)
                                }
                                className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                              />
                            </th>
                          )}
                          <th className="px-3 py-2 text-left font-medium min-w-[200px]">
                            Item / UoM
                          </th>
                          <th className="px-2 py-2 text-left font-medium whitespace-nowrap min-w-[160px]">
                            Activity Indicator
                          </th>
                          <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                            Project Type
                          </th>
                          <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                            {PPMP_FIELD_LABELS.quantityAndSize}
                          </th>
                          <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                            Pre-Proc
                          </th>
                          <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                            Start
                          </th>
                          <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                            End
                          </th>
                          <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                            Expected Delivery
                          </th>
                          <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                            Remarks
                          </th>
                          <th className="px-2 py-2 text-left font-medium whitespace-nowrap min-w-60">
                            Supporting Documents
                          </th>
                          <th className="px-3 py-2 text-right font-medium whitespace-nowrap">
                            Unit Price
                          </th>
                          {ALL_MONTHS.map((m) => (
                            <th
                              key={m}
                              className="px-1 py-2 text-center font-medium w-14"
                            >
                              {MONTH_LABELS[m]}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-right font-medium whitespace-nowrap">
                            Total Qty
                          </th>
                          <th className="px-3 py-2 text-right font-medium whitespace-nowrap">
                            Est. Budget
                          </th>
                          <th className="px-3 py-2 text-center font-medium whitespace-nowrap">
                            MoP
                          </th>
                          <th className="px-2 py-2 text-center font-medium whitespace-nowrap">
                            MSF Reference
                          </th>
                          {!isReadOnly && (
                            <th className="px-2 py-2 text-center font-medium w-16">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {block.items.map((item) => (
                          <ScheduleMatrixRow
                            key={item.id}
                            item={item}
                            ppmpId={ppmpId}
                            activityName={activityName}
                            onScheduleChange={onScheduleChange}
                            onDelete={onDeleteItem}
                            isReadOnly={isReadOnly}
                            isSelected={globalSelectedIds.has(item.id)}
                            onSelectChange={handleSelectItem}
                          />
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border bg-muted/20 font-semibold text-sm">
                          <td
                            colSpan={isReadOnly ? 22 : 23}
                            className="px-3 py-2 text-right text-muted-foreground"
                          >
                            Total:
                          </td>
                          <td
                            className={cn(
                              'px-3 py-2 text-right font-bold',
                              block.isOverBudget
                                ? 'text-destructive'
                                : 'text-emerald-600 dark:text-emerald-400',
                            )}
                          >
                            {formatCurrency(block.totalCost)}
                          </td>
                          <td colSpan={isReadOnly ? 3 : 4} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </>
          )}

          {!block.isProcurable && (
            <>
              <ScrollArea className="">
                <div className="overflow-x-auto rounded border border-border">
                  <table className="w-full text-sm min-w-[1500px]">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="px-3 py-2 text-left font-medium min-w-[180px]">
                          Cost Item
                        </th>
                        <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                          Expected Delivery
                        </th>
                        <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                          Remarks
                        </th>
                        <th className="px-2 py-2 text-left font-medium whitespace-nowrap min-w-60">
                          Supporting Documents
                        </th>
                        {/* NEW: Metadata Column Headers */}
                        <th className="px-2 py-2 text-center font-medium whitespace-nowrap">
                          Project Type
                        </th>
                        <th className="px-2 py-2 text-left font-medium whitespace-nowrap min-w-[200px]">
                          {PPMP_FIELD_LABELS.quantityAndSize}
                        </th>
                        <th className="px-2 py-2 text-center font-medium whitespace-nowrap">
                          Pre-Proc Conf
                        </th>
                        <th className="px-2 py-2 text-center font-medium whitespace-nowrap">
                          Procurement Period
                        </th>
                        <th className="px-2 py-2 text-center font-medium whitespace-nowrap">
                          MSF Ref
                        </th>
                        {ALL_MONTHS.map((m) => (
                          <th
                            key={m}
                            className="px-1 py-2 text-center font-medium w-16"
                          >
                            {MONTH_LABELS[m]}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-right font-medium whitespace-nowrap">
                          Total
                        </th>
                        <th className="px-3 py-2 text-center font-medium whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-2 py-2 text-center font-medium w-16">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {costs.length === 0 ? (
                        <tr>
                          <td colSpan={24} className="py-10">
                            <div className="flex flex-col items-center justify-center text-center gap-2">
                              <PackageSearch className="h-8 w-8 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                No cost items yet. Click "Add Cost" to start
                                entering.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        costs.map((cost) => (
                          <InlineNonProcurableCostRow
                            key={cost.id}
                            cost={cost}
                            onUpdate={handleUpdateCost}
                            onDelete={handleDeleteCost}
                            onEditMetadata={handleEditCostMetadata}
                            isNew={
                              showNewCostRow && cost === costs[costs.length - 1]
                            }
                            isReadOnly={isReadOnly}
                          />
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/20 font-semibold text-sm">
                        <td
                          colSpan={9}
                          className="px-3 py-2 text-left text-muted-foreground"
                        >
                          Block Total:
                        </td>
                        {ALL_MONTHS.map((m) => (
                          <td
                            key={m}
                            className="px-1 py-2 text-center font-bold text-foreground"
                          >
                            {formatCurrency(
                              costs.reduce(
                                (sum, c) =>
                                  sum + (c.monthlyAllocations[m] || 0),
                                0,
                              ),
                            )}
                          </td>
                        ))}
                        <td
                          colSpan={3}
                          className="px-3 py-2 text-right font-bold text-foreground"
                        >
                          {formatCurrency(
                            costs.reduce((sum, c) => sum + c.totalCost, 0),
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </>
          )}

          {!isReadOnly && block.isProcurable && (
            <div className="flex justify-between items-center pt-1">
              {selectedInBlock.length > 0 ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Scope the upcoming bulk link action to this IoE block
                      setTargetIoEBlockId(block.id)
                      setBulkLinkOpen(true)
                    }}
                    className="gap-1.5 border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {/* Show both the in-block count and the global selection size to avoid surprises */}
                    Bulk Link MSF ({selectedInBlock.length} in block
                    {globalSelectedIds.size !== selectedInBlock.length
                      ? ` / ${globalSelectedIds.size} total`
                      : ''}
                    )
                  </Button>
                </div>
              ) : (
                <span />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddItems}
                className="gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Items
              </Button>
            </div>
          )}

          {!isReadOnly && !block.isProcurable && (
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowMasterCostDialog(true)}
                className="gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add from Master List
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomCostDialog(true)}
                className="gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Custom Cost
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmAlertDialog
        open={showDeleteDialog}
        onOpenChange={(state) => {
          if (!state) setShowDeleteDialog(false)
        }}
        title="Delete Item of Expenditure block?"
        description={`"${block.ioEName}" and all nested items will be permanently deleted.`}
        onConfirm={async () => {
          await onDeleteBlock(block.id)
          setShowDeleteDialog(false)
        }}
        onCancel={() => setShowDeleteDialog(false)}
        confirmLabel={isMutating ? 'Deleting…' : 'Delete'}
        cancelLabel="Cancel"
        loading={isMutating}
      />

      <SelectCostItemDialog
        open={showMasterCostDialog}
        onOpenChange={setShowMasterCostDialog}
        onSelect={(item) => {
          void handleSelectMasterCost(item)
        }}
      />

      <AddNonProcurableCostDialog
        open={showCustomCostDialog}
        budgetLimit={block.budgetLimit}
        onOpenChange={setShowCustomCostDialog}
        onSubmit={(cost) => {
          void handleAddCustomCost(cost)
        }}
      />

      <NonProcurableCostDetailForm
        cost={editingCost}
        isOpen={showDetailForm}
        isSaving={isSavingMetadata}
        onClose={() => {
          setShowDetailForm(false)
          setEditingCost(null)
        }}
        onSave={async (updatedCost) => {
          await handleSaveCostMetadata(updatedCost)
        }}
      />

      {/* NOTE: LinkScopingFormModal was intentionally removed from here.
        Render LinkScopingFormModal once at a higher-level container
        (e.g. the PPMP workspace page) to avoid mounting multiple instances
        when IoeBlockAccordion is instantiated per block. */}
    </TooltipProvider>
  )
}
