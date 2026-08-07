/**
 * Budget Allocation Dialog
 * Dialog for editing budget allocations for offices
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { BudgetAllocation } from '../mocks'

interface BudgetAllocationDialogProps {
  open: boolean
  allocation?: BudgetAllocation | null
  onOpenChange: (open: boolean) => void
  onSave: (allocation: BudgetAllocation) => void
}

export function BudgetAllocationDialog({
  open,
  allocation,
  onOpenChange,
  onSave,
}: BudgetAllocationDialogProps) {
  const [formData, setFormData] = useState<Partial<BudgetAllocation>>(
    allocation || {
      allocatedBudget: 0,
      notes: '',
    }
  )

  const handleSave = () => {
    if (allocation && formData.allocatedBudget !== undefined) {
      onSave({
        ...allocation,
        allocatedBudget: formData.allocatedBudget,
        notes: formData.notes || '',
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Budget Allocation</DialogTitle>
          <DialogDescription>
            Adjust the budget allocation for {allocation?.officeName} - {allocation?.kpiCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Office Name (Read-only) */}
          <div>
            <label className="text-sm font-medium text-gray-700">Office</label>
            <Input
              type="text"
              value={allocation?.officeName || ''}
              disabled
              className="mt-1"
            />
          </div>

          {/* KPI Details (Read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">KPI Code</label>
              <Input
                type="text"
                value={allocation?.kpiCode || ''}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Base Target</label>
              <Input
                type="number"
                value={allocation?.baseTarget || ''}
                disabled
                className="mt-1"
              />
            </div>
          </div>

          {/* Allocated Budget */}
          <div>
            <label className="text-sm font-medium text-gray-700">Allocated Budget</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.allocatedBudget ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allocatedBudget: e.target.value === '' ? 0 : Number(e.target.value),
                })
              }
              disabled={allocation?.isLocked}
              className="mt-1"
              placeholder="0.00"
            />
          </div>

          {/* Quarterly Distribution */}
          <div className="grid grid-cols-4 gap-2">
            {['q1', 'q2', 'q3', 'q4'].map((quarter) => (
              <div key={quarter}>
                <label className="text-xs font-medium text-gray-700">{quarter.toUpperCase()}</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    formData[quarter as 'q1' | 'q2' | 'q3' | 'q4'] ?? ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [quarter]: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  disabled={allocation?.isLocked}
                  className="mt-1 text-xs"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={allocation?.isLocked}
              className="mt-1"
              placeholder="Add notes about this allocation..."
              rows={3}
            />
          </div>

          {allocation?.isLocked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs text-yellow-800">
                This allocation is locked. Unlock it from the table to make changes.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={allocation?.isLocked}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
