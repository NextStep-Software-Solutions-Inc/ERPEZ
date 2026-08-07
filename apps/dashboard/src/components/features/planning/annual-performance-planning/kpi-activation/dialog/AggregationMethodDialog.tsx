/**
 * Aggregation Method Dialog
 * Step 2: Configure activated KPIs - Select/Edit aggregation method
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export type AggregationMethod =
  | 'Sum'
  | 'Average'
  | 'Minimum'
  | 'Maximum'
  | 'Percentage'
  | 'Other'

interface AggregationMethodDialogProps {
  isOpen: boolean
  title?: string
  currentMethod?: string
  defaultMethod?: string
  description?: string
  onClose: () => void
  onConfirm: (method: AggregationMethod) => void
}

const AGGREGATION_METHODS: { value: AggregationMethod; label: string; description: string }[] = [
  {
    value: 'Sum',
    label: 'Sum',
    description: 'Total of all values',
  },
  {
    value: 'Average',
    label: 'Average',
    description: 'Mean of all values',
  },
  {
    value: 'Minimum',
    label: 'Minimum',
    description: 'Lowest value',
  },
  {
    value: 'Maximum',
    label: 'Maximum',
    description: 'Highest value',
  },
  {
    value: 'Percentage',
    label: 'Percentage',
    description: 'Percentage calculation',
  },
  {
    value: 'Other',
    label: 'Other',
    description: 'Custom aggregation',
  },
]

export function AggregationMethodDialog({
  isOpen,
  title = 'Select Aggregation Method',
  currentMethod,
  defaultMethod,
  description,
  onClose,
  onConfirm,
}: AggregationMethodDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<AggregationMethod>(
    (currentMethod as AggregationMethod) || 'Average'
  )

  const handleConfirm = () => {
    onConfirm(selectedMethod)
    onClose()
  }

  const selected = AGGREGATION_METHODS.find((m) => m.value === selectedMethod)

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current/Default Methods Display */}
          {(currentMethod || defaultMethod) && (
            <div className="space-y-3">
              {currentMethod && (
                <div>
                  <Label className="text-xs font-medium text-gray-600">
                    Current Method
                  </Label>
                  <Badge className="mt-1">{currentMethod}</Badge>
                </div>
              )}
              {defaultMethod && currentMethod !== defaultMethod && (
                <div>
                  <Label className="text-xs font-medium text-gray-600">
                    Default Method
                  </Label>
                  <Badge variant="outline" className="mt-1">
                    {defaultMethod}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Method Selection */}
          <div className="space-y-3">
            <Label htmlFor="method" className="text-sm font-medium">
              Aggregation Method
            </Label>
            <Select value={selectedMethod} onValueChange={(val) => setSelectedMethod(val as AggregationMethod)}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGGREGATION_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex flex-col">
                      <span>{method.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Method Description */}
          {selected && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-900">{selected.description}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} className="bg-purple-600 hover:bg-purple-700">
            Apply Method
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
