/**
 * BulkAdjustmentPanel
 * Right-side Sheet workspace for applying bulk price adjustments to selected items.
 * Opens when user clicks "Bulk Adjust" from the top toolbar.
 */

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TrendingUp } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { BulkAdjustmentForm } from '../forms/BulkAdjustmentForm'
import { AdjustmentPreviewTable } from './AdjustmentPreviewTable'
import { ImpactSummary } from './ImpactSummary'
import { applyBulkAdjustmentRequest } from '../handlers/applyBulkAdjustmentRequest'
import {
  bulkAdjustmentPanelOpenAtom,
  bulkAdjustmentPreviewAtom,
  bulkAdjustmentPreviewLoadingAtom,
} from '../atoms/bulkAdjustmentAtom'
import {
  catalogRowSelectionAtom,
  selectedCountAtom,
} from '../atoms/catalogTableAtom'
import type { BulkAdjustmentFormValues } from '../forms/BulkAdjustmentForm'
import type { BulkAdjustmentPayload } from '../types'

export function BulkAdjustmentPanel() {
  const [open, setOpen] = useAtom(bulkAdjustmentPanelOpenAtom)
  const [preview, setPreview] = useAtom(bulkAdjustmentPreviewAtom)
  const setPreviewLoading = useSetAtom(bulkAdjustmentPreviewLoadingAtom)
  const rowSelection = useAtomValue(catalogRowSelectionAtom)
  const selectedCount = useAtomValue(selectedCountAtom)
  const queryClient = useQueryClient()

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])

  const applyMutation = useMutation({
    mutationFn: (payload: BulkAdjustmentPayload) =>
      applyBulkAdjustmentRequest.fetcher({ payload }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['catalog-master'] })
      setOpen(false)
      setPreview(null)
      toast.success(
        `Bulk adjustment applied — ${result.totalAffected} items updated.`,
      )
    },
    onError: () => {
      toast.error('Failed to apply bulk adjustment.')
    },
  })

  const buildPayload = (
    data: BulkAdjustmentFormValues,
  ): BulkAdjustmentPayload => ({
    mode: data.mode,
    adjustmentPercent: data.adjustmentPercent,
    reason: data.reason,
    ...(data.mode === 'selected'
      ? { itemIds: selectedIds }
      : { category: data.category }),
  })

  const handlePreview = async (data: BulkAdjustmentFormValues) => {
    setPreviewLoading(true)
    try {
      // Compute preview without persisting — simulate by running the fetcher
      // on a snapshot (we pass a negative timeout so it doesn't mutate).
      // Actually we just call the handler which modifies mock data, so we
      // need a read-only preview. For mock: compute manually.
      const { getMockNonCseItems } = await import('../utils/catalogMockData')
      const items = getMockNonCseItems()
      const multiplier = 1 + data.adjustmentPercent / 100
      const targets =
        data.mode === 'selected'
          ? items.filter((i) => selectedIds.includes(i.id))
          : items.filter(
              (i) => i.category === data.category && i.status === 'active',
            )

      const previewItems = targets.map((item) => {
        const newPrice = Math.round(item.currentPrice * multiplier * 100) / 100
        return {
          id: item.id,
          itemCode: item.itemCode,
          name: item.name,
          category: item.category,
          oldPrice: item.currentPrice,
          newPrice,
          delta: newPrice - item.currentPrice,
        }
      })

      const totalDelta = previewItems.reduce((s, i) => s + i.delta, 0)
      setPreview({
        items: previewItems,
        totalAffected: previewItems.length,
        totalDelta: Math.round(totalDelta * 100) / 100,
      })
    } catch (error) {
      // Ensure we don't show stale or partial preview data if something fails.
      setPreview(null)
      toast.error('Failed to generate preview.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleApply = (data: BulkAdjustmentFormValues) => {
    applyMutation.mutate(buildPayload(data))
  }

  const handleClose = () => {
    setOpen(false)
    setPreview(null)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[600px] sm:max-w-[600px] overflow-y-auto flex flex-col gap-0 p-0"
      >
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base">
                Bulk Price Adjustment
              </SheetTitle>
              <SheetDescription className="text-xs">
                Adjust prices for multiple catalog items at once.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Form */}
          <BulkAdjustmentForm
            defaultMode={selectedCount > 0 ? 'selected' : 'category'}
            selectedCount={selectedCount}
            onPreview={handlePreview}
            onApply={handleApply}
            isApplying={applyMutation.isPending}
          />

          {/* Preview results */}
          {preview && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Preview</h4>
                <ImpactSummary preview={preview} />
                {preview.items.length > 0 && (
                  <AdjustmentPreviewTable items={preview.items} />
                )}
                {preview.items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items matched the adjustment criteria.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
