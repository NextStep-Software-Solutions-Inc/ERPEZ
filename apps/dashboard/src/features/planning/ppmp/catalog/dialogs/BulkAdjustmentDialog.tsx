/**
 * BulkAdjustmentDialog
 * Adjust prices for multiple catalog items using percentage increase/decrease
 */

import { useState } from 'react'
import { useAtom } from 'jotai'
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

import { catalogItemsAtom } from '../atoms/catalogAtoms'

interface BulkAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItemIds: string[]
  onClose: () => void
}

export function BulkAdjustmentDialog({
  open,
  onOpenChange,
  selectedItemIds,
  onClose,
}: BulkAdjustmentDialogProps) {
  const [catalogItems, setCatalogItems] = useAtom(catalogItemsAtom)
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>(
    'increase',
  )
  const [percentage, setPercentage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedItems = catalogItems.filter((item) =>
    selectedItemIds.includes(item.id),
  )

  // Calculate new prices
  const newPrices = selectedItems.map((item) => {
    const numPercentage = parseFloat(percentage) || 0
    const multiplier =
      adjustmentType === 'increase'
        ? 1 + numPercentage / 100
        : 1 - numPercentage / 100
    const newPrice = Math.max(0, item.currentPrice * multiplier)
    return {
      itemId: item.id,
      itemName: item.name,
      oldPrice: item.currentPrice,
      newPrice: Math.round(newPrice * 100) / 100, // Round to 2 decimals
      change: newPrice - item.currentPrice,
    }
  })

  const totalOldValue = newPrices.reduce((sum, p) => sum + p.oldPrice, 0)
  const totalNewValue = newPrices.reduce((sum, p) => sum + p.newPrice, 0)

  const handleApply = async () => {
    if (!percentage || parseFloat(percentage) === 0) {
      toast.error('Please enter a valid percentage')
      return
    }

    try {
      setIsSubmitting(true)

      setCatalogItems((prev) =>
        prev.map((item) => {
          const newPriceData = newPrices.find((p) => p.itemId === item.id)
          return newPriceData
            ? { ...item, currentPrice: newPriceData.newPrice }
            : item
        }),
      )

      toast.success(
        `Price adjusted for ${selectedItemIds.length} item${selectedItemIds.length !== 1 ? 's' : ''}`,
        { duration: 4000 },
      )

      setPercentage('')
      setAdjustmentType('increase')
      onOpenChange(false)
      onClose()
    } catch (error) {
      toast.error('Failed to apply price adjustment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Price Adjustment</DialogTitle>
          <DialogDescription>
            Adjust prices for {selectedItemIds.length} selected item
            {selectedItemIds.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Adjustment Controls */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <Select
                  value={adjustmentType}
                  onValueChange={(v: 'increase' | 'decrease') => setAdjustmentType(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase" className="gap-2">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Increase
                      </span>
                    </SelectItem>
                    <SelectItem value="decrease">
                      <span className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" /> Decrease
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">Percentage (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  placeholder="0.00"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  disabled={isSubmitting}
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <p className="text-sm font-medium">Price Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total Current Value:
                </span>
                <span className="font-semibold">
                  ₱
                  {totalOldValue.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total New Value:</span>
                <span
                  className={`font-semibold ${
                    totalNewValue > totalOldValue
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  ₱
                  {totalNewValue.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-muted-foreground">Total Change:</span>
                <span
                  className={`font-semibold ${
                    totalNewValue > totalOldValue
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {totalNewValue > totalOldValue ? '+' : ''}₱
                  {(totalNewValue - totalOldValue).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Price Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Item Price Changes</p>
            <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border border-border p-3">
              {newPrices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No items selected
                </p>
              ) : (
                newPrices.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between text-xs border-b border-border/50 pb-2 last:border-0"
                  >
                    <span className="flex-1 truncate">{item.itemName}</span>
                    <div className="ml-2 text-right">
                      <span className="line-through text-muted-foreground">
                        ₱
                        {item.oldPrice.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="ml-2 font-semibold">
                        ₱
                        {item.newPrice.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              This action will update prices for all selected items. This change
              cannot be undone directly.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={isSubmitting || !percentage}
            className="gap-2"
          >
            {isSubmitting ? 'Applying...' : 'Apply Adjustment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
