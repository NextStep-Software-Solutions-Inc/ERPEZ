/**
 * ActivityBlockAccordion
 * Collapsible accordion wrapper for a single PPMP Activity block.
 * Collapse state is managed via expandedActivityBlocksAtom for global toggle support.
 */

import { useState } from 'react'
import { useAtom } from 'jotai'
import { AlertTriangle, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '../lib/ppmpUtils'
import { expandedActivityBlocksAtom } from '../atoms'
import { AddIoEBlockDialog } from '../dialogs/AddIoEBlockDialog'
import { IoeBlockAccordion } from './IoeBlockAccordion'
import type { Month, PPMP, PPMPActivityBlock } from '../types'
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { cn } from '@/lib/utils'

interface ActivityBlockAccordionProps {
  ppmp: PPMP
  activity: PPMPActivityBlock
  onScheduleChange: (itemId: string, month: Month, value: number) => void
  onDeleteItem: (itemId: string) => void
  onDeleteActivity: (activityId: string) => Promise<void> | void
  onDeleteIoEBlock: (blockId: string) => Promise<void> | void
  isMutating?: boolean
  isReadOnly?: boolean
  contentRef?: (el: HTMLDivElement | null) => void
}

export function ActivityBlockAccordion({
  ppmp,
  activity,
  onScheduleChange,
  onDeleteItem,
  onDeleteActivity,
  onDeleteIoEBlock,
  isMutating = false,
  isReadOnly = false,
  contentRef,
}: ActivityBlockAccordionProps) {
  const [expandedBlocks, setExpandedBlocks] = useAtom(
    expandedActivityBlocksAtom,
  )
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddIoEDialog, setShowAddIoEDialog] = useState(false)
  const isExpanded = expandedBlocks.has(activity.id)

  const isOverBudget = activity.ioEBlocks.some((b) => b.isOverBudget)
  const procurableBlocks = activity.ioEBlocks.filter(
    (block) => block.isProcurable,
  )
  const nonProcurableBlocks = activity.ioEBlocks.filter(
    (block) => !block.isProcurable,
  )

  const toggle = () => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev)
      if (next.has(activity.id)) {
        next.delete(activity.id)
      } else {
        next.add(activity.id)
      }
      return next
    })
  }

  return (
    <div
      ref={contentRef}
      className={cn(
        'rounded-xl border bg-white shadow-sm transition-colors scroll-mt-32',
        isOverBudget ? 'border-destructive/50' : 'border-border',
      )}
    >
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
            isExpanded ? 'rounded-tl-xl' : 'rounded-xl',
            'hover:bg-muted/30',
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {isOverBudget && (
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <div className="min-w-0">
              <h2 className="font-semibold text-sm text-foreground leading-tight truncate">
                {activity.activityName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0 text-sm">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Total
              </span>
              <span
                className={cn(
                  'font-semibold',
                  isOverBudget
                    ? 'text-destructive'
                    : 'text-emerald-600 dark:text-emerald-400',
                )}
              >
                {formatCurrency(activity.totalCost)}
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
              isExpanded ? 'rounded-tr-xl' : 'rounded-r-xl',
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isMutating}
              onClick={() => setShowAddIoEDialog(true)}
              className="h-8 gap-1.5 px-3 text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item of Expenditure</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isMutating}
              onClick={() => setShowDeleteDialog(true)}
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete activity</span>
            </Button>
          </div>
        )}
      </div>

      {/* ─── IoE Block List (collapsible content) ────────────────────────────── */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {procurableBlocks.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Procurable
                </h3>
              </div>
              <div className="space-y-2">
                {procurableBlocks.map((block) => (
                  <IoeBlockAccordion
                    key={block.id}
                    block={block}
                    ppmpId={ppmp.id}
                    activityName={activity.activityName}
                    onScheduleChange={onScheduleChange}
                    onDeleteItem={onDeleteItem}
                    onDeleteBlock={onDeleteIoEBlock}
                    isMutating={isMutating}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            </section>
          )}

          {nonProcurableBlocks.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Non-procurable
                </h3>
              </div>
              <div className="space-y-2">
                {nonProcurableBlocks.map((block) => (
                  <IoeBlockAccordion
                    key={block.id}
                    block={block}
                    ppmpId={ppmp.id}
                    activityName={activity.activityName}
                    onScheduleChange={onScheduleChange}
                    onDeleteItem={onDeleteItem}
                    onDeleteBlock={onDeleteIoEBlock}
                    isMutating={isMutating}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <ConfirmAlertDialog
        open={showDeleteDialog}
        onOpenChange={(state) => {
          if (!state) setShowDeleteDialog(false)
        }}
        title="Delete activity?"
        description={`"${activity.activityName}" and all nested Item of Expenditure blocks and line items will be permanently deleted.`}
        onConfirm={async () => {
          await onDeleteActivity(activity.id)
          setShowDeleteDialog(false)
        }}
        onCancel={() => setShowDeleteDialog(false)}
        confirmLabel={isMutating ? 'Deleting…' : 'Delete'}
        cancelLabel="Cancel"
        loading={isMutating}
      />

      <AddIoEBlockDialog
        ppmp={ppmp}
        activity={activity}
        open={showAddIoEDialog}
        onOpenChange={setShowAddIoEDialog}
        onSuccess={() => setShowAddIoEDialog(false)}
      />
    </div>
  )
}
